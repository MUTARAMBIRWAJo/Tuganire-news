"use client"

import { Check, Sparkles } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { PricingPlan } from "@/types/payment"

interface PricingCardsProps {
  plans: PricingPlan[]
  selectedPlanId?: string
  onSelect?: (plan: PricingPlan) => void
  className?: string
  ctaLabel?: string
}

export default function PricingCards({
  plans,
  selectedPlanId,
  onSelect,
  className = "",
  ctaLabel = "Choose plan",
}: PricingCardsProps) {
  return (
    <div className={cn("grid gap-4 md:grid-cols-2 xl:grid-cols-3", className)}>
      {plans.map((plan) => {
        const selected = selectedPlanId === plan.id

        return (
          <Card
            key={plan.id}
            className={cn(
              "relative overflow-hidden border-slate-200 bg-white shadow-sm transition-all dark:border-slate-800 dark:bg-slate-950",
              selected && "border-brand-500 ring-2 ring-brand-500/15",
            )}
          >
            {plan.badge && (
              <Badge className="absolute right-4 top-4 bg-brand-600 text-white hover:bg-brand-600">
                {plan.badge}
              </Badge>
            )}
            <CardHeader className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-600 dark:text-brand-400">
                <Sparkles className="size-4" />
                {plan.kind.replace(/_/g, " ")}
              </div>
              <CardTitle>{plan.title}</CardTitle>
              <CardDescription>{plan.subtitle}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-semibold tracking-tight">${plan.price}</span>
                  <span className="pb-1 text-sm text-slate-500 dark:text-slate-400">/{plan.currency.toUpperCase()}</span>
                </div>
              </div>

              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={selected ? "default" : "outline"}
                className="w-full"
                onClick={() => onSelect?.(plan)}
                type="button"
              >
                {ctaLabel}
              </Button>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
