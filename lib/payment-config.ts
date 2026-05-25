import type { PricingPlan } from "@/types/payment"

export const donationPresets = [
  { amount: 2, label: "$2", description: "Support a news brief", featured: false },
  { amount: 5, label: "$5", description: "Help fund field reporting", featured: true },
  { amount: 10, label: "$10", description: "Back deeper coverage", featured: false },
  { amount: 20, label: "$20", description: "Sustain investigative work", featured: false },
] as const

export const sponsoredPostPlans: PricingPlan[] = [
  {
    id: "basic-promotion",
    kind: "sponsored_post",
    title: "Basic Promotion",
    subtitle: "A clean sponsored placement inside the editorial flow.",
    price: 49,
    currency: "usd",
    features: ["Sponsored tag", "48-hour visibility", "Editorial review"],
  },
  {
    id: "featured-homepage",
    kind: "featured_homepage",
    title: "Featured Homepage",
    subtitle: "Higher visibility on the front page for breaking campaigns.",
    price: 149,
    currency: "usd",
    badge: "Popular",
    features: ["Homepage feature", "Priority placement", "Performance tracking"],
  },
  {
    id: "premium-breaking-news",
    kind: "premium_breaking",
    title: "Premium Breaking News Placement",
    subtitle: "Top-tier premium exposure with strong newsroom visibility.",
    price: 299,
    currency: "usd",
    badge: "Premium",
    features: ["Breaking section", "Homepage priority", "Best for launches"],
  },
] as const

export const businessAdvertisingPlans: PricingPlan[] = [
  {
    id: "sidebar-ads",
    kind: "business_ad",
    title: "Sidebar Ads",
    subtitle: "Professional side placements for brand awareness.",
    price: 89,
    currency: "usd",
    features: ["Desktop sidebar", "7-day campaign", "Analytics-ready metadata"],
  },
  {
    id: "homepage-banner",
    kind: "business_ad",
    title: "Homepage Banner Ads",
    subtitle: "A premium banner slot for high-reach campaigns.",
    price: 179,
    currency: "usd",
    badge: "Recommended",
    features: ["Homepage banner", "Mobile responsive", "Priority rotation"],
  },
  {
    id: "sponsored-category",
    kind: "business_ad",
    title: "Sponsored Category Ads",
    subtitle: "Own a category page with a polished sponsored package.",
    price: 249,
    currency: "usd",
    badge: "Best value",
    features: ["Category page sponsorship", "7-day run", "Trust-first placement"],
  },
] as const

export const eventPromotionPlans: PricingPlan[] = [
  {
    id: "event-spotlight",
    kind: "event_promotion",
    title: "Event Spotlight",
    subtitle: "Designed for conferences, cultural events, and launches.",
    price: 79,
    currency: "usd",
    features: ["Event feature", "High-contrast card", "Editorial formatting"],
  },
  {
    id: "event-premium",
    kind: "event_promotion",
    title: "Premium Event Package",
    subtitle: "Larger promotion footprint with stronger homepage exposure.",
    price: 199,
    currency: "usd",
    badge: "Premium",
    features: ["Homepage mention", "Newsletter-ready metadata", "Priority review"],
  },
] as const

export const premiumPromotedPostPlans: PricingPlan[] = [
  {
    id: "premium-post-standard",
    kind: "premium_promoted_post",
    title: "Premium Promoted Post",
    subtitle: "Ideal for high-value campaigns and thought leadership pieces.",
    price: 129,
    currency: "usd",
    features: ["Promoted label", "Priority editorial review", "Trusted sponsor styling"],
  },
  {
    id: "premium-post-plus",
    kind: "premium_promoted_post",
    title: "Premium Promoted Post Plus",
    subtitle: "Adds wider distribution and stronger visibility.",
    price: 229,
    currency: "usd",
    badge: "Best for reach",
    features: ["Homepage visibility", "Trending boost eligibility", "Campaign reporting"],
  },
] as const

export const articleBoostDurations = [3, 7, 14, 30] as const
