import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://invalid.supabase.local"
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "invalid-service-role-key"

// Server-side: use service role to bypass RLS safely in this API route
const sb = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false }
})

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })

    const { email } = body || {}
    
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 })
    }

    // Check if already subscribed
    const { data: existing } = await sb
      .from('newsletter_subscribers')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ 
        error: "This email is already subscribed",
        alreadySubscribed: true 
      }, { status: 400 })
    }

    // Insert new subscriber
    const { data, error } = await sb
      .from('newsletter_subscribers')
      .insert({
        email: email.toLowerCase().trim(),
        is_verified: true, // Auto-verify for simplicity
      })
      .select()
      .single()

    if (error) {
      console.error("Newsletter subscription error:", error)
      return NextResponse.json(
        { error: error.message || "Failed to subscribe" },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: "Successfully subscribed to newsletter",
      data 
    }, { status: 200 })
  } catch (error: any) {
    console.error("Newsletter subscription exception:", error)
    return NextResponse.json(
      { error: error?.message || "An unexpected error occurred" },
      { status: 500 }
    )
  }
}

