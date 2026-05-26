import { createClient } from "@/lib/supabase/server"

export async function getSubscriberMetadata(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.from("subscriber_metadata").select("*").eq("user_id", userId).maybeSingle()
  if (error) {
    console.error("getSubscriberMetadata error", error)
    return null
  }
  return data
}

export async function requireActiveSubscription(userId: string) {
  const meta = await getSubscriberMetadata(userId)
  if (!meta) return false
  // Basic check: has a stripe_subscription_id. Extend with real status checks via Stripe API.
  return !!meta.stripe_subscription_id
}
