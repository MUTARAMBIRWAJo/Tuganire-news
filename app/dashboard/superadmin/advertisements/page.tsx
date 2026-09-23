"use client"

import { useEffect, useRef, useState } from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Edit, Trash2, Image as ImageIcon, Video, Eye, MousePointerClick } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import { supabase } from "@/lib/supabaseClient"
import { ADVERTISEMENT_PLACEMENTS, type AdvertisementStatus } from "@/lib/advertisements"

interface Advertisement {
  id: string
  title: string
  description: string | null
  media_type: "image" | "video"
  media_url: string
  poster_url?: string | null
  mobile_media_url?: string | null
  advertiser_name?: string | null
  placement?: string
  priority?: number
  status?: AdvertisementStatus
  title_en?: string | null
  description_en?: string | null
  cta_text_en?: string | null
  title_rw?: string | null
  description_rw?: string | null
  cta_text_rw?: string | null
  link_url: string | null
  is_active: boolean
  display_order: number
  start_date: string | null
  end_date: string | null
  click_count: number
  view_count: number
  created_at: string
  storage_bucket?: string | null
  storage_path?: string | null
  media_mime?: string | null
  media_size?: number | null
}

export default function AdvertisementsPage() {
  const [ads, setAds] = useState<Advertisement[]>([])
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterPlacement, setFilterPlacement] = useState("all")
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    media_type: "image" as "image" | "video",
    media_url: "",
    poster_url: "",
    mobile_media_url: "",
    advertiser_name: "",
    placement: "HOME_BELOW_BREAKING_NEWS",
    priority: 0,
    status: "ACTIVE" as AdvertisementStatus,
    title_en: "",
    description_en: "",
    cta_text_en: "",
    title_rw: "",
    description_rw: "",
    cta_text_rw: "",
    storage_bucket: "",
    storage_path: "",
    media_mime: "",
    media_size: 0,
    link_url: "",
    is_active: true,
    display_order: 0,
    start_date: "",
    end_date: "",
  })
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const posterInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    fetchAds()
  }, [])

  const fetchAds = async () => {
    try {
      const response = await fetch("/api/admin/advertisements")
      if (!response.ok) throw new Error("Failed to fetch ads")
      const data = await response.json()
      setAds(data.ads || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load advertisements",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingAd
        ? `/api/admin/advertisements/${editingAd.id}`
        : "/api/admin/advertisements"
      const method = editingAd ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          start_date: formData.start_date || null,
          end_date: formData.end_date || null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to save advertisement")
      }

      toast({
        title: "Success",
        description: editingAd ? "Advertisement updated" : "Advertisement created",
      })

      setIsDialogOpen(false)
      setEditingAd(null)
      resetForm()
      fetchAds()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save advertisement",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this advertisement?")) return

    try {
      const response = await fetch(`/api/admin/advertisements/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete advertisement")

      toast({
        title: "Success",
        description: "Advertisement deleted",
      })

      fetchAds()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete advertisement",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (ad: Advertisement) => {
    setEditingAd(ad)
    setFormData({
      title: ad.title,
      description: ad.description || "",
      media_type: ad.media_type,
      media_url: ad.media_url,
      poster_url: ad.poster_url || "",
      mobile_media_url: ad.mobile_media_url || "",
      advertiser_name: ad.advertiser_name || "",
      placement: ad.placement || "HOME_BELOW_BREAKING_NEWS",
      priority: ad.priority || 0,
      status: ad.status || (ad.is_active ? "ACTIVE" : "PAUSED"),
      title_en: ad.title_en || ad.title,
      description_en: ad.description_en || ad.description || "",
      cta_text_en: ad.cta_text_en || "",
      title_rw: ad.title_rw || "",
      description_rw: ad.description_rw || "",
      cta_text_rw: ad.cta_text_rw || "",
      storage_bucket: ad.storage_bucket || "",
      storage_path: ad.storage_path || "",
      media_mime: ad.media_mime || "",
      media_size: ad.media_size || 0,
      link_url: ad.link_url || "",
      is_active: ad.is_active,
      display_order: ad.display_order,
      start_date: ad.start_date ? ad.start_date.split("T")[0] : "",
      end_date: ad.end_date ? ad.end_date.split("T")[0] : "",
    })
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      media_type: "image",
      media_url: "",
      poster_url: "",
      mobile_media_url: "",
      advertiser_name: "",
      placement: "HOME_BELOW_BREAKING_NEWS",
      priority: 0,
      status: "ACTIVE" as AdvertisementStatus,
      title_en: "",
      description_en: "",
      cta_text_en: "",
      title_rw: "",
      description_rw: "",
      cta_text_rw: "",
      storage_bucket: "",
      storage_path: "",
      media_mime: "",
      media_size: 0,
      link_url: "",
      is_active: true,
      display_order: 0,
      start_date: "",
      end_date: "",
    })
    setEditingAd(null)
  }

  const visibleAds = ads.filter((ad) =>
    (filterStatus === "all" || (ad.status || (ad.is_active ? "ACTIVE" : "PAUSED")) === filterStatus) &&
    (filterPlacement === "all" || ad.placement === filterPlacement)
  )

  const ensureBucket = async (bucket: string) => {
    const res = await fetch("/api/storage/ensure-bucket", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bucket, public: true }),
    })
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      throw new Error(j.error || "Failed to ensure storage bucket")
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, target: "media" | "poster" = "media") => {
    const file = e.target.files?.[0]
    if (!file) return
    const validMedia = target === "poster"
      ? ["image/jpeg", "image/png", "image/webp"]
      : formData.media_type === "image"
        ? ["image/jpeg", "image/png", "image/webp", "image/gif"]
        : ["video/mp4", "video/webm"]
    if (!validMedia.includes(file.type)) {
      toast({ title: "Invalid file", description: target === "poster" ? "Poster must be a JPG, PNG, or WebP image." : "Choose a supported image or MP4/WebM video.", variant: "destructive" })
      return
    }
    try {
      setUploading(true)
      const bucket = process.env.NEXT_PUBLIC_SUPABASE_MEDIA_BUCKET || "media"
      await ensureBucket(bucket)

      const ext = file.name.split(".").pop() || "bin"
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const folder = target === "poster" ? "posters" : formData.media_type === "image" ? "images" : "videos"
      const path = `advertisements/${folder}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        })
      if (uploadError) throw uploadError

      const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path)
      let publicUrl = pub?.publicUrl || ""
      // If bucket is not public, ensure we have a previewable URL via signed URL
      if (!publicUrl.includes("/object/public/")) {
        const { data: signed } = await supabase.storage
          .from(bucket)
          .createSignedUrl(path, 60 * 60 * 24 * 365) // 1 year
        if (signed?.signedUrl) {
          publicUrl = signed.signedUrl
        }
      }

      setFormData((current) => target === "poster" ? { ...current, poster_url: publicUrl } : {
        ...current,
        media_url: publicUrl,
        storage_bucket: bucket,
        storage_path: path,
        media_mime: file.type,
        media_size: file.size,
      })
      toast({ title: "Uploaded", description: "Media uploaded successfully" })
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message || "Could not upload file", variant: "destructive" })
    } finally {
      setUploading(false)
      // clear the input value so same file can be re-selected
      if (target === "poster") {
        if (posterInputRef.current) posterInputRef.current.value = ""
      } else if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DashboardSidebar />
      <main className="flex-1 p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Advertisements</h1>
            <p className="text-slate-600 mt-2">Manage website advertisements</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open)
            if (!open) {
              resetForm()
            }
          }}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Advertisement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingAd ? "Edit Advertisement" : "Create Advertisement"}
                </DialogTitle>
                <DialogDescription>
                  Add images or videos to display in the advertisement marquee
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="advertiser_name">Advertiser Name</Label>
                    <Input id="advertiser_name" value={formData.advertiser_name} onChange={(e) => setFormData({ ...formData, advertiser_name: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="placement">Placement *</Label>
                    <select id="placement" value={formData.placement} onChange={(e) => setFormData({ ...formData, placement: e.target.value })} className="w-full rounded-md border px-3 py-2" required>
                      {ADVERTISEMENT_PLACEMENTS.map((placement) => <option key={placement.code} value={placement.code}>{placement.label}</option>)}
                    </select>
                  </div>
                </div>

                <div className="rounded-md border border-slate-200 p-4">
                  <p className="mb-3 text-sm font-semibold">English Content</p>
                  <div className="grid gap-3">
                    <Input placeholder="English title" value={formData.title_en} onChange={(e) => setFormData({ ...formData, title_en: e.target.value, title: e.target.value })} required />
                    <Textarea placeholder="English description" value={formData.description_en} onChange={(e) => setFormData({ ...formData, description_en: e.target.value, description: e.target.value })} rows={2} />
                    <Input placeholder="English CTA text" value={formData.cta_text_en} onChange={(e) => setFormData({ ...formData, cta_text_en: e.target.value })} />
                  </div>
                </div>

                <div className="rounded-md border border-slate-200 p-4">
                  <p className="mb-3 text-sm font-semibold">Kinyarwanda Content</p>
                  <div className="grid gap-3">
                    <Input placeholder="Kinyarwanda title" value={formData.title_rw} onChange={(e) => setFormData({ ...formData, title_rw: e.target.value })} />
                    <Textarea placeholder="Kinyarwanda description" value={formData.description_rw} onChange={(e) => setFormData({ ...formData, description_rw: e.target.value })} rows={2} />
                    <Input placeholder="Kinyarwanda CTA text" value={formData.cta_text_rw} onChange={(e) => setFormData({ ...formData, cta_text_rw: e.target.value })} />
                  </div>
                </div>

                <div>
                  <Label htmlFor="media_type">Media Type *</Label>
                  <select
                    id="media_type"
                    value={formData.media_type}
                    onChange={(e) => setFormData({ ...formData, media_type: e.target.value as "image" | "video" })}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  >
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="media_file">Media File *</Label>
                  <Input
                    id="media_file"
                    type="file"
                    accept={formData.media_type === "image" ? "image/jpeg,image/png,image/webp,image/gif" : "video/mp4,video/webm"}
                    onChange={handleFileChange}
                    ref={fileInputRef}
                  />
                  <p className="text-xs text-gray-500 mt-1">Upload an {formData.media_type}</p>
                  {uploading && <p className="text-xs text-blue-600 mt-1">Uploading...</p>}
                  {formData.media_url && (
                    <div className="mt-2">
                      {formData.media_type === "image" ? (
                        <div className="relative w-24 h-36 rounded overflow-hidden bg-slate-100">
                          <Image src={formData.media_url} alt={formData.title} fill className="object-cover" />
                        </div>
                      ) : (
                        <video src={formData.media_url} className="w-24 h-36 rounded object-cover" controls />)
                      }
                    </div>
                  )}
                </div>

                {formData.media_type === "video" && (
                  <div>
                    <Label htmlFor="poster_file">Video Poster / Thumbnail</Label>
                    <Input id="poster_file" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => handleFileChange(e, "poster")} ref={posterInputRef} />
                    {formData.poster_url && <Image src={formData.poster_url} alt="Video poster preview" width={160} height={90} unoptimized className="mt-2 h-20 w-36 rounded object-cover" />}
                  </div>
                )}

                <div>
                  <Label htmlFor="link_url">Link URL (Optional)</Label>
                  <Input
                    id="link_url"
                    type="url"
                    value={formData.link_url}
                    onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                    placeholder="https://example.com"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    URL to redirect when ad is clicked
                  </p>
                </div>

                <div>
                  <Label htmlFor="mobile_media_url">Mobile Media URL (Optional)</Label>
                  <Input id="mobile_media_url" type="url" value={formData.mobile_media_url} onChange={(e) => setFormData({ ...formData, mobile_media_url: e.target.value })} placeholder="https://..." />
                  <p className="mt-1 text-xs text-slate-500">Use this only when the mobile creative differs from the primary media.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="display_order">Display Order</Label>
                    <Input
                      id="display_order"
                      type="number"
                      value={formData.display_order}
                      onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Input id="priority" type="number" min="0" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: Math.max(0, parseInt(e.target.value) || 0) })} />
                  </div>

                  <div className="flex items-center space-x-2 pt-6">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <Label htmlFor="is_active">Active</Label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_date">Start Date (Optional)</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="end_date">End Date (Optional)</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <select id="status" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as AdvertisementStatus, is_active: e.target.value === "ACTIVE" })} className="w-full rounded-md border px-3 py-2">
                    {(["DRAFT", "ACTIVE", "PAUSED", "EXPIRED", "ARCHIVED"] as AdvertisementStatus[]).map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                </div>

                <div className="rounded-md border border-dashed border-slate-300 p-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Preview</p>
                  <div className="flex min-h-24 items-center gap-4 rounded bg-[#071b38] p-4 text-white">
                    {formData.media_url && (formData.media_type === "image" ? <Image src={formData.media_url} alt="Advertisement preview" width={120} height={72} unoptimized className="h-16 w-24 rounded object-cover" /> : <video src={formData.media_url} poster={formData.poster_url || undefined} controls className="h-16 w-24 rounded object-cover" />)}
                    <div className="min-w-0"><p className="font-bold">{formData.title_en || formData.title || "Advertisement title"}</p><p className="text-sm text-slate-200">{formData.description_en || formData.description || "Advertisement description"}</p></div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false)
                      resetForm()
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={uploading || !formData.media_url}>
                    {editingAd ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : ads.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">No advertisements yet. Create your first one!</p>
            </CardContent>
          </Card>
        ) : (
          <>
          <div className="mb-4 flex flex-wrap gap-3">
            <select aria-label="Filter by status" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="rounded-md border px-3 py-2 text-sm">
              <option value="all">All statuses</option>
              {(["DRAFT", "ACTIVE", "PAUSED", "EXPIRED", "ARCHIVED"] as AdvertisementStatus[]).map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
            <select aria-label="Filter by placement" value={filterPlacement} onChange={(e) => setFilterPlacement(e.target.value)} className="rounded-md border px-3 py-2 text-sm">
              <option value="all">All placements</option>
              {ADVERTISEMENT_PLACEMENTS.map((placement) => <option key={placement.code} value={placement.code}>{placement.label}</option>)}
            </select>
          </div>
          <div className="grid gap-4">
            {visibleAds.map((ad) => (
              <Card key={ad.id}>
                <CardContent className="p-6">
                  <div className="flex gap-6">
                    <div className="flex-shrink-0">
                      {ad.media_type === "image" ? (
                        <div className="relative w-32 h-48 rounded-lg overflow-hidden bg-slate-200">
                          <Image
                            src={ad.media_url}
                            alt={ad.title}
                            fill
                            className="object-cover"
                            sizes="128px"
                          />
                        </div>
                      ) : (
                        <div className="relative w-32 h-48 rounded-lg overflow-hidden bg-slate-200 flex items-center justify-center">
                          <Video className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{ad.title}</h3>
                          {ad.description && (
                            <p className="text-sm text-gray-600 mt-1">{ad.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              ad.is_active
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {ad.is_active ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                        <div>
                          <span className="text-gray-500">Type:</span>
                          <div className="flex items-center gap-1 mt-1">
                            {ad.media_type === "image" ? (
                              <ImageIcon className="h-4 w-4" />
                            ) : (
                              <Video className="h-4 w-4" />
                            )}
                            <span className="capitalize">{ad.media_type}</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Views:</span>
                          <div className="flex items-center gap-1 mt-1">
                            <Eye className="h-4 w-4" />
                            <span>{ad.view_count}</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Clicks:</span>
                          <div className="flex items-center gap-1 mt-1">
                            <MousePointerClick className="h-4 w-4" />
                            <span>{ad.click_count}</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Order:</span>
                          <span className="ml-2">{ad.display_order}</span>
                        </div>
                      </div>

                      {ad.link_url && (
                        <div className="mt-2">
                          <span className="text-gray-500 text-sm">Link: </span>
                          <a
                            href={ad.link_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm"
                          >
                            {ad.link_url}
                          </a>
                        </div>
                      )}

                      <div className="flex gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(ad)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(ad.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          </>
        )}
      </main>
    </div>
  )
}

