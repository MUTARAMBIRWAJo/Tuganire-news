"use client"

import { useEffect, useState } from "react"
import { DashboardShell } from "@/components/dashboard-shell"

export default function AdvertisingProvidersPage() {
  const [form, setForm] = useState({ mode: "MANUAL_UNITS", publisher_id: "", enabled: false, site_status: "UNKNOWN" })
  const [message, setMessage] = useState("")

  useEffect(() => {
    fetch("/api/admin/advertising-providers").then((response) => response.ok ? response.json() : { providers: [] }).then((payload) => {
      const provider = payload.providers?.[0]
      if (provider) setForm({ mode: provider.mode, publisher_id: provider.publisher_id || "", enabled: provider.enabled, site_status: provider.site_status })
    }).catch(() => {})
  }, [])

  const save = async (event: React.FormEvent) => {
    event.preventDefault()
    const response = await fetch("/api/admin/advertising-providers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ provider: "GOOGLE_ADSENSE", ...form }) })
    setMessage(response.ok ? "Google AdSense configuration saved." : "Unable to save configuration.")
  }

  return (
    <DashboardShell title="Advertising Providers" description="Configure provider integrations without editing application source code." userName="Administrator" role="admin">
      <form onSubmit={save} className="max-w-2xl space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div><h2 className="text-xl font-bold">Google AdSense</h2><p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Tuganire manages integration and placement configuration. Publisher approval and site readiness remain controlled by Google.</p></div>
        <label className="grid gap-2 text-sm font-medium">Mode<select value={form.mode} onChange={(event) => setForm({ ...form, mode: event.target.value })} className="rounded-md border px-3 py-2"><option value="AUTO_ADS">Auto Ads</option><option value="MANUAL_UNITS">Manual Ad Units</option></select></label>
        <label className="grid gap-2 text-sm font-medium">Publisher ID<input value={form.publisher_id} onChange={(event) => setForm({ ...form, publisher_id: event.target.value })} placeholder="ca-pub-XXXXXXXXXXXX" className="rounded-md border px-3 py-2" /></label>
        <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={form.enabled} onChange={(event) => setForm({ ...form, enabled: event.target.checked })} /> Enable Google AdSense integration</label>
        <label className="grid gap-2 text-sm font-medium">Site status<select value={form.site_status} onChange={(event) => setForm({ ...form, site_status: event.target.value })} className="rounded-md border px-3 py-2"><option value="UNKNOWN">Unknown</option><option value="NOT_VERIFIED">Not verified</option><option value="UNDER_REVIEW">Under review</option><option value="READY">Ready</option></select></label>
        <button type="submit" className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Save configuration</button>
        {message && <p className="text-sm text-slate-600">{message}</p>}
      </form>
    </DashboardShell>
  )
}
