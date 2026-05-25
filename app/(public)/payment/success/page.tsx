import type { Metadata } from "next"
import Link from "next/link"
import { CheckCircle2, Newspaper, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { buildAuthLoginHref, buildAuthSignUpHref } from "@/lib/auth-redirect"

export const metadata: Metadata = {
  title: "Payment Success",
  description: "Stripe payment completed successfully.",
  alternates: { canonical: "/payment/success" },
}

interface SuccessPageProps {
  searchParams?: {
    session_id?: string
    kind?: string
  }
}

export default function PaymentSuccessPage({ searchParams }: SuccessPageProps) {
  const loginHref = buildAuthLoginHref("/dashboard")
  const signUpHref = buildAuthSignUpHref("/dashboard")

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      <SiteHeader />

      <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-16 sm:px-6 lg:px-8">
        <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
          <CardHeader>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
              <CheckCircle2 className="size-4" />
              Payment complete
            </div>
            <CardTitle>Thank you for supporting Tuganire News</CardTitle>
            <CardDescription>
              Your payment was processed securely with Stripe. We will keep the record ready for receipts, analytics, and internal review.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
              <p className="font-medium text-slate-900 dark:text-white">Session reference</p>
              <p className="mt-1 break-all">{searchParams?.session_id || "Unavailable"}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <div className="mb-2 flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                  <ShieldCheck className="size-4 text-emerald-600" />
                  Secure record
                </div>
                <p>Webhook processing can store the payment in your monetization tables once the service role key is configured.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <div className="mb-2 flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                  <Newspaper className="size-4 text-brand-600" />
                  What happens next
                </div>
                <p>Your campaign, donation, or promotion will be reviewed and attached to the matching newsroom workflow.</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Button asChild>
                <Link href="/">Back to homepage</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href={loginHref}>Open dashboard</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href={signUpHref}>Create account</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <SiteFooter />
    </div>
  )
}
