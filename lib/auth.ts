import { createClient } from "@/lib/supabase/server"
import type { AppUser } from "@/lib/types"

export async function getCurrentUser() {
  const supabase = await createClient()

  let user
  try {
    const result = await supabase.auth.getUser()
    user = result.data.user
  } catch (error) {
    console.error("[auth:ssr] Supabase Auth request failed", {
      name: error instanceof Error ? error.name : "UnknownError",
    })
    return null
  }

  if (!user) {
    console.debug("[auth:ssr] getUser returned null")
    return null
  }

  const { data: aalData, error: aalError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
  if (aalError || !aalData) {
    console.error("[auth:ssr] MFA assurance lookup failed")
    return null
  }

  if (aalData.nextLevel === "aal2" && aalData.currentLevel !== "aal2") {
    return null
  }

  // Use RPC to avoid potential recursive RLS policies on direct table access
  const { data: profile, error } = (await supabase
    .rpc("get_my_app_user")
    .single()) as { data: AppUser | null; error: any }
  if (error) {
    console.error("[auth:ssr] failed to fetch profile", {
      code: error.code,
      message: error.message,
    })
  }

  const appUser = profile as AppUser | null
  if (appUser && appUser.role !== "public" && appUser.is_approved !== true) {
    return null
  }

  return appUser
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
