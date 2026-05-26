import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/auth"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const {
      display_name,
      bio,
      phone,
      location,
      website,
      twitter_url,
      facebook_url,
      linkedin_url,
      instagram_url,
      youtube_url,
      show_email,
      show_phone,
      show_social_links,
      email_public,
      avatar_url,
    } = body

    const supabase = await createClient()

    // Prepare update data
    const updateData: any = {
      display_name: display_name || null,
      avatar_url: avatar_url || null,
    }

    // Only include fields that are provided
    if (bio !== undefined) updateData.bio = bio || null
    if (phone !== undefined) updateData.phone = phone || null
    if (location !== undefined) updateData.location = location || null
    if (website !== undefined) updateData.website = website || null
    if (twitter_url !== undefined) updateData.twitter_url = twitter_url || null
    if (facebook_url !== undefined) updateData.facebook_url = facebook_url || null
    if (linkedin_url !== undefined) updateData.linkedin_url = linkedin_url || null
    if (instagram_url !== undefined) updateData.instagram_url = instagram_url || null
    if (youtube_url !== undefined) updateData.youtube_url = youtube_url || null
    if (show_email !== undefined) updateData.show_email = show_email
    if (show_phone !== undefined) updateData.show_phone = show_phone
    if (show_social_links !== undefined) updateData.show_social_links = show_social_links
    if (email_public !== undefined) updateData.email_public = email_public

    // Update profile - server-side update should avoid RLS recursion
    const { data, error } = await supabase
      .from("app_users")
      .update(updateData)
      .eq("id", user.id)
      .select()
      .single()

    if (error) {
      console.error("Profile update error:", error)
      const errAny = error as any
      return NextResponse.json(
        { 
          error: errAny?.message || errAny?.error || "Failed to update profile",
          details: error 
        },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: "Update succeeded but no data returned" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error("Profile update exception:", error)
    return NextResponse.json(
      { error: error?.message || "An unexpected error occurred" },
      { status: 500 }
    )
  }
}

