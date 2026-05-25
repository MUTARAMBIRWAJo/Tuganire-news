import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowRight, BadgePercent, BarChart3, CreditCard, Megaphone, ShieldCheck } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import PaymentHistoryTable from "../../../components/payments/PaymentHistoryTable"
import { getPaymentHistory } from "../../../lib/payment-history"

export default async function MonetizationDashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  const role = user.role?.toLowerCase()
  if (role !== "admin" && role !== "superadmin") {
    redirect("/dashboard")
  }

  const paymentHistory = await getPaymentHistory(10)

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      <DashboardSidebar />

      <main className="flex-1 p-6 lg:p-8">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-600 dark:text-brand-400">Monetization dashboard</p>
            <h1 className="text-3xl font-semibold tracking-tight">Revenue, promotions, and payout placeholders</h1>
            <p className="max-w-3xl text-sm text-slate-600 dark:text-slate-300">
              This placeholder is ready for payment history, campaign analytics, invoice exports, advertiser records, and Stripe webhook status once your live workflow is connected.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              { icon: CreditCard, title: "Transactions", text: "Payment history and checkout status" },
              { icon: Megaphone, title: "Campaigns", text: "Sponsored posts, ads, and promotions" },
              { icon: BarChart3, title: "Analytics", text: "Conversion tracking and campaign ROI" },
              { icon: BadgePercent, title: "Invoices", text: "Stripe-ready billing records and exports" },
            ].map((item) => (
              <Card key={item.title} className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                <CardHeader className="space-y-2">
                  <item.icon className="size-5 text-brand-600 dark:text-brand-400" />
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 text-sm text-slate-600 dark:text-slate-300">{item.text}</CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-emerald-600" />
                Ready for production wiring
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
              <p>Connect your Stripe webhook, payment tables, and campaign approval workflows when you are ready to accept live monetization traffic.</p>
              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/advertise">
                    View advertiser flow
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/promote">View promotion flow</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <PaymentHistoryTable rows={paymentHistory.rows} enabled={paymentHistory.enabled} />
        </div>
      </main>
    </div>
  )
}
