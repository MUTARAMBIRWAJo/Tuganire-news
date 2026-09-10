"use client"

import { useState } from "react"
import { Mail, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getLocaleFromPath, t } from "@/lib/i18n"
import { usePathname } from "next/navigation"

export default function NewsletterSignup() {
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
      const response = await fetch("/api/public/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || t("failedToLoad", locale))
      }

      setSuccess(true)
      setEmail("")
      setTimeout(() => setSuccess(false), 5000)
    } catch (err: any) {
      setError(err.message || t("somethingWentWrong", locale))
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-6">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0">
              <Mail className="h-6 w-6 text-blue-200" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-lg mb-1">{t("subscribeToUpdates", locale)}</h3>
              <p className="text-blue-100 text-sm hidden sm:block">
                {t("newsletterDescription", locale)}
              </p>
            </div>
          </div>
          
          <div className="flex-1 max-w-md w-full md:w-auto">
            {success ? (
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 flex items-center justify-center gap-2">
                <Check className="h-4 w-4" />
                <p className="text-sm font-medium">{t("newsletterSuccess", locale)}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  type="email"
                  placeholder={t("emailAddress", locale)}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 bg-white/95 text-gray-900 placeholder:text-gray-500 border-0 text-sm h-10"
                  disabled={loading}
                />
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-white text-blue-600 hover:bg-blue-50 font-medium px-4 h-10 text-sm whitespace-nowrap"
                >
                  {loading ? t("subscribing", locale) : t("subscribe", locale)}
                </Button>
              </form>
            )}
            
            {error && (
              <p className="mt-2 text-red-200 text-xs text-center md:text-left">{error}</p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

