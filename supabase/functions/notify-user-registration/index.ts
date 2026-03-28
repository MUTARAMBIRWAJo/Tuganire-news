import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { Deno } from "https://deno.land/std@0.168.0/node/process.ts"

const supabaseUrl = Deno.env.get("SUPABASE_URL")!
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!

serve(async (req) => {
  try {
    const { record } = await req.json()

    const supabase = createClient(supabaseUrl, supabaseServiceKey)


    // Get all Admins and SuperAdmins from app_users
    const { data: admins } = await supabase
      .from("app_users")
      .select("email, display_name, role")
      .in("role", ["admin", "superadmin"])
      .eq("is_approved", true)

    // Send email to each admin (replace with your email sending logic)
    for (const admin of admins || []) {
      // TODO: Integrate with your email provider (Resend, SendGrid, etc.)
      // Example: await sendEmail(admin.email, subject, html)
      console.log(`Would send to: ${admin.email} about new user: ${record.email}`)
    }

    return new Response(JSON.stringify({ message: "Notifications sent" }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
})
