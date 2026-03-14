"use client"

import type React from "react"

import { useState, useRef } from "react"
import Image from "next/image"
import { supabase} from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Upload, X, Star, Video } from "lucide-react"
import type { MediaItem } from "@/lib/types"

interface MediaUploaderProps {
  media: MediaItem[]
  onChange: (media: MediaItem[]) => void
  featuredImage: string | null
  onFeaturedChange: (url: string) => void
  videoUrl?: string | null
  onVideoChange?: (url: string) => void
  videos?: string[]
  onVideosChange?: (urls: string[]) => void
  maxImages?: number
}

export function MediaUploader({ media, onChange, featuredImage, onFeaturedChange, videoUrl, onVideoChange, videos = [], onVideosChange, maxImages }: MediaUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabases = supabase
  const BUCKET = process.env.NEXT_PUBLIC_SUPABASE_MEDIA_BUCKET || "media"

  const uploadSingleFile = async (file: File): Promise<{ publicUrl: string; kind: "image" | "video" } | null> => {
    const validTypes = ["image/jpeg", "image/png", "image/webp", "video/mp4", "video/webm"]
    if (!validTypes.includes(file.type)) return null
    const isImage = file.type.startsWith("image/")
    const maxBytes = isImage ? 20 * 1024 * 1024 : 50 * 1024 * 1024
    if (file.size > maxBytes) return null
    const fileExt = file.name.split(".").pop()
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
    const filePath = `articles/${fileName}`
    const { error } = await supabases.storage.from(BUCKET).upload(filePath, file, { cacheControl: "3600", upsert: false })
    if (error) return null
    const { data: { publicUrl } } = supabases.storage.from(BUCKET).getPublicUrl(filePath)
    return { publicUrl, kind: isImage ? "image" : "video" }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // Check authentication - use getSession which is more reliable
    // Note: This is a non-blocking check since the page already ensures authentication
    // If auth check fails, we proceed anyway and let storage RLS handle authorization
    try {
      const { data: session } = await supabases.auth.getSession()
      if (!session?.session?.user) {
        // Try getUser as fallback
        const { data: auth } = await supabases.auth.getUser()
        if (!auth?.user) {
          // Only warn, don't block - the page should already ensure auth
          console.warn("No active session found, but proceeding with upload")
        }
      }
    } catch (err) {
      // Non-blocking: proceed with upload and let storage handle auth errors
      console.warn("Auth check failed, proceeding anyway:", err)
    }

    // Ensure bucket exists (server will create if missing)
    try {
      const response = await fetch("/api/storage/ensure-bucket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bucket: BUCKET, public: true }),
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        throw new Error(errorData.error || `Failed to ensure bucket: ${response.statusText}`)
      }
      
      const result = await response.json()
      if (!result.ok) {
        throw new Error(result.error || "Failed to ensure bucket exists")
      }
    } catch (err) {
      console.error("Failed to ensure bucket exists:", err)
      alert(`Failed to prepare storage: ${err instanceof Error ? err.message : "Unknown error"}`)
      setUploading(false)
      return
    }

    setUploading(true)

    let imageCount = media.filter(m => m.type === "image").length
    for (const file of Array.from(files)) {
      // Validate file type
      const validTypes = ["image/jpeg", "image/png", "image/webp", "video/mp4", "video/webm"]
      if (!validTypes.includes(file.type)) {
        alert(`Invalid file type: ${file.name}. Only images and videos are allowed.`)
        continue
      }

      // Validate file size (images 20MB, videos 50MB)
      const isImage = file.type.startsWith("image/")
      const maxBytes = isImage ? 20 * 1024 * 1024 : 50 * 1024 * 1024
      if (file.size > maxBytes) {
        alert(`File too large: ${file.name}. Maximum size is ${isImage ? '20MB for images' : '50MB for videos'}.`)
        continue
      }

      // Enforce optional image cap
      if (isImage && typeof maxImages === 'number' && imageCount >= maxImages) {
        alert(`Image limit reached (${maxImages}). Remove some images before adding more.`)
        continue
      }

      try {
        // Create unique filename
        const fileExt = file.name.split(".").pop()
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
        const filePath = `articles/${fileName}`

        // Upload to Supabase Storage
        const { data, error } = await supabases.storage.from(BUCKET).upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        })

        if (error) {
          if (error.message?.includes("Bucket not found") || error.message?.includes("bucket")) {
            throw new Error(`Storage bucket "${BUCKET}" not found. Please ensure the bucket exists in your Supabase project.`)
          }
          if (error.message?.includes("row-level security") || error.message?.includes("RLS") || error.message?.includes("policy")) {
            throw new Error(`Permission denied: You don't have permission to upload files. Please contact an administrator to set up storage permissions.`)
          }
          throw error
        }

        // Get public URL
        const {
          data: { publicUrl },
        } = supabases.storage.from(BUCKET).getPublicUrl(filePath)

        // Add to media array
        const newMediaItem: MediaItem = {
          url: publicUrl,
          type: file.type.startsWith("image/") ? "image" : "video",
          alt: file.name,
          isFeatured: media.length === 0, // First image is featured by default
        }

        const updatedMedia = [...media, newMediaItem]
        onChange(updatedMedia)

        // Set as featured if it's the first image
        if (media.length === 0 && newMediaItem.type === "image") {
          onFeaturedChange(publicUrl)
        }
        // Track videos array and primary video
        if (newMediaItem.type === "video") {
          if (Array.isArray(videos) && typeof onVideosChange === 'function') {
            onVideosChange([...(videos || []), publicUrl])
          }
          if (typeof onVideoChange === 'function' && !videoUrl) {
            onVideoChange(publicUrl)
          }
        }

        if (isImage) imageCount += 1
        
        // Show success message
        setUploadSuccess(`Successfully uploaded ${file.name}`)
        setTimeout(() => setUploadSuccess(null), 3000)
      } catch (error) {
        console.error("Upload error:", error)
        const errorMsg = error instanceof Error ? error.message : `Failed to upload ${file.name}`
        alert(errorMsg)
      }
    }

    setUploading(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const removeMedia = (index: number) => {
    const updatedMedia = media.filter((_, i) => i !== index)
    onChange(updatedMedia)

    // If removed item was featured, set first image as featured
    if (media[index].url === featuredImage && updatedMedia.length > 0) {
      const firstImage = updatedMedia.find((m) => m.type === "image")
      if (firstImage) {
        onFeaturedChange(firstImage.url)
      }
    }
    // If removed item was the selected video, clear selection
    if (videoUrl && media[index].url === videoUrl && typeof onVideoChange === 'function') {
      onVideoChange("")
    }
  }

  const setFeatured = (url: string) => {
    onFeaturedChange(url)
    const updatedMedia = media.map((m) => ({
      ...m,
      isFeatured: m.url === url,
    }))
    onChange(updatedMedia)
  }

  return (
    <div className="space-y-4">
      <div>
        <Label>Media Upload</Label>
        <p className="text-sm text-slate-600 mt-1">
          Upload images (max 20MB) and videos (max 50MB). Click the star to set featured image.
        </p>
      </div>

      {/* Upload Button */}
      <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-slate-400 transition-colors">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          id="media-upload"
        />
        <label htmlFor="media-upload" className="cursor-pointer">
          <Upload className="h-10 w-10 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-700">Click to upload or drag and drop</p>
          <p className="text-xs text-slate-500 mt-1">Images: JPEG, PNG, WebP (≤20MB) • Videos: MP4, WebM (≤50MB)</p>
        </label>
      </div>

      <div className="flex flex-col gap-3">
        <div className="border rounded-lg p-3 text-center">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={async (e) => {
              const f = e.target.files?.[0]
              if (!f) return
              setUploading(true)
              const ensured = await fetch("/api/storage/ensure-bucket", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bucket: BUCKET, public: true }) })
              if (!ensured.ok) { setUploading(false); return }
              const uploaded = await uploadSingleFile(f)
              if (uploaded && uploaded.kind === "image") {
                const newItem: MediaItem = { url: uploaded.publicUrl, type: "image", alt: f.name, isFeatured: true }
                const updated = [{ ...newItem }, ...media.map(m => ({ ...m, isFeatured: false }))]
                onChange(updated)
                onFeaturedChange(uploaded.publicUrl)
                setUploadSuccess(`Successfully uploaded ${f.name}`)
                setTimeout(() => setUploadSuccess(null), 3000)
              }
              setUploading(false)
              ;(e.target as HTMLInputElement).value = ""
            }}
            className="hidden"
            id="featured-image-upload"
          />
          <label htmlFor="featured-image-upload" className="cursor-pointer inline-block">
            <p className="text-sm font-medium text-slate-700">Upload Featured Image</p>
            <p className="text-xs text-slate-500">JPEG, PNG, WebP</p>
          </label>
        </div>
        <div className="border rounded-lg p-3 text-center">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={async (e) => {
              const files = Array.from(e.target.files || [])
              if (files.length === 0) return
              setUploading(true)
              const ensured = await fetch("/api/storage/ensure-bucket", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bucket: BUCKET, public: true }) })
              if (!ensured.ok) { setUploading(false); return }
              let updated = [...media]
              let imageCount = updated.filter(m => m.type === "image").length
              for (const f of files) {
                const uploaded = await uploadSingleFile(f)
                if (uploaded && uploaded.kind === "image") {
                  if (typeof maxImages === 'number' && imageCount >= maxImages) { continue }
                  const item: MediaItem = { url: uploaded.publicUrl, type: "image", alt: f.name, isFeatured: updated.length === 0 }
                  updated = [...updated, item]
                  imageCount += 1
                }
              }
              onChange(updated)
              if (!featuredImage) {
                const first = updated.find(m => m.type === "image")
                if (first) onFeaturedChange(first.url)
              }
              setUploading(false)
              ;(e.target as HTMLInputElement).value = ""
            }}
            className="hidden"
            id="gallery-images-upload"
          />
          <label htmlFor="gallery-images-upload" className="cursor-pointer inline-block">
            <p className="text-sm font-medium text-slate-700">Upload Other Images</p>
            <p className="text-xs text-slate-500">Multiple allowed</p>
          </label>
        </div>
        <div className="border rounded-lg p-3 text-center">
          <input
            type="file"
            accept="video/mp4,video/webm"
            onChange={async (e) => {
              const f = e.target.files?.[0]
              if (!f) return
              setUploading(true)
              const ensured = await fetch("/api/storage/ensure-bucket", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bucket: BUCKET, public: true }) })
              if (!ensured.ok) { setUploading(false); return }
              const uploaded = await uploadSingleFile(f)
              if (uploaded && uploaded.kind === "video") {
                if (typeof onVideosChange === 'function') onVideosChange([...(videos || []), uploaded.publicUrl])
                if (typeof onVideoChange === 'function' && !videoUrl) onVideoChange(uploaded.publicUrl)
                setUploadSuccess(`Successfully uploaded ${f.name}`)
                setTimeout(() => setUploadSuccess(null), 3000)
              }
              setUploading(false)
              ;(e.target as HTMLInputElement).value = ""
            }}
            className="hidden"
            id="video-upload"
          />
          <label htmlFor="video-upload" className="cursor-pointer inline-block">
            <p className="text-sm font-medium text-slate-700">Upload Video</p>
            <p className="text-xs text-slate-500">MP4, WebM</p>
          </label>
        </div>
      </div>

      {/* Media Grid */}
      {media.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {media.map((item, index) => (
            <div key={index} className="relative group rounded-lg overflow-hidden border-2 border-slate-200">
              {item.type === "image" ? (
                <Image
                  src={item.url || "/placeholder.svg"}
                  alt={item.alt || "Uploaded media"}
                  width={640}
                  height={320}
                  loading="lazy"
                  unoptimized
                  className="w-full h-40 object-cover cursor-zoom-in"
                  onClick={() => {
                    if (item.url) window.open(item.url, "_blank")
                  }}
                />
              ) : (
                <div className="w-full bg-black">
                  <video src={item.url} className="w-full h-40 object-cover" controls muted playsInline loop />
                </div>
              )}

              {/* Overlay Controls */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {item.type === "image" && (
                  <Button
                    type="button"
                    size="sm"
                    variant={item.url === featuredImage ? "default" : "secondary"}
                    onClick={() => setFeatured(item.url)}
                    className="h-8 w-8 p-0"
                  >
                    <Star className={`h-4 w-4 ${item.url === featuredImage ? "fill-current" : ""}`} />
                  </Button>
                )}
                {item.type === "video" && typeof (onVideoChange as any) === 'function' && (
                  <Button
                    type="button"
                    size="sm"
                    variant={(videoUrl as any) === item.url ? "default" : "secondary"}
                    onClick={() => (onVideoChange as any)(item.url)}
                    className="h-8 px-2"
                  >
                    Set Video
                  </Button>
                )}
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={() => removeMedia(index)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Featured Badge */}
              {item.url === featuredImage && (
                <div className="absolute top-2 left-2 bg-orange-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <Star className="h-3 w-3 fill-current" />
                  Featured
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {uploading && (
        <div className="text-center text-sm text-slate-600 p-2 bg-blue-50 rounded">
          <Upload className="h-4 w-4 inline mr-2 animate-pulse" />
          Uploading...
        </div>
      )}
      
      {uploadSuccess && (
        <div className="text-center text-sm text-green-700 p-2 bg-green-50 rounded border border-green-200">
          ✓ {uploadSuccess}
        </div>
      )}

      {Array.isArray(videos) && videos.length > 0 && (
        <div className="space-y-2">
          <Label>Videos</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {videos.map((v, i) => (
              <div key={`${v}-${i}`} className="relative rounded overflow-hidden border">
                <video src={v} className="w-full h-28 object-cover bg-black" controls={false} />
                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                  {typeof onVideoChange === 'function' && (
                    <Button type="button" size="sm" variant={videoUrl === v ? "default" : "secondary"} onClick={() => onVideoChange(v)}>Set Main</Button>
                  )}
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      if (typeof onVideosChange === 'function') {
                        const next = videos.filter((x) => x !== v)
                        onVideosChange(next)
                        if (videoUrl === v && typeof onVideoChange === 'function') onVideoChange("")
                      }
                    }}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
