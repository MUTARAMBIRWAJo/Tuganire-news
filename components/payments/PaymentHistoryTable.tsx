import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { PaymentHistoryRow } from "@/lib/payment-history"

interface PaymentHistoryTableProps {
  rows: PaymentHistoryRow[]
  enabled: boolean
}

function statusTone(status: string) {
  switch (status) {
    case "completed":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
    case "pending":
      return "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
    case "failed":
    case "canceled":
      return "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
    default:
      return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
  }
}

export default function PaymentHistoryTable({ rows, enabled }: PaymentHistoryTableProps) {
  return (
    <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
      <CardHeader>
        <CardTitle>Payment history</CardTitle>
        <CardDescription>
          {enabled
            ? "Live Stripe-backed payment records and monetization events."
            : "Enable the Supabase service role key to load payment records from the database."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
            No payment records are available yet. Once Stripe webhooks start firing, completed donations and campaigns will appear here.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Campaign</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium capitalize">{row.payment_kind.replace(/_/g, " ")}</TableCell>
                  <TableCell>
                    <Badge className={statusTone(row.payment_status)}>{row.payment_status}</Badge>
                  </TableCell>
                  <TableCell>
                    {(row.amount_cents / 100).toFixed(2)} {row.currency.toUpperCase()}
                  </TableCell>
                  <TableCell>{row.customer_name || row.customer_email || "Unknown"}</TableCell>
                  <TableCell>
                    <div className="max-w-[220px] truncate text-sm text-slate-600 dark:text-slate-300">
                      {row.article_title || row.advertiser_company || row.promoted_article_id || "-"}
                    </div>
                  </TableCell>
                  <TableCell>{new Date(row.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
