import { supabase } from "@/lib/supabaseClient"

export async function signOutCurrentSession() {
  const { error } = await supabase.auth.signOut({ scope: "local" })
  if (error) throw error
}