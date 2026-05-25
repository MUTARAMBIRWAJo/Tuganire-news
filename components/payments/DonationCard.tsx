"use client"

import { useMemo, useState, useTransition } from "react"
import { CheckCircle2, Heart, MessageCircle, Sparkles } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import Checkout from "@/components/payments/Checkout"
import { donationPresets } from "@/lib/stripe"
import { createDonationCheckoutAction } from "@/app/actions/stripe"

interface DonationCardProps {
  sourcePage?: string
}

export default function DonationCard({ sourcePage = "/donate" }: DonationCardProps) {
  const [selectedAmount, setSelectedAmount] = useState<number>(5)
  const [customAmount, setCustomAmount] = useState<string>("")
  const [donorName, setDonorName] = useState<string>("")
  const [donorEmail, setDonorEmail] = useState<string>("")
  const [message, setMessage] = useState<string>("")
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [sessionSummary, setSessionSummary] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [isPending, startTransition] = useTransition()

  const amount = useMemo(() => {
    const numericCustom = Number(customAmount)
    if (Number.isFinite(numericCustom) && numericCustom >= 1) {
      return numericCustom
    }

    return selectedAmount
  }, [customAmount, selectedAmount])

  const handleCheckout = () => {
    setError("")
    setSessionSummary("")

    startTransition(async () => {
      const result = await createDonationCheckoutAction({
        amount,
        donorName: donorName || undefined,
        donorEmail: donorEmail || undefined,
        message: message || undefined,
        sourcePage,
        requestId: crypto.randomUUID(),
      })

      if (!result.ok || !result.session) {
        setError(result.message)
        return
      }

      setClientSecret(result.session.clientSecret)
      setSessionSummary(result.message)
    })
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <CardHeader>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400">
            <Heart className="size-4" />
            Journalism support
          </div>
          <CardTitle>Support independent reporting</CardTitle>
          <CardDescription>
            Choose a preset contribution or enter a custom amount. Your payment is processed through secure Stripe Embedded Checkout.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {donationPresets.map((preset) => (
              <button
                key={preset.amount}
                type="button"
                onClick={() => {
                  setSelectedAmount(preset.amount)
                  setCustomAmount("")
                }}
                className={[
                  "rounded-2xl border p-4 text-left transition-all",
                  preset.featured
                    ? "border-brand-500 bg-brand-50 shadow-sm dark:bg-brand-950/40"
                    : "border-slate-200 bg-slate-50 hover:border-brand-300 dark:border-slate-800 dark:bg-slate-900/40",
                ].join(" ")}
              >
                <div className="text-2xl font-semibold">{preset.label}</div>
                <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{preset.description}</div>
                {preset.featured && (
                  <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-brand-600 px-2.5 py-1 text-[11px] font-semibold text-white">
                    <Sparkles className="size-3.5" />
                    Suggested
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="donor-name">Name</Label>
              <Input id="donor-name" value={donorName} onChange={(event) => setDonorName(event.target.value)} placeholder="Optional" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="donor-email">Email</Label>
              <Input id="donor-email" type="email" value={donorEmail} onChange={(event) => setDonorEmail(event.target.value)} placeholder="Optional" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-[140px_1fr]">
            <div className="space-y-2">
              <Label htmlFor="donation-amount">Custom amount</Label>
              <Input
                id="donation-amount"
                inputMode="numeric"
                value={customAmount}
                onChange={(event) => {
                  setSelectedAmount(5)
                  setCustomAmount(event.target.value)
                }}
                placeholder="10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="donor-message">Message</Label>
              <Textarea
                id="donor-message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Leave a short message of support for the newsroom"
                className="min-h-[42px]"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm dark:bg-slate-900/40">
            <div>
              <div className="font-semibold text-slate-900 dark:text-white">Selected amount</div>
              <div className="text-slate-600 dark:text-slate-300">${amount.toFixed(2)} USD</div>
            </div>
            <Button onClick={handleCheckout} disabled={isPending} className="min-w-[180px]">
              {isPending ? (
                <>
                  <Spinner className="mr-2 size-4" />
                  Creating checkout
                </>
              ) : (
                "Continue to secure payment"
              )}
            </Button>
          </div>

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          {sessionSummary && !error && <p className="text-sm text-emerald-600 dark:text-emerald-400">{sessionSummary}</p>}
        </CardContent>
      </Card>

      <Checkout
        clientSecret={clientSecret}
        title="Secure donation checkout"
        description="Complete your contribution inside Stripe's embedded checkout without leaving the site."
      />
    </div>
  )
}
