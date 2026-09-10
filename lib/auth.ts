import { createClient } from "@/lib/supabase/server"
import type { AppUser } from "@/lib/types"

export async function getCurrentUser() {
  const supabase = await createClient()

  let user
  try {
    const result = await supabase.auth.getUser()
    user = result.data.user
  } catch (error) {
    console.error("[auth:ssr] Supabase Auth request failed", error instanceof Error ? error.message : error)
    return null
  }

  if (!user) {
    console.debug("[auth:ssr] getUser returned null")
    return null
  }

  // Use RPC to avoid potential recursive RLS policies on direct table access
  const { data: profile, error } = (await supabase
    .rpc("get_my_app_user")
    .single()) as { data: AppUser | null; error: any }
  if (error) {
    console.error("[auth:ssr] failed to fetch profile", error)
  }

  return profile as AppUser | null
}

export async function isAdmin(userId: string) {
  const supabase = await createClient()

  const { data: profile } = await supabase.from("app_users").select("role").eq("id", userId).single()

  return profile?.role === "superadmin" || profile?.role === "admin"
}

export async function hasRole(userId: string, roles: string[]) {
  const supabase = await createClient()

  const { data: profile } = await supabase.from("app_users").select("role").eq("id", userId).single()

  return profile ? roles.includes(profile.role) : false
}
