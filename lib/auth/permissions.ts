import type { UserRole } from "./roles"

export const CAN_MANAGE_USERS = "CAN_MANAGE_USERS" as const
export const CAN_PUBLISH_ARTICLES = "CAN_PUBLISH_ARTICLES" as const
export const CAN_CREATE_ADS = "CAN_CREATE_ADS" as const
export const CAN_VIEW_ANALYTICS = "CAN_VIEW_ANALYTICS" as const
export const CAN_MANAGE_PAYMENTS = "CAN_MANAGE_PAYMENTS" as const
export const CAN_MODERATE_COMMENTS = "CAN_MODERATE_COMMENTS" as const
export const CAN_MANAGE_CAMPAIGNS = "CAN_MANAGE_CAMPAIGNS" as const

export type Permission =
  | typeof CAN_MANAGE_USERS
  | typeof CAN_PUBLISH_ARTICLES
  | typeof CAN_CREATE_ADS
  | typeof CAN_VIEW_ANALYTICS
  | typeof CAN_MANAGE_PAYMENTS
  | typeof CAN_MODERATE_COMMENTS
  | typeof CAN_MANAGE_CAMPAIGNS
  | "view_dashboard"

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  public: ["view_dashboard"],
  subscriber: ["view_dashboard", CAN_MANAGE_PAYMENTS],
  supporter: ["view_dashboard", CAN_MANAGE_PAYMENTS],
  advertiser: ["view_dashboard", CAN_CREATE_ADS, CAN_MANAGE_CAMPAIGNS, CAN_MANAGE_PAYMENTS, CAN_VIEW_ANALYTICS],
  reporter: ["view_dashboard", CAN_PUBLISH_ARTICLES, CAN_MODERATE_COMMENTS, CAN_VIEW_ANALYTICS],
  admin: [
    "view_dashboard",
    CAN_PUBLISH_ARTICLES,
    CAN_MANAGE_USERS,
    CAN_CREATE_ADS,
    CAN_MANAGE_PAYMENTS,
    CAN_MODERATE_COMMENTS,
    CAN_VIEW_ANALYTICS,
    CAN_MANAGE_CAMPAIGNS,
  ],
  superadmin: [
    "view_dashboard",
    CAN_PUBLISH_ARTICLES,
    CAN_MANAGE_USERS,
    CAN_CREATE_ADS,
    CAN_MANAGE_PAYMENTS,
    CAN_MODERATE_COMMENTS,
    CAN_VIEW_ANALYTICS,
    CAN_MANAGE_CAMPAIGNS,
  ],
}
