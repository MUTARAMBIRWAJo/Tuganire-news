"use client"

import type { PropsWithChildren } from "react"

export default function Prose({ children, className = "" }: PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={[
        "prose prose-slate dark:prose-invert",
        "prose-sm md:prose-base lg:prose-lg",
        "prose-p:break-words",
        "max-w-full md:max-w-3xl lg:max-w-4xl mx-auto",
        "leading-relaxed",
        "text-sm md:text-base lg:text-lg text-gray-700 dark:text-gray-300",
        "overflow-x-hidden",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  )
}
