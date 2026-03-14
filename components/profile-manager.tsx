"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Loader2, Upload, User, Mail, Phone, Globe, Twitter, Facebook, Linkedin, Instagram, Youtube, MapPin, Lock, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { AppUser } from "@/lib/types"

interface ProfileManagerProps {
  userId: string
  initialData: Partial<AppUser>
}

export function ProfileManager({ userId, initialData }: ProfileManagerProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [formData, setFormData] = useState({
    display_name: initialData.display_name || "",
    bio: initialData.bio || "",
    phone: initialData.phone || "",
    location: initialData.location || "",
    website: initialData.website || "",
    twitter_url: initialData.twitter_url || "",
    facebook_url: initialData.facebook_url || "",
    linkedin_url: initialData.linkedin_url || "",
    instagram_url: initialData.instagram_url || "",
    youtube_url: initialData.youtube_url || "",
    show_email: initialData.show_email ?? false,
    show_phone: initialData.show_phone ?? false,
    show_social_links: initialData.show_social_links ?? true,
    email_public: initialData.email_public ?? false,
    avatar_url: initialData.avatar_url || "",
  })

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      })
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 5MB",
        variant: "destructive",
      })
      return
    }

    setUploadingImage(true)

    try {
      // Check authentication
      const { data: session } = await supabase.auth.getSession()
      if (!session?.session?.user) {
        throw new Error("Please log in to upload images")
      }

      // Create unique filename
      const fileExt = file.name.split(".").pop()
      const fileName = `profile-${userId}-${Date.now()}.${fileExt}`
      const filePath = `profiles/${fileName}`

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from("media")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        })

      if (error) throw error

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("media").getPublicUrl(filePath)

      // Update form data
      handleInputChange("avatar_url", publicUrl)

      toast({
        title: "Image uploaded",
        description: "Profile image uploaded successfully",
      })
    } catch (error) {
      console.error("Upload error:", error)
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive",
      })
    } finally {
      setUploadingImage(false)
      if (e.target) e.target.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Use API route to avoid RLS recursion issues
      const response = await fetch("/api/profile/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          display_name: formData.display_name,
          bio: formData.bio,
          phone: formData.phone,
          location: formData.location,
          website: formData.website,
          twitter_url: formData.twitter_url,
          facebook_url: formData.facebook_url,
          linkedin_url: formData.linkedin_url,
          instagram_url: formData.instagram_url,
          youtube_url: formData.youtube_url,
          show_email: formData.show_email,
          show_phone: formData.show_phone,
          show_social_links: formData.show_social_links,
          email_public: formData.email_public,
          avatar_url: formData.avatar_url,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to update profile")
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      })

      // Refresh the page to show updated data
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      console.error("Update error:", error)
      const errorMessage = error instanceof Error 
        ? error.message 
        : typeof error === 'object' && error !== null && 'message' in error
          ? String(error.message)
          : "Failed to update profile"
      
      toast({
        title: "Update failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Profile Image */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Image</CardTitle>
          <CardDescription>Upload a profile picture to personalize your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-6">
            <div className="relative">
              {formData.avatar_url ? (
                <Image
                  src={formData.avatar_url}
                  alt="Profile"
                  width={96}
                  height={96}
                  loading="lazy"
                  unoptimized
                  className="w-24 h-24 rounded-full object-cover border-2 border-slate-200"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center border-2 border-slate-300">
                  <User className="h-12 w-12 text-slate-400" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <Label htmlFor="avatar-upload" className="cursor-pointer">
                <Button type="button" variant="outline" disabled={uploadingImage} asChild>
                  <span>
                    {uploadingImage ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Image
                      </>
                    )}
                  </span>
                </Button>
              </Label>
              <Input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploadingImage}
              />
              <p className="text-xs text-slate-500 mt-2">JPG, PNG or GIF. Max size 5MB</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Your public profile information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="display_name">Display Name *</Label>
            <Input
              id="display_name"
              value={formData.display_name}
              onChange={(e) => handleInputChange("display_name", e.target.value)}
              placeholder="Your display name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange("bio", e.target.value)}
              placeholder="Tell us about yourself..."
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-slate-500">{formData.bio.length}/500 characters</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">
              <MapPin className="inline h-4 w-4 mr-1" />
              Location
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              placeholder="City, Country"
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>Your contact details and privacy settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">
              <Phone className="inline h-4 w-4 mr-1" />
              Phone Number
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              placeholder="+1234567890"
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="show_phone" className="text-base">Show Phone Number</Label>
              <p className="text-sm text-slate-500">Make your phone number visible on your public profile</p>
            </div>
            <Switch
              id="show_phone"
              checked={formData.show_phone}
              onCheckedChange={(checked) => handleInputChange("show_phone", checked)}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="show_email" className="text-base">Show Email Address</Label>
              <p className="text-sm text-slate-500">Make your email visible on your public profile</p>
            </div>
            <Switch
              id="show_email"
              checked={formData.show_email}
              onCheckedChange={(checked) => handleInputChange("show_email", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Social Media Links */}
      <Card>
        <CardHeader>
          <CardTitle>Social Media</CardTitle>
          <CardDescription>Connect your social media profiles</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg mb-4">
            <div className="space-y-0.5">
              <Label htmlFor="show_social_links" className="text-base">Show Social Links</Label>
              <p className="text-sm text-slate-500">Display social media links on your public profile</p>
            </div>
            <Switch
              id="show_social_links"
              checked={formData.show_social_links}
              onCheckedChange={(checked) => handleInputChange("show_social_links", checked)}
            />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="website">
                <Globe className="inline h-4 w-4 mr-1" />
                Website
              </Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange("website", e.target.value)}
                placeholder="https://yourwebsite.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="twitter_url">
                <Twitter className="inline h-4 w-4 mr-1" />
                Twitter
              </Label>
              <Input
                id="twitter_url"
                type="url"
                value={formData.twitter_url}
                onChange={(e) => handleInputChange("twitter_url", e.target.value)}
                placeholder="https://twitter.com/username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="facebook_url">
                <Facebook className="inline h-4 w-4 mr-1" />
                Facebook
              </Label>
              <Input
                id="facebook_url"
                type="url"
                value={formData.facebook_url}
                onChange={(e) => handleInputChange("facebook_url", e.target.value)}
                placeholder="https://facebook.com/username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedin_url">
                <Linkedin className="inline h-4 w-4 mr-1" />
                LinkedIn
              </Label>
              <Input
                id="linkedin_url"
                type="url"
                value={formData.linkedin_url}
                onChange={(e) => handleInputChange("linkedin_url", e.target.value)}
                placeholder="https://linkedin.com/in/username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagram_url">
                <Instagram className="inline h-4 w-4 mr-1" />
                Instagram
              </Label>
              <Input
                id="instagram_url"
                type="url"
                value={formData.instagram_url}
                onChange={(e) => handleInputChange("instagram_url", e.target.value)}
                placeholder="https://instagram.com/username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="youtube_url">
                <Youtube className="inline h-4 w-4 mr-1" />
                YouTube
              </Label>
              <Input
                id="youtube_url"
                type="url"
                value={formData.youtube_url}
                onChange={(e) => handleInputChange("youtube_url", e.target.value)}
                placeholder="https://youtube.com/@username"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Privacy Settings</CardTitle>
          <CardDescription>Control what information is visible to others</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="email_public" className="text-base">Public Email</Label>
              <p className="text-sm text-slate-500">Allow others to see your email address</p>
            </div>
            <Switch
              id="email_public"
              checked={formData.email_public}
              onCheckedChange={(checked) => handleInputChange("email_public", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => window.location.reload()}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </form>
  )
}

