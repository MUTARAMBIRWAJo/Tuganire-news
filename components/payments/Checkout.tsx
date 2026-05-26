"use client"

import { useMemo } from "react"
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js"
import Link from "next/link"
import { ArrowLeft, Lock, Sparkles } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { stripePromise } from "@/lib/stripe-client"
import ErrorBoundary from '@/components/errors/ErrorBoundary'

interface CheckoutProps {
  clientSecret?: string | null
  title: string
  description: string
  successPath?: string
  cancelPath?: string
  className?: string
}

export default function Checkout({
  clientSecret,
  title,
  description,
  successPath = "/payment/success",
  cancelPath = "/payment/cancel",
  className = "",
}: CheckoutProps) {
  const memoizedSecret = useMemo(() => clientSecret || null, [clientSecret])

  if (!memoizedSecret) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Spinner className="size-4" />
            Preparing secure checkout
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300">
            We are creating a secure Stripe Embedded Checkout session. Please wait a moment.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <ErrorBoundary label="Payment checkout">
      <Card className={className}>
      <CardHeader className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400">
          <Sparkles className="size-4" />
          Stripe Embedded Checkout
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret: memoizedSecret }}>
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-2">
            <Lock className="size-3.5" />
            Encrypted payment page served by Stripe
          </span>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href={cancelPath}>
                <ArrowLeft className="mr-2 size-4" />
                Cancel
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={successPath}>View success page</Link>
            </Button>
          </div>
        </div>
      </CardContent>
      </Card>
    </ErrorBoundary>
  )
}
