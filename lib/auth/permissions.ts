import type { UserRole } from "./roles"

export type Permission =
  | "view_dashboard"
  | "manage_articles"
  | "manage_users"
  | "manage_ads"
  | "manage_billing"
  | "create_campaigns"

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  public: ["view_dashboard"],
  subscriber: ["view_dashboard"],
  supporter: ["view_dashboard", "manage_billing"],
  advertiser: ["view_dashboard", "create_campaigns", "manage_billing"],
  reporter: ["view_dashboard", "manage_articles"],
  admin: [
    "view_dashboard",
    "manage_articles",
    "manage_users",
    "manage_ads",
    "manage_billing",
  ],
  superadmin: [
    "view_dashboard",
    "manage_articles",
    "manage_users",
    "manage_ads",
    "manage_billing",
    "create_campaigns",
  ],
}
