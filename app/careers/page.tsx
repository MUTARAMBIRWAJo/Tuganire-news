import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Careers",
  description: "Explore journalism and newsroom career opportunities at Tuganire News.",
  alternates: {
    canonical: "/careers",
  },
  openGraph: {
    title: "Careers - Tuganire News",
    description: "Explore journalism and newsroom career opportunities at Tuganire News.",
    url: "/careers",
  },
  twitter: {
    card: "summary_large_image",
    title: "Careers - Tuganire News",
    description: "Explore journalism and newsroom career opportunities at Tuganire News.",
  },
}

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <SiteHeader />

      <main className="flex-1">
        <div className="max-w-6xl xl:max-w-7xl mx-auto sm:p-6 md:p-8 max-w-3xl">
          <h1 className="text-4xl font-bold mb-4">Careers</h1>
          <p className="text-slate-700 leading-relaxed mb-8">Join our mission to inform and inspire. We are building a modern newsroom and platform for trustworthy journalism.</p>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-3">Open Positions</h2>
            <ul className="space-y-3">
              <li className="border rounded-lg p-4 bg-white">
                <h3 className="font-medium">Reporter (Tech)</h3>
                <p className="text-sm text-slate-600">Cover emerging technologies, startups, and policy.</p>
              </li>
              <li className="border rounded-lg p-4 bg-white">
                <h3 className="font-medium">Editor</h3>
                <p className="text-sm text-slate-600">Shape stories, enforce standards, and mentor writers.</p>
              </li>
              <li className="border rounded-lg p-4 bg-white">
                <h3 className="font-medium">Social Media Manager</h3>
                <p className="text-sm text-slate-600">Grow our audience and engagement across platforms.</p>
              </li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-3">Benefits</h2>
            <ul className="list-disc pl-6 text-slate-700 space-y-1">
              <li>Remote-friendly culture</li>
              <li>Professional development and learning stipend</li>
              <li>Flexible time off</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">How to Apply</h2>
            <p className="text-slate-700 mb-2">Send your CV and links to recent work to <a className="text-primary underline" href="mailto:tuganire.tntorg@gmail.com">tuganire.tntorg@gmail.com</a>.</p>
            <p className="text-slate-700">Include the role you are applying for in the subject line.</p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
