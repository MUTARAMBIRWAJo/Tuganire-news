export type UserRole =
  | "public"
  | "subscriber"
  | "advertiser"
  | "supporter"
  | "reporter"
  | "admin"
  | "superadmin"

export const ROLES: UserRole[] = [
  "public",
  "subscriber",
  "advertiser",
  "supporter",
  "reporter",
  "admin",
  "superadmin",
]

export const ADMIN_ROLES: UserRole[] = ["admin", "superadmin"]
