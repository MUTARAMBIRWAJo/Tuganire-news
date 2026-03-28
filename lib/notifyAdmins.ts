import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function notifyAdminsOfSignup(newUser: { id: string; email: string; display_name?: string }) {
  // Fetch all admins and superadmins
  const { data: admins, error } = await supabase
    .from("app_users")
    .select("email, display_name, role")
    .in("role", ["admin", "superadmin"])
    .eq("is_approved", true)

  if (error || !admins) return

  // Compose notification email
  const subject = "New User Signup Pending Approval"
  const html = `
    <div style="font-family: 'Georgia', serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      <div style="background-color: #1a202c; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Tuganire News</h1>
      </div>
      <div style="padding: 30px; color: #1a202c; line-height: 1.6;">
        <h2 style="margin-top: 0; color: #1a202c;">New User Awaiting Approval</h2>
        <p>A new user has signed up and is awaiting approval:</p>
        <ul>
          <li><strong>Email:</strong> ${newUser.email}</li>
          <li><strong>Name:</strong> ${newUser.display_name || "-"}</li>
        </ul>
        <p>Please log in to the dashboard to approve or reject this user.</p>
      </div>
    </div>
  `

  // Send email to each admin (replace with your email sending logic)
  for (const admin of admins) {
    // TODO: Integrate with your email provider or Supabase Edge Function
    // Example: await sendEmail(admin.email, subject, html)
    console.log(`Would send to: ${admin.email}`)
  }
}
