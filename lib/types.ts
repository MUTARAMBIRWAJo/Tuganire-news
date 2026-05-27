export type UserRole = "public" | "reporter" | "admin" | "superadmin"
export type ArticleStatus = "draft" | "pending" | "published" | "rejected" | "archived"

export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  email: string | null
  role: UserRole
  is_approved: boolean
  created_at: string
  updated_at: string
}

export interface AppUser {
  id: string
  display_name: string | null
  email?: string | null
  avatar_url: string | null
  role: UserRole
  created_at: string
  updated_at?: string | null
  bio?: string | null
  phone?: string | null
  email_public?: boolean
  website?: string | null
  twitter_url?: string | null
  facebook_url?: string | null
  linkedin_url?: string | null
  instagram_url?: string | null
  youtube_url?: string | null
  show_email?: boolean
  show_phone?: boolean
  show_social_links?: boolean
  location?: string | null
  is_approved?: boolean
}

export interface Article {
  id: string
  slug: string
  title: string
  excerpt: string | null
  content: string
  status: ArticleStatus
  author_id: string | null
  category_id: number | null
  featured_image: string | null
  media: MediaItem[]
  video_url?: string | null
  videos?: string[]
  reading_time: number | null
  is_featured: boolean
  is_breaking: boolean | null
  is_editor_pick: boolean | null
  views_count: number
  created_at: string
  updated_at: string
  published_at: string | null
  author?: Profile
  category?: Category
  tags?: Tag[]
}

export interface Category {
  id: number
  name: string
  slug: string
}

export interface Tag {
  id: number
  name: string
}

export interface Subscription {
  id: string
  email: string
  confirmed: boolean
  created_at: string
}

export interface Newsletter {
  id: string
  subject: string
  body: string
  status: string
  scheduled_at: string | null
  created_by: string | null
  created_at: string
}

export interface Audit {
  id: string
  table_name: string | null
  row_id: string | null
  action: string | null
  changed_by: string | null
  diff: any
  created_at: string
}

export interface MediaItem {
  url: string
  type: "image" | "video"
  caption?: string
  alt?: string
  isFeatured?: boolean
}
