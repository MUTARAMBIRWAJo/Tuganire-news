"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, CheckCircle2 } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { getLocaleFromPath, t } from "@/lib/i18n"
import { usePathname } from "next/navigation"

export function NewsletterCTA() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const locale = getLocaleFromPath(usePathname())

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error: insertError } = await supabase
        .from("subscriptions")
        .insert({ email, confirmed: false })

      if (insertError) {
        if (insertError.code === "23505") {
          setError(t("alreadySubscribed", locale))
        } else {
          setError(t("somethingWentWrong", locale))
        }
      } else {
        setSuccess(true)
        setEmail("")
        setTimeout(() => setSuccess(false), 5000)
      }
    } catch (err) {
      setError(t("somethingWentWrong", locale))
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="py-16 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-800 dark:via-purple-800 dark:to-pink-800 text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <Mail className="h-12 w-12 mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("subscribeToUpdates", locale)}</h2>
          <p className="text-lg mb-8 text-blue-100 dark:text-blue-200">
            {t("newsletterDescription", locale)}
          </p>
          
          {success ? (
            <div className="flex items-center justify-center gap-2 text-green-100">
              <CheckCircle2 className="h-5 w-5" />
              <p>Thank you for subscribing! Check your email to confirm.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder={t("emailAddress", locale)}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 bg-white/20 border-white/30 text-white placeholder:text-white/70 focus:bg-white/30"
                disabled={loading}
              />
              <Button
                type="submit"
                size="lg"
                disabled={loading}
                className="bg-white text-blue-600 hover:bg-gray-100 whitespace-nowrap"
              >
                {loading ? t("subscribing", locale) : t("subscribe", locale)}
              </Button>
            </form>
          )}
          
          {error && (
            <p className="mt-4 text-red-100 text-sm">{error}</p>
          )}
          
          <p className="mt-4 text-xs text-blue-100 dark:text-blue-200">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </div>
    </section>
  )
}

