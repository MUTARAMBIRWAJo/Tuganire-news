import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "Learn how Tuganire News uses cookies and how you can control cookie preferences.",
  alternates: {
    canonical: "/cookie-policy",
  },
  openGraph: {
    title: "Cookie Policy - Tuganire News",
    description: "Learn how Tuganire News uses cookies and how you can control cookie preferences.",
    url: "/cookie-policy",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cookie Policy - Tuganire News",
    description: "Learn how Tuganire News uses cookies and how you can control cookie preferences.",
  },
}

export default function CookiePolicyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-slate-950">
      <SiteHeader />
      <main className="container mx-auto max-w-3xl px-4 py-10 flex-1">
        <h1 className="text-3xl font-bold mb-4">Cookie Policy</h1>
        <p className="text-slate-600 mb-8">
          This Cookie Policy explains what cookies are, how we use them on Tuganire, and how you can manage your
          preferences. By using our website, you agree to the use of cookies as described here.
          how the site is used.
        </p>
        <section className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold">How we use cookies</h2>
        <ul className="list-disc pl-6 space-y-2 text-slate-700">
          <li>
            <strong>Essential cookies</strong>: required for core functionality, such as session management and security.
          </li>
          <li>
            <strong>Performance & analytics</strong>: to understand usage (e.g., pages visited, time on site) to improve
            content and features.
          </li>
          <li>
            <strong>Preferences</strong>: to remember your settings like theme or language.
          </li>
          <li>
            <strong>Advertising/third‑party</strong>: where relevant, to provide personalized content or measure
            campaign performance.
          </li>
        </ul>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold">Managing cookies</h2>
        <p className="text-slate-700">
          You can control cookies through your browser settings. Blocking some cookies may impact your site experience.
          For guidance, see your browser’s help pages. You can also clear cookies at any time.
        </p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold">Third‑party services</h2>
        <p className="text-slate-700">
          We may use third‑party services (e.g., Supabase, analytics providers). These services may set their own
          cookies according to their policies.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Updates to this policy</h2>
        <p className="text-slate-700">
          We may update this Cookie Policy to reflect changes in technology, law, or our services. Any updates will be
          posted on this page with an updated revision date.
        </p>
        <p className="text-slate-500 text-sm">Last updated: {new Date().toLocaleDateString()}</p>
      </section>
      </main>
      <SiteFooter />
    </div>
  )
}
