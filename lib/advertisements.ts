export const ADVERTISEMENT_PLACEMENTS = [
  {
    code: "HOME_BELOW_BREAKING_NEWS",
    label: "Homepage - Above Breaking News",
    description: "Displayed immediately above the homepage Breaking News bar.",
  },
  {
    code: "HOME_MIDDLE",
    label: "Homepage - Middle",
    description: "Displayed between homepage editorial sections.",
  },
  {
    code: "HOME_BOTTOM",
    label: "Homepage - Bottom",
    description: "Displayed near the bottom of the homepage.",
  },
  { code: "ARTICLE_TOP", label: "Article - Top", description: "Displayed above an article." },
  { code: "ARTICLE_MIDDLE", label: "Article - Middle", description: "Displayed inside article content." },
  { code: "ARTICLE_BOTTOM", label: "Article - Bottom", description: "Displayed before related articles." },
  { code: "ARTICLE_SIDEBAR", label: "Article - Sidebar", description: "Displayed in an article sidebar." },
  { code: "CATEGORY_TOP", label: "Category - Top", description: "Displayed above category results." },
  { code: "CATEGORY_MIDDLE", label: "Category - Middle", description: "Displayed between category results." },
  { code: "SEARCH_TOP", label: "Search - Top", description: "Displayed above search results." },
] as const

export type AdvertisementPlacement = (typeof ADVERTISEMENT_PLACEMENTS)[number]["code"]
export type AdvertisementMediaType = "image" | "video"
export type AdvertisementStatus = "DRAFT" | "ACTIVE" | "PAUSED" | "EXPIRED" | "ARCHIVED"

export function isAdvertisementPlacement(value: string): value is AdvertisementPlacement {
  return ADVERTISEMENT_PLACEMENTS.some((placement) => placement.code === value)
}

export function getAdvertisementPlacementLabel(code: string) {
  return ADVERTISEMENT_PLACEMENTS.find((placement) => placement.code === code)?.label || code
}

export interface PublicAdvertisement {
  id: string
  media_type: AdvertisementMediaType
  media_url: string
  mobile_media_url: string | null
  poster_url: string | null
  title: string
  description: string | null
  cta_text: string | null
  link_url: string | null
  placement: AdvertisementPlacement
}
