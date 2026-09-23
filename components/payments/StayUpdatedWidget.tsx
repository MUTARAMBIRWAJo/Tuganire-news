"use client"

import type React from "react"
import { useMemo, useTransition } from "react"
import { useRouter } from "next/navigation"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Heart, Megaphone, Rocket, ShieldCheck, Sparkles } from "lucide-react"
import { getLocaleFromPath, t, type Locale } from "@/lib/i18n"

type WidgetAction = {
  label: string
  description: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  gradient: string
  analyticsId: string
}

function ActionCard({ action, onClick, pending, locale }: { action: WidgetAction; onClick: () => void; pending: boolean; locale: Locale }) {
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
            {pending ? t("loadingAction", locale) : action.label}
          </div>
        </div>
      </div>
    </button>
  )
}

export default function StayUpdatedWidget() {
  const router = useRouter()
  const locale = getLocaleFromPath(usePathname())
  const [isPending, startTransition] = useTransition()

  const actions = useMemo<WidgetAction[]>(
    () => [
      {
        label: t("newsletterSubscribe", locale),
        description: t("newsletterSubscribeDescription", locale),
        href: `/${locale}/newsletter`,
        icon: Mail,
        gradient: "bg-gradient-to-br from-brand-50 via-white to-brand-100/70 dark:from-brand-950/30 dark:via-slate-950 dark:to-slate-900",
        analyticsId: "stay-updated-newsletter",
      },
      {
        label: t("supportIndependent", locale),
        description: t("supportIndependentDescription", locale),
        href: `/${locale}/donate`,
        icon: Heart,
        gradient: "bg-gradient-to-br from-rose-50 via-white to-rose-100/70 dark:from-rose-950/30 dark:via-slate-950 dark:to-slate-900",
        analyticsId: "stay-updated-donate",
      },
      {
        label: t("advertiseWithUs", locale),
        description: t("advertiseWithUsDescription", locale),
        href: `/${locale}/advertise`,
        icon: Megaphone,
        gradient: "bg-gradient-to-br from-amber-50 via-white to-amber-100/70 dark:from-amber-950/30 dark:via-slate-950 dark:to-slate-900",
        analyticsId: "stay-updated-advertise",
      },
      {
        label: t("promoteYourStory", locale),
        description: t("promoteYourStoryDescription", locale),
        href: `/${locale}/promote`,
        icon: Rocket,
        gradient: "bg-gradient-to-br from-sky-50 via-white to-sky-100/70 dark:from-sky-950/30 dark:via-slate-950 dark:to-slate-900",
        analyticsId: "stay-updated-promote",
      },
      {
        label: t("becomeSupporter", locale),
        description: t("becomeSupporterDescription", locale),
        href: `/${locale}/donate`,
        icon: ShieldCheck,
        gradient: "bg-gradient-to-br from-emerald-50 via-white to-emerald-100/70 dark:from-emerald-950/30 dark:via-slate-950 dark:to-slate-900",
        analyticsId: "stay-updated-supporter",
      },
    ],
    [locale],
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
            {t("stayUpdated", locale)}
          </div>
          <CardTitle className="text-2xl font-bold text-slate-950 dark:text-white">{t("stayUpdatedTitle", locale)}</CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-300">
            {t("stayUpdatedDescription", locale)}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3 p-0">
          {actions.map((action) => (
            <ActionCard key={action.analyticsId} action={action} onClick={() => openTarget(action.href)} pending={isPending} locale={locale} />
          ))}
        </CardContent>
      </Card>
    </motion.aside>
  )
}
