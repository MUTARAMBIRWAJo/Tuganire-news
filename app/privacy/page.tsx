import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Shield, Lock, Eye, FileText } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Read the Tuganire News privacy policy, including cookies, advertising, and data rights.",
  alternates: {
    canonical: "/privacy-policy",
  },
  openGraph: {
    title: "Privacy Policy - Tuganire News",
    description: "Read the Tuganire News privacy policy, including cookies, advertising, and data rights.",
    url: "/privacy-policy",
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy - Tuganire News",
    description: "Read the Tuganire News privacy policy, including cookies, advertising, and data rights.",
  },
}

export default function PrivacyPage() {
  const lastUpdated = "January 2, 2026"
  
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-slate-950">
      <SiteHeader />
      <main className="flex-1 py-12">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-black dark:via-slate-900 dark:to-black text-white py-12 mb-12">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-8 w-8" />
              <span className="text-sm font-semibold uppercase tracking-wide text-slate-300">Your Privacy Matters</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-lg text-slate-200">
              Last Updated: <span className="font-semibold">{lastUpdated}</span>
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 max-w-4xl">
          {/* Introduction */}
          <section className="mb-10 p-8 bg-blue-50 dark:bg-slate-800 border-l-4 border-blue-600 dark:border-blue-400 rounded-lg">
            <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white flex items-center gap-2">
              <Eye className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              Introduction
            </h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              Tuganire Today & Tomorrow (Tuganire News) values your privacy and is committed to protecting personal data in compliance with international data protection laws, including the General Data Protection Regulation (GDPR), the California Consumer Privacy Act (CCPA), and global digital advertising standards.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mt-4">
              This Privacy Policy explains what data we collect, how we use it, how long we retain it, and the rights you have over your information. Please read this policy carefully. If you have questions, contact us at the information provided below.
            </p>
          </section>

          {/* Information We Collect */}
          <section className="mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-slate-900 dark:text-white">Information We Collect</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              We collect information through multiple channels. Here is a comprehensive list:
            </p>
            
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Personal Information</h3>
                <p className="text-slate-700 dark:text-slate-300 text-sm">
                  Information you voluntarily provide, including your name, email address, phone number, and comments when you subscribe to our newsletter, contact us, or submit content.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Technical & Browser Information</h3>
                <p className="text-slate-700 dark:text-slate-300 text-sm">
                  IP addresses, browser type, operating system, device identifiers, and device information automatically collected when you access our site.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Usage & Analytics Data</h3>
                <p className="text-slate-700 dark:text-slate-300 text-sm">
                  Pages viewed, time spent on pages, referring URLs, clicks, scrolling behavior, and navigation patterns. This data is collected via Google Analytics and similar analytics services.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Cookies & Advertising Identifiers</h3>
                <p className="text-slate-700 dark:text-slate-300 text-sm">
                  First-party and third-party cookies, web beacons, advertising IDs, and similar tracking technologies used for functionality, analytics, and personalized advertising.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Location Data</h3>
                <p className="text-slate-700 dark:text-slate-300 text-sm">
                  Approximate location information derived from IP address data. We do not collect precise GPS location without explicit consent.
                </p>
              </div>
            </div>
          </section>

          {/* How We Use Information */}
          <section className="mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-slate-900 dark:text-white">How We Use Your Information</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              We use collected information for the following purposes:
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Service Improvement</h3>
                <p className="text-slate-700 dark:text-slate-300 text-sm">To enhance content quality, functionality, and user experience.</p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Communications</h3>
                <p className="text-slate-700 dark:text-slate-300 text-sm">To respond to your inquiries, send newsletters, and provide service updates.</p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Analytics & Performance</h3>
                <p className="text-slate-700 dark:text-slate-300 text-sm">To analyze traffic, user behavior, and site performance through aggregated data.</p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Personalized Advertising</h3>
                <p className="text-slate-700 dark:text-slate-300 text-sm">To display relevant advertisements via third-party vendors and Google AdSense.</p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Legal Compliance</h3>
                <p className="text-slate-700 dark:text-slate-300 text-sm">To comply with legal obligations and enforce our terms of service.</p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Safety & Security</h3>
                <p className="text-slate-700 dark:text-slate-300 text-sm">To prevent fraud, abuse, and maintain the security of our platform.</p>
              </div>
            </div>
          </section>

          {/* Advertising & Cookies - GDPR/CCPA/AdSense Compliant */}
          <section className="mb-10 bg-yellow-50 dark:bg-slate-800 border-l-4 border-yellow-600 dark:border-yellow-400 rounded-lg p-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              Advertising, Cookies & Third-Party Vendors
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-3">Google AdSense & Advertising Partners</h3>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  This website uses Google AdSense and other third-party advertising vendors who use cookies and similar technologies to serve advertisements based on your prior visits to this website or other websites. <strong>Google's use of advertising cookies enables Google and its partners to serve ads based on your visit to this site and/or other sites on the Internet.</strong>
                </p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-3">Cookie Types</h3>
                <ul className="space-y-2 text-slate-700 dark:text-slate-300">
                  <li className="flex gap-3">
                    <span className="font-semibold flex-shrink-0">Essential Cookies:</span>
                    <span>Required for site functionality and your request processing.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-semibold flex-shrink-0">Analytics Cookies:</span>
                    <span>Used to understand how you interact with our site (Google Analytics).</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-semibold flex-shrink-0">Advertising Cookies:</span>
                    <span>Used by Google AdSense and partners to deliver personalized ads based on your interests.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-semibold flex-shrink-0">Preference Cookies:</span>
                    <span>Remember your settings and preferences.</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 rounded border border-yellow-200 dark:border-slate-700">
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">How to Manage Cookies & Opt-Out</h3>
                <ul className="space-y-2 text-slate-700 dark:text-slate-300 text-sm">
                  <li>• <strong>Browser Settings:</strong> Most browsers allow you to refuse cookies or alert you when cookies are being sent.</li>
                  <li>• <strong>Google Ads Settings:</strong> Opt out of personalized advertising at <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">Google Ads Settings</a>.</li>
                  <li>• <strong>Network Advertising Initiative:</strong> Opt out of multiple vendors at <a href="https://www.networkadvertising.org/choices/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">NAI Opt-Out Tool</a>.</li>
                  <li>• <strong>Digital Advertising Alliance:</strong> Visit <a href="https://www.aboutads.info/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">AboutAds.info</a> for industry-wide opt-out options.</li>
                </ul>
              </div>

              <div className="text-sm text-slate-600 dark:text-slate-400 italic">
                Note: Disabling cookies may impact site functionality and your experience. Essential cookies cannot be disabled.
              </div>
            </div>
          </section>

          {/* Data Retention */}
          <section className="mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-slate-900 dark:text-white">Data Retention</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              We retain personal data only for as long as necessary to fulfill the purposes outlined in this policy or as required by law. Retention periods vary depending on data type:
            </p>
            <ul className="space-y-2 text-slate-700 dark:text-slate-300">
              <li>• <strong>Account Data:</strong> Retained for the duration of your account plus 12 months after deletion, unless legal obligations require longer retention.</li>
              <li>• <strong>Analytics Data:</strong> Typically aggregated and anonymized within 26 months.</li>
              <li>• <strong>Email Communications:</strong> Retained for 2 years from the last interaction.</li>
              <li>• <strong>Advertising Data:</strong> Handled by third-party vendors per their retention policies.</li>
            </ul>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mt-4">
              We periodically review and delete or anonymize data that is no longer needed. Upon request, we will securely delete your personal data (subject to legal obligations).
            </p>
          </section>

          {/* User Rights - GDPR/CCPA */}
          <section className="mb-10 bg-green-50 dark:bg-slate-800 border border-green-200 dark:border-slate-700 rounded-lg p-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-slate-900 dark:text-white flex items-center gap-2">
              <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
              Your Privacy Rights (GDPR & CCPA)
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Right to Access</h3>
                <p className="text-slate-700 dark:text-slate-300 text-sm">
                  You have the right to request a copy of all personal data we hold about you in a structured, commonly-used format.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Right to Correct</h3>
                <p className="text-slate-700 dark:text-slate-300 text-sm">
                  You may request correction of inaccurate or incomplete personal data we hold about you.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Right to Delete / Erasure</h3>
                <p className="text-slate-700 dark:text-slate-300 text-sm">
                  You may request deletion of your personal data, subject to legal and operational exceptions (GDPR Article 17 & CCPA §1202).
                </p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Right to Opt-Out of Personalized Advertising</h3>
                <p className="text-slate-700 dark:text-slate-300 text-sm">
                  You can opt out of targeted advertising through Google Ads Settings, browser settings, or the opt-out tools mentioned above.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Right to Restrict Processing</h3>
                <p className="text-slate-700 dark:text-slate-300 text-sm">
                  You may request limitation of how we process your personal data in certain circumstances.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Right to Data Portability</h3>
                <p className="text-slate-700 dark:text-slate-300 text-sm">
                  You have the right to request your personal data in a portable, machine-readable format.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Right to Withdraw Consent</h3>
                <p className="text-slate-700 dark:text-slate-300 text-sm">
                  You may withdraw consent for marketing communications and newsletter subscriptions at any time.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Right to Object</h3>
                <p className="text-slate-700 dark:text-slate-300 text-sm">
                  You may object to certain processing activities, including profiling and automated decision-making.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 rounded border border-green-200 dark:border-slate-600 mt-6">
                <p className="text-slate-700 dark:text-slate-300 font-semibold mb-2">
                  To exercise any of these rights, contact us immediately:
                </p>
                <a href="mailto:privacy@tuganirenews.com" className="text-green-600 dark:text-green-400 hover:underline font-bold">
                  privacy@tuganirenews.com
                </a>
              </div>
            </div>
          </section>

          {/* Data Security */}
          <section className="mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-slate-900 dark:text-white flex items-center gap-2">
              <Lock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              Data Security
            </h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              We implement industry-standard technical, administrative, and organizational security measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. These measures include:
            </p>
            <ul className="space-y-2 text-slate-700 dark:text-slate-300 mb-4">
              <li>• SSL/TLS encryption for data in transit</li>
              <li>• Secure server infrastructure and regular security audits</li>
              <li>• Limited access controls and staff training on data protection</li>
              <li>• Regular backups and incident response procedures</li>
            </ul>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              However, no method of transmission over the internet is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
            </p>
          </section>

          {/* Transparency & Ownership */}
          <section className="mb-10 bg-slate-100 dark:bg-slate-800 p-8 rounded-lg border border-slate-300 dark:border-slate-700">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-slate-900 dark:text-white">Transparency & Contact Information</h2>
            
            <div className="space-y-4 text-slate-700 dark:text-slate-300">
              <div>
                <p className="font-semibold text-slate-900 dark:text-white mb-1">Website Owner & Data Controller:</p>
                <p>Tuganire Today & Tomorrow (Tuganire News)</p>
              </div>

              <div>
                <p className="font-semibold text-slate-900 dark:text-white mb-1">Country of Operation:</p>
                <p>Rwanda</p>
              </div>

              <div>
                <p className="font-semibold text-slate-900 dark:text-white mb-1">Privacy Contact Email:</p>
                <a href="mailto:privacy@tuganirenews.com" className="text-blue-600 dark:text-blue-400 hover:underline">
                  privacy@tuganirenews.com
                </a>
              </div>

              <div>
                <p className="font-semibold text-slate-900 dark:text-white mb-1">General Contact Email:</p>
                <a href="mailto:tuganire.tntorg@gmail.com" className="text-blue-600 dark:text-blue-400 hover:underline">
                  tuganire.tntorg@gmail.com
                </a>
              </div>

              <div>
                <p className="font-semibold text-slate-900 dark:text-white mb-1">Last Updated:</p>
                <p>{lastUpdated}</p>
              </div>

              <div>
                <p className="font-semibold text-slate-900 dark:text-white mb-1">Policy Changes:</p>
                <p>We may update this policy periodically to reflect regulatory changes or improvements. We will notify you of material changes by updating the "Last Updated" date and posting the new policy on this page.</p>
              </div>
            </div>
          </section>

          {/* Compliance Note */}
          <section className="mb-10 bg-blue-50 dark:bg-slate-800 border border-blue-200 dark:border-slate-700 rounded-lg p-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              <strong>Compliance:</strong> This Privacy Policy is designed to comply with GDPR (EU), CCPA (California), LGPD (Brazil), and global digital advertising standards. For inquiries regarding compliance, please contact our privacy team.
            </p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
