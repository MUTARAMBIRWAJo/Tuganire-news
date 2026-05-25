"use client"

import type React from "react"
import { useMemo, useTransition } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Heart, Megaphone, Rocket, ShieldCheck, Sparkles } from "lucide-react"

type WidgetAction = {
  label: string
  description: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  gradient: string
  analyticsId: string
}

function ActionCard({ action, onClick, pending }: { action: WidgetAction; onClick: () => void; pending: boolean }) {
  const Icon = action.icon

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      data-analytics-id={action.analyticsId}
      className={`group w-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-800 dark:bg-slate-950 ${action.gradient}`}
    >
      <div className="flex items-start gap-4">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-sm dark:bg-white dark:text-slate-950">
          <Icon className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-slate-950 dark:text-white">{action.label}</h3>
          <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{action.description}</p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold text-white transition-transform group-hover:translate-x-0.5 dark:bg-white dark:text-slate-950">
            <Sparkles className="size-3.5" />
            {pending ? "Loading" : action.label}
          </div>
        </div>
      </div>
    </button>
  )
}

export default function StayUpdatedWidget() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const actions = useMemo<WidgetAction[]>(
    () => [
      {
        label: "Newsletter Subscribe",
        description: "Get the latest headlines, analysis, and breaking alerts in your inbox.",
        href: "/newsletter",
        icon: Mail,
        gradient: "bg-gradient-to-br from-brand-50 via-white to-brand-100/70 dark:from-brand-950/30 dark:via-slate-950 dark:to-slate-900",
        analyticsId: "stay-updated-newsletter",
      },
      {
        label: "Support Independent Journalism",
        description: "Contribute to on-the-ground reporting, fact-checking, and newsroom tools.",
        href: "/donate",
        icon: Heart,
        gradient: "bg-gradient-to-br from-rose-50 via-white to-rose-100/70 dark:from-rose-950/30 dark:via-slate-950 dark:to-slate-900",
        analyticsId: "stay-updated-donate",
      },
      {
        label: "Advertise With Us",
        description: "Reach a trusted audience with clean, brand-safe advertising packages.",
        href: "/advertise",
        icon: Megaphone,
        gradient: "bg-gradient-to-br from-amber-50 via-white to-amber-100/70 dark:from-amber-950/30 dark:via-slate-950 dark:to-slate-900",
        analyticsId: "stay-updated-advertise",
      },
      {
        label: "Promote Your Story",
        description: "Publish sponsored stories, homepage boosts, and premium brand posts.",
        href: "/promote",
        icon: Rocket,
        gradient: "bg-gradient-to-br from-sky-50 via-white to-sky-100/70 dark:from-sky-950/30 dark:via-slate-950 dark:to-slate-900",
        analyticsId: "stay-updated-promote",
      },
      {
        label: "Become a Supporter",
        description: "Future membership perks and supporter-only benefits will live here.",
        href: "/donate",
        icon: ShieldCheck,
        gradient: "bg-gradient-to-br from-emerald-50 via-white to-emerald-100/70 dark:from-emerald-950/30 dark:via-slate-950 dark:to-slate-900",
        analyticsId: "stay-updated-supporter",
      },
    ],
    [],
  )

  const openTarget = (href: string) => {
    if (isPending) return
    startTransition(() => {
      router.push(href)
    })
  }

  return (
    <motion.aside
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-[0_24px_80px_-45px_rgba(15,23,42,0.6)] dark:border-slate-800 dark:bg-slate-950 sm:p-6"
    >
      <Card className="border-0 bg-transparent shadow-none">
        <CardHeader className="p-0 pb-5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-brand-600 dark:text-brand-400">
            <Sparkles className="size-4" />
            Stay Updated
          </div>
          <CardTitle className="text-2xl font-bold text-slate-950 dark:text-white">Follow the newsroom, support the reporting.</CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-300">
            Subscribe, contribute, advertise, or promote your story through a clean, mobile-first newsroom experience.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3 p-0">
          {actions.map((action) => (
            <ActionCard key={action.analyticsId} action={action} onClick={() => openTarget(action.href)} pending={isPending} />
          ))}
        </CardContent>
      </Card>
    </motion.aside>
  )
}
