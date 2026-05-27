import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { stripeServer } from "@/lib/stripe-server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const customerId = body?.customerId
    if (!customerId) return NextResponse.json({ error: "customerId required" }, { status: 400 })

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // Attempt to retrieve customer from Stripe
    const customer = await stripeServer.customers.retrieve(customerId as string)
    if (!customer || (customer as any).deleted) return NextResponse.json({ error: "Customer not found" }, { status: 404 })

    return NextResponse.json({ customer })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 })
  }
}
