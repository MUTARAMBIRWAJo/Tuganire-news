"use client"

import useSWR from "swr"
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
  const fetcher = async (url: string) => {
    try {
      const r = await fetch(url)
      if (!r.ok) return { rows, enabled }
      return await r.json()
    } catch (e) {
      console.warn('[PaymentHistoryTable] fetch error', e)
      return { rows, enabled }
    }
  }

  const { data } = useSWR(enabled ? `/api/admin/payment-history?limit=20` : null, fetcher, {
    fallbackData: { rows, enabled },
    refreshInterval: 15000,
    revalidateOnFocus: false,
    onError(err) {
      console.warn('[PaymentHistoryTable] SWR error', err)
    },
  })

  const displayRows: PaymentHistoryRow[] = Array.isArray(data?.rows) ? data.rows : Array.isArray(rows) ? rows : []

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
        {displayRows.length === 0 ? (
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
              {displayRows.map((row) => {
                try {
                  const kind = typeof row.payment_kind === 'string' ? row.payment_kind.replace(/_/g, ' ') : 'payment'
                  const status = typeof row.payment_status === 'string' ? row.payment_status : 'unknown'
                  const amountCents = typeof row.amount_cents === 'number' ? row.amount_cents : 0
                  const currency = (row.currency || 'usd').toString()
                  const customer = row.customer_name || row.customer_email || 'Unknown'
                  const campaign = row.article_title || row.advertiser_company || row.promoted_article_id || '-'
                  let dateLabel = '-'
                  try {
                    const d = row.created_at ? new Date(row.created_at) : null
                    if (d && !isNaN(d.getTime())) dateLabel = d.toLocaleDateString()
                  } catch {}

                  return (
                    <TableRow key={(row && (row.id ?? Math.random().toString(36).slice(2))) as any}>
                      <TableCell className="font-medium capitalize">{kind}</TableCell>
                      <TableCell>
                        <Badge className={statusTone(status)}>{status}</Badge>
                      </TableCell>
                      <TableCell>
                        {(amountCents / 100).toFixed(2)} {currency.toUpperCase()}
                      </TableCell>
                      <TableCell>{customer}</TableCell>
                      <TableCell>
                        <div className="max-w-[220px] truncate text-sm text-slate-600 dark:text-slate-300">{campaign}</div>
                      </TableCell>
                      <TableCell>{dateLabel}</TableCell>
                    </TableRow>
                  )
                } catch (e) {
                  console.warn('[PaymentHistoryTable] render row error', e)
                  return null
                }
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
