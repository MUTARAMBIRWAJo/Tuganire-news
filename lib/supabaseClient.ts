import { createBrowserClient } from "@supabase/ssr"

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://invalid.supabase.local",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "invalid-anon-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'sb-tuganire-auth',
    },
  }
)

