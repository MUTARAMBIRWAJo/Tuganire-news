"use client"

import { useEffect, useState } from "react"
import { DashboardShell } from "@/components/dashboard-shell"
import { ADVERTISEMENT_PLACEMENTS } from "@/lib/advertisements"

export default function AdsKeeperProviderPage() {
  const [provider, setProvider] = useState({ siteId: "", enabled: false })
  const [unit, setUnit] = useState({ name: "", widget_id: "", placement: "HOME_MIDDLE", locale: "all", status: "DRAFT", priority: 0, height_px: 300 })
  const [message, setMessage] = useState("")

  useEffect(() => {
    fetch("/api/admin/advertising-providers").then((response) => response.ok ? response.json() : { providers: [] }).then((payload) => {
      const value = payload.providers?.find((item: { provider: string }) => item.provider === "ADSKEEPER")
      if (value) setProvider({ siteId: value.adskeeper_site_id || "", enabled: Boolean(value.enabled) })
    }).catch(() => {})
  }, [])

  const saveProvider = async (event: React.FormEvent) => {
    event.preventDefault()
    const response = await fetch("/api/admin/advertising-providers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ provider: "ADSKEEPER", adskeeper_site_id: provider.siteId, enabled: provider.enabled }) })
    setMessage(response.ok ? "AdsKeeper provider saved." : "Unable to save AdsKeeper provider.")
  }

  const createUnit = async (event: React.FormEvent) => {
    event.preventDefault()
    const response = await fetch("/api/admin/adskeeper", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(unit) })
    setMessage(response.ok ? "AdsKeeper widget configuration saved." : "Unable to save widget configuration.")
  }

  return (
    <DashboardShell title="AdsKeeper" description="Configure the existing AdsKeeper provider and widget placements without editing source code." userName="Administrator" role="admin">
      <div className="grid max-w-5xl gap-6 lg:grid-cols-2">
        <form onSubmit={saveProvider} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div><h2 className="text-xl font-bold">Provider setup</h2><p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Enter the public AdsKeeper site ID supplied by AdsKeeper. Scripts are controlled by the application integration.</p></div>
          <label className="grid gap-2 text-sm font-medium">Site ID<input required value={provider.siteId} onChange={(event) => setProvider({ ...provider, siteId: event.target.value })} placeholder="Numeric site ID" className="rounded-md border px-3 py-2" /></label>
          <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={provider.enabled} onChange={(event) => setProvider({ ...provider, enabled: event.target.checked })} /> Enable AdsKeeper</label>
          <button type="submit" className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Save provider</button>
        </form>
        <form onSubmit={createUnit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div><h2 className="text-xl font-bold">Create widget placement</h2><p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Use the numeric widget ID from your AdsKeeper account.</p></div>
          <input required placeholder="Internal name" value={unit.name} onChange={(event) => setUnit({ ...unit, name: event.target.value })} className="w-full rounded-md border px-3 py-2" />
          <input required inputMode="numeric" pattern="[0-9]+" placeholder="Widget ID" value={unit.widget_id} onChange={(event) => setUnit({ ...unit, widget_id: event.target.value })} className="w-full rounded-md border px-3 py-2" />
          <select value={unit.placement} onChange={(event) => setUnit({ ...unit, placement: event.target.value })} className="w-full rounded-md border px-3 py-2">{ADVERTISEMENT_PLACEMENTS.map((placement) => <option key={placement.code} value={placement.code}>{placement.label}</option>)}</select>
          <div className="grid grid-cols-2 gap-3"><select value={unit.locale} onChange={(event) => setUnit({ ...unit, locale: event.target.value })} className="rounded-md border px-3 py-2"><option value="all">All languages</option><option value="en">English</option><option value="rw">Kinyarwanda</option></select><select value={unit.status} onChange={(event) => setUnit({ ...unit, status: event.target.value })} className="rounded-md border px-3 py-2"><option value="DRAFT">Draft</option><option value="ACTIVE">Active</option><option value="PAUSED">Paused</option><option value="ARCHIVED">Archived</option></select></div>
          <div className="grid grid-cols-2 gap-3"><input type="number" min="0" placeholder="Priority" value={unit.priority} onChange={(event) => setUnit({ ...unit, priority: Number(event.target.value) || 0 })} className="rounded-md border px-3 py-2" /><input type="number" min="0" max="1200" placeholder="Height px" value={unit.height_px} onChange={(event) => setUnit({ ...unit, height_px: Number(event.target.value) || 0 })} className="rounded-md border px-3 py-2" /></div>
          <button type="submit" className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Save widget</button>
        </form>
      </div>
      {message && <p className="mt-4 text-sm text-slate-600">{message}</p>}
    </DashboardShell>
  )
}
