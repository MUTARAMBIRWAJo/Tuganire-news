"use client"

import { useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import type { AppUser } from "@/lib/types"
import { supabase } from "@/lib/supabaseClient"
import { signOutCurrentSession } from "@/lib/auth/browser-session"

export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!isMounted) return

      if (error) {
        if (process.env.NODE_ENV !== "production") {
          console.warn("[auth] getSession warning", error)
        }
      }

      setUser(session?.user ?? null)
      if (session?.user) {
        supabase
          .rpc("get_my_app_user")
          .single()
          .then(({ data, error }) => {
            if (!isMounted) return
            if (error && process.env.NODE_ENV !== "production") {
              console.warn("get_my_app_user error", error)
            }
            setProfile((data as AppUser) || null)
            setLoading(false)
          })
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return

      if (process.env.NODE_ENV !== "production") {
        console.debug("[auth] onAuthStateChange", _event)
      }

      setUser(session?.user ?? null)
      if (session?.user) {
        supabase
          .rpc("get_my_app_user")
          .single()
          .then(({ data, error }) => {
            if (!isMounted) return
            if (error && process.env.NODE_ENV !== "production") {
              console.warn("get_my_app_user error", error)
            }
            setProfile((data as AppUser) || null)
            setLoading(false)
          })
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    await signOutCurrentSession()
  }

  return { user, profile, role: profile?.role, loading, signOut }
}
