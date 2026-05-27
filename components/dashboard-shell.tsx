import type { ReactNode } from "react"
import Link from "next/link"
import { Bell, Search, UserCircle2 } from "lucide-react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface DashboardShellProps {
  title: string
  description: string
  userName?: string
  role?: string
  children: ReactNode
}

export function DashboardShell({ title, description, userName, role, children }: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white md:flex">
      <DashboardSidebar />

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
          <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-600 dark:text-brand-400">
                Tuganire newsroom dashboard
              </p>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
              <p className="max-w-3xl text-sm text-slate-600 dark:text-slate-300">{description}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Search className="size-4" />
                Search
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Bell className="size-4" />
                Notifications
              </Button>
              <Link href="/dashboard/public/security" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <UserCircle2 className="size-4 text-brand-600 dark:text-brand-400" />
                <span className="max-w-[160px] truncate">{userName || "User"}</span>
                {role ? <Badge variant="secondary" className="capitalize">{role}</Badge> : null}
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
