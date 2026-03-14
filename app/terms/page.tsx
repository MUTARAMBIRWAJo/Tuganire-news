import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Read the Tuganire News terms of service and platform usage policies.",
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    title: "Terms of Service - Tuganire News",
    description: "Read the Tuganire News terms of service and platform usage policies.",
    url: "/terms",
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms of Service - Tuganire News",
    description: "Read the Tuganire News terms of service and platform usage policies.",
  },
}

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-slate-950">
      <SiteHeader />
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-slate-700 leading-relaxed mb-8">These terms govern your use of the Tuganire News platform. By accessing or using our services, you agree to these terms.</p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-3">1. Acceptance of Terms</h2>
            <p className="text-slate-700">By using Tuganire News, you agree to comply with these Terms and all applicable laws and regulations. If you do not agree, do not use the service.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-3">2. Accounts and Access</h2>
            <ul className="list-disc pl-6 text-slate-700 space-y-1">
              <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
              <li>You must provide accurate information and promptly update any changes.</li>
              <li>We may suspend or terminate access for violations or suspected abuse.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-3">3. Content Ownership</h2>
            <p className="text-slate-700">Content published by Tuganire News is owned by us or our licensors. User-submitted content remains the property of the user, but you grant us a non-exclusive license to display and distribute it on our platform.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-3">4. Prohibited Uses</h2>
            <ul className="list-disc pl-6 text-slate-700 space-y-1">
              <li>Illegal activity, harassment, or hate speech</li>
              <li>Attempting to breach security or disrupt service</li>
              <li>Infringing intellectual property rights</li>
              <li>Spamming or malicious software distribution</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-3">5. Disclaimers</h2>
            <p className="text-slate-700">The service is provided on an "as is" and "as available" basis. We make no warranties, express or implied, regarding accuracy, reliability, or availability.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-3">6. Limitation of Liability</h2>
            <p className="text-slate-700">To the fullest extent permitted by law, Tuganire News shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the service.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">7. Governing Law</h2>
            <p className="text-slate-700">These Terms are governed by the laws of Rwanda, without regard to its conflict of law principles.</p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
