import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, RotateCcw, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export const metadata: Metadata = {
  title: "Payment Canceled",
  description: "Stripe payment was canceled or not completed.",
  alternates: { canonical: "/payment/cancel" },
}

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      <SiteHeader />

      <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-16 sm:px-6 lg:px-8">
        <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
          <CardHeader>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">
              <ShieldAlert className="size-4" />
              Checkout stopped
            </div>
            <CardTitle>Payment was not completed</CardTitle>
            <CardDescription>
              You can return to the monetization page and try again when you are ready.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
            <p>Nothing was charged. If this was accidental, simply start a new checkout from the relevant pricing page.</p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button asChild>
                <Link href="/promote">
                  <RotateCcw className="mr-2 size-4" />
                  Retry promotion
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/">
                  <ArrowLeft className="mr-2 size-4" />
                  Back to homepage
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <SiteFooter />
    </div>
  )
}
