import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/auth"
import { requireRole } from "@/lib/auth/guards"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { createClient as createServiceClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"

export default async function SuperAdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const me = await getCurrentUser()
  if (!me || me.role !== "superadmin") redirect("/auth/login")

  const { id } = await params

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabase = serviceKey && url
    ? createServiceClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
    : await createClient()

  // Fetch app user
  const { data: userRow } = await supabase
    .from("app_users")
    .select("id, display_name, role, is_approved, created_at, avatar_url, bio, phone, location, website, twitter_url, facebook_url, linkedin_url, instagram_url, youtube_url, show_email, show_phone, show_social_links, email_public")
    .eq("id", id)
    .single()

  // Fetch auth user (email)
  let email: string | null = null
  try {
    const { data: authUser } = await supabase.auth.admin.getUserById(id)
    email = authUser?.user?.email || null
  } catch {
    email = null
  }

  async function updateProfile(formData: FormData) {
    "use server"
    await requireRole("superadmin")
    const id = String(formData.get("id"))
    const update: Record<string, any> = {
      display_name: String(formData.get("display_name") || "").trim() || null,
      role: String(formData.get("role") || "").trim() || null,
      is_approved: String(formData.get("is_approved") || "false") === "true",
      avatar_url: String(formData.get("avatar_url") || "").trim() || null,
      bio: String(formData.get("bio") || "").trim() || null,
      phone: String(formData.get("phone") || "").trim() || null,
      location: String(formData.get("location") || "").trim() || null,
      website: String(formData.get("website") || "").trim() || null,
      twitter_url: String(formData.get("twitter_url") || "").trim() || null,
      facebook_url: String(formData.get("facebook_url") || "").trim() || null,
      linkedin_url: String(formData.get("linkedin_url") || "").trim() || null,
      instagram_url: String(formData.get("instagram_url") || "").trim() || null,
      youtube_url: String(formData.get("youtube_url") || "").trim() || null,
      show_email: String(formData.get("show_email") || "false") === "true",
      show_phone: String(formData.get("show_phone") || "false") === "true",
      show_social_links: String(formData.get("show_social_links") || "true") === "true",
      email_public: String(formData.get("email_public") || "false") === "true",
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supa = serviceKey && url
      ? createServiceClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
      : await createClient()

    await supa.from("app_users").update(update).eq("id", id)
    revalidatePath(`/dashboard/superadmin/users/${id}`)
  }

  async function resetPassword(formData: FormData) {
    "use server"
    await requireRole("superadmin")
    const id = String(formData.get("id"))
    const newPassword = String(formData.get("new_password") || "")
    if (!newPassword || newPassword.length < 8) return

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !serviceKey) return

    const admin = createServiceClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
    await admin.auth.admin.updateUserById(id, { password: newPassword })
    revalidatePath(`/dashboard/superadmin/users/${id}`)
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DashboardSidebar />
      <main className="flex-1 p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800">Manage User</h1>
          <p className="text-slate-600 mt-2">Edit profile and reset password</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={updateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="hidden" name="id" defaultValue={id} />

              <div>
                <Label htmlFor="display_name">Display Name</Label>
                <Input id="display_name" name="display_name" defaultValue={userRow?.display_name || ""} />
              </div>

              <div>
                <Label htmlFor="role">Role</Label>
                <Input id="role" name="role" defaultValue={userRow?.role || ""} />
              </div>

              <div>
                <Label htmlFor="is_approved">Approved (true/false)</Label>
                <Input id="is_approved" name="is_approved" defaultValue={userRow?.is_approved ? "true" : "false"} />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="avatar_url">Avatar URL</Label>
                <Input id="avatar_url" name="avatar_url" defaultValue={userRow?.avatar_url || ""} />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="bio">Bio</Label>
                <Input id="bio" name="bio" defaultValue={userRow?.bio || ""} />
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" defaultValue={userRow?.phone || ""} />
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input id="location" name="location" defaultValue={userRow?.location || ""} />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="website">Website</Label>
                <Input id="website" name="website" defaultValue={userRow?.website || ""} />
              </div>

              <div>
                <Label htmlFor="twitter_url">Twitter</Label>
                <Input id="twitter_url" name="twitter_url" defaultValue={userRow?.twitter_url || ""} />
              </div>

              <div>
                <Label htmlFor="facebook_url">Facebook</Label>
                <Input id="facebook_url" name="facebook_url" defaultValue={userRow?.facebook_url || ""} />
              </div>

              <div>
                <Label htmlFor="linkedin_url">LinkedIn</Label>
                <Input id="linkedin_url" name="linkedin_url" defaultValue={userRow?.linkedin_url || ""} />
              </div>

              <div>
                <Label htmlFor="instagram_url">Instagram</Label>
                <Input id="instagram_url" name="instagram_url" defaultValue={userRow?.instagram_url || ""} />
              </div>

              <div>
                <Label htmlFor="youtube_url">YouTube</Label>
                <Input id="youtube_url" name="youtube_url" defaultValue={userRow?.youtube_url || ""} />
              </div>

              <div>
                <Label htmlFor="show_email">Show Email (true/false)</Label>
                <Input id="show_email" name="show_email" defaultValue={userRow?.show_email ? "true" : "false"} />
              </div>

              <div>
                <Label htmlFor="show_phone">Show Phone (true/false)</Label>
                <Input id="show_phone" name="show_phone" defaultValue={userRow?.show_phone ? "true" : "false"} />
              </div>

              <div>
                <Label htmlFor="show_social_links">Show Social Links (true/false)</Label>
                <Input id="show_social_links" name="show_social_links" defaultValue={userRow?.show_social_links ? "true" : "false"} />
              </div>

              <div>
                <Label htmlFor="email_public">Public Email (true/false)</Label>
                <Input id="email_public" name="email_public" defaultValue={userRow?.email_public ? "true" : "false"} />
              </div>

              <div className="md:col-span-2 flex gap-3 mt-2">
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reset Password</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={resetPassword} className="flex gap-3 items-end">
              <input type="hidden" name="id" defaultValue={id} />
              <div className="flex-1">
                <Label htmlFor="new_password">New Password</Label>
                <Input id="new_password" name="new_password" type="password" placeholder="At least 8 characters" />
                {email && <p className="text-xs text-slate-500 mt-1">User: {email}</p>}
              </div>
              <Button type="submit" variant="secondary">Set Password</Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
