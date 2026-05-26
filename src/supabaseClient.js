import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? import.meta?.env?.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? import.meta?.env?.VITE_SUPABASE_ANON_KEY

export let supabase = null
try {
  if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  }
} catch (e) {
  // If creation fails (e.g., invalid URL in CI/dev), keep `supabase` as null and avoid throwing during module import
  console.warn('supabase client not initialized:', e?.message || e)
}
