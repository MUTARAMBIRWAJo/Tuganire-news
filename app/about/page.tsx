import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { CheckCircle, Shield, Users, Mail, Phone, MapPin } from "lucide-react"
import Image from "next/image"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "About",
  description: "Learn about Tuganire News, our mission, editorial standards, and contact details.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About Tuganire News",
    description: "Learn about Tuganire News, our mission, editorial standards, and contact details.",
    url: "/about",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Tuganire News",
    description: "Learn about Tuganire News, our mission, editorial standards, and contact details.",
  },
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-black dark:via-slate-900 dark:to-black text-white py-20 md:py-28">
          <div className="container mx-auto px-4 max-w-4xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Independent Journalism for Today & Tomorrow
            </h1>
            <p className="text-xl md:text-2xl text-slate-200 leading-relaxed">
              Tuganire News delivers fact-based, independent reporting focused on Rwanda, Africa, and global stories that shape our future.
            </p>
          </div>
        </section>

        {/* Main Content */}
        <div className="container mx-auto px-4 max-w-4xl py-12 md:py-16">
          {/* Mission Section */}
          <section className="mb-16 md:mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-slate-900 dark:text-white">Our Mission</h2>
            <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              Tuganire Today & Tomorrow (Tuganire News) exists to provide accurate, independent, and ethical journalism that informs, educates, and empowers communities. We bridge local realities with global perspectives, ensuring every story serves truth, accountability, and public interest.
            </p>
          </section>

          {/* By the Numbers Section */}
          <section className="mb-16 md:mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-slate-900 dark:text-white">By the Numbers</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
              <div className="text-center p-8 bg-slate-50 dark:bg-slate-900 rounded-lg hover:shadow-lg transition-shadow duration-300">
                <div className="text-5xl md:text-6xl font-bold text-blue-600 dark:text-blue-400 mb-3">50K+</div>
                <p className="text-lg text-slate-700 dark:text-slate-300 font-medium">Monthly Readers</p>
              </div>
              <div className="text-center p-8 bg-slate-50 dark:bg-slate-900 rounded-lg hover:shadow-lg transition-shadow duration-300">
                <div className="text-5xl md:text-6xl font-bold text-green-600 dark:text-green-400 mb-3">20+</div>
                <p className="text-lg text-slate-700 dark:text-slate-300 font-medium">Professional Contributors</p>
              </div>
              <div className="text-center p-8 bg-slate-50 dark:bg-slate-900 rounded-lg hover:shadow-lg transition-shadow duration-300">
                <div className="text-5xl md:text-6xl font-bold text-purple-600 dark:text-purple-400 mb-3">4+</div>
                <p className="text-lg text-slate-700 dark:text-slate-300 font-medium">Months of Independent Journalism</p>
              </div>
            </div>
          </section>

          {/* Our Values Section */}
          <section className="mb-16 md:mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-slate-900 dark:text-white">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-start p-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
                <CheckCircle className="h-12 w-12 text-blue-600 dark:text-blue-400 mb-4" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Accuracy</h3>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">Every story is verified through trusted sources and editorial review, ensuring factual integrity.</p>
              </div>
              <div className="flex flex-col items-start p-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
                <Shield className="h-12 w-12 text-green-600 dark:text-green-400 mb-4" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Integrity</h3>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">We operate independently, free from political or corporate influence, serving only the public interest.</p>
              </div>
              <div className="flex flex-col items-start p-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
                <Users className="h-12 w-12 text-purple-600 dark:text-purple-400 mb-4" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Community First</h3>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">Stories are driven by real issues affecting real people, amplifying voices that matter most.</p>
              </div>
            </div>
          </section>

          {/* Leadership Section */}
          <section className="mb-16 md:mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-slate-900 dark:text-white">Leadership</h2>
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12">
              <div className="flex-shrink-0">
                <div className="w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 border-4 border-slate-300 dark:border-slate-600 flex items-center justify-center">
                  <Image
                    src="/placeholder-user.jpg"
                    alt="Founder & Editor-in-Chief"
                    width={224}
                    height={224}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">Founder & Editor-in-Chief</h3>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg">
                  A software engineer and digital media innovator passionate about ethical journalism, technology, and community-driven storytelling. With a strong background in web technologies and digital platforms, the founder established Tuganire News to modernize local journalism while preserving truth and accountability.
                </p>
              </div>
            </div>
          </section>

          {/* Get in Touch Section */}
          <section className="bg-slate-50 dark:bg-slate-900 rounded-lg p-8 md:p-12 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-slate-900 dark:text-white">Get in Touch</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex items-start gap-4">
                <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Email</h3>
                  <a href="mailto:tuganire.tntorg@gmail.com" className="text-blue-600 dark:text-blue-400 hover:underline">
                    tuganire.tntorg@gmail.com
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Phone className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Phone & WhatsApp</h3>
                  <a href="tel:+250780126094" className="text-blue-600 dark:text-blue-400 hover:underline">
                    +250 780 126 094
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <MapPin className="h-6 w-6 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Location</h3>
                  <p className="text-slate-700 dark:text-slate-300">Kigali, Rwanda</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
