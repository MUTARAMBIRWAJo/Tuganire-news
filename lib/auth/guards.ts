import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import type { AppUser } from "@/lib/types"
import type { UserRole } from "./roles"
import { ROLE_PERMISSIONS } from "./permissions"
import type { Permission } from "./permissions"

export async function requireRole(allowed: UserRole | UserRole[]): Promise<AppUser> {
  const user = await getCurrentUser()
  if (!user) redirect("/auth/login")

  const allowedRoles = Array.isArray(allowed) ? allowed : [allowed]
  if (!user.role || !allowedRoles.includes(user.role as UserRole)) {
    redirect("/auth/login")
  }

  return user as AppUser
}

export async function requirePermission(permission: Permission): Promise<AppUser> {
  const user = await getCurrentUser()
  if (!user) redirect("/auth/login")

  const perms = ROLE_PERMISSIONS[user.role as UserRole] || []
  if (!perms.includes(permission)) {
    redirect("/auth/login")
  }

  return user as AppUser
}

export async function hasPermission(permission: Permission) {
  const user = await getCurrentUser()
  if (!user) return false

  const perms = ROLE_PERMISSIONS[user.role as UserRole] || []
  return perms.includes(permission)
}
