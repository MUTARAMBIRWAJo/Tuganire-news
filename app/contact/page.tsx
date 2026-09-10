'use client'

import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Mail, Phone, Clock, CheckCircle } from "lucide-react"
import { useState } from "react"
import { getLocaleFromPath, t } from "@/lib/i18n"
import { usePathname } from "next/navigation"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    purpose: "Editorial Tip",
    message: ""
  })
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")
  const locale = getLocaleFromPath(usePathname())

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    // Basic validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setError(t("requiredFields", locale))
      return
    }

    try {
      // Here you would typically send the form data to an API endpoint
      // For now, we'll just simulate success
      setSubmitted(true)
      setError("")
      setFormData({ name: "", email: "", purpose: "Editorial Tip", message: "" })
      
      // Reset success message after 5 seconds
      setTimeout(() => setSubmitted(false), 5000)
    } catch (err) {
      setError(t("somethingWentWrong", locale))
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-black dark:via-slate-900 dark:to-black text-white py-16 md:py-20">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              {t("contactHero", locale)}
            </h1>
            <p className="text-lg md:text-xl text-slate-200">
              {t("contactDescription", locale)}
            </p>
          </div>
        </section>

        {/* Main Content */}
        <div className="container mx-auto px-4 max-w-5xl py-12 md:py-16">
          {/* Contact Form Section */}
          <section className="mb-16 md:mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-slate-900 dark:text-white">{t("sendMessage", locale)}</h2>
            
            {submitted && (
              <div className="mb-8 p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-4">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-green-900 dark:text-green-100 mb-1">{t("thankYou", locale)}</h3>
                  <p className="text-green-800 dark:text-green-200">
                    {t("messageSent", locale)}
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-8 md:p-10">
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {/* Full Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                    {t("fullName", locale)} *
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="John Doe"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                    {t("emailAddress", locale)} *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              {/* Message Purpose */}
              <div className="mb-6">
                <label htmlFor="purpose" className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  {t("messagePurpose", locale)} *
                </label>
                <select
                  id="purpose"
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                >
                  <option value="Editorial Tip">{t("editorialTip", locale)}</option>
                  <option value="Advertising Inquiry">{t("advertisingInquiry", locale)}</option>
                  <option value="Partnership Proposal">{t("partnershipProposal", locale)}</option>
                  <option value="General Support">{t("generalSupport", locale)}</option>
                </select>
              </div>

              {/* Message */}
              <div className="mb-8">
                <label htmlFor="message" className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  {t("message", locale)} *
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                  placeholder={t("messagePlaceholder", locale)}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 flex items-center justify-center gap-2"
              >
                <CheckCircle className="h-5 w-5" />
                {t("sendMessage", locale)}
              </button>
            </form>
          </section>

          {/* Direct Communication Channels */}
          <section className="mb-16 md:mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-slate-900 dark:text-white">{t("otherWays", locale)}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Email */}
              <a
                href="mailto:tuganire.tntorg@gmail.com"
                className="flex items-start gap-6 p-8 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-800 dark:to-slate-900 border border-blue-200 dark:border-slate-700 rounded-lg hover:shadow-lg transition-shadow duration-300"
              >
                <Mail className="h-10 w-10 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t("emailUs", locale)}</h3>
                  <p className="text-blue-600 dark:text-blue-400 font-medium mb-1">
                    tuganire.tntorg@gmail.com
                  </p>
                  <p className="text-sm text-slate-700 dark:text-slate-400">
                    {t("responseBusiness", locale)}
                  </p>
                </div>
              </a>

              {/* Phone */}
              <a
                href="tel:+250780126094"
                className="flex items-start gap-6 p-8 bg-gradient-to-br from-green-50 to-green-100 dark:from-slate-800 dark:to-slate-900 border border-green-200 dark:border-slate-700 rounded-lg hover:shadow-lg transition-shadow duration-300"
              >
                <Phone className="h-10 w-10 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t("callWhatsApp", locale)}</h3>
                  <p className="text-green-600 dark:text-green-400 font-medium mb-1">
                    +250 780 126 094
                  </p>
                  <p className="text-sm text-slate-700 dark:text-slate-400">
                    {t("responseUrgent", locale)}
                  </p>
                </div>
              </a>
            </div>
          </section>

          {/* Response Guarantee */}
          <section className="mb-16 md:mb-20 bg-blue-50 dark:bg-slate-800 border-l-4 border-blue-600 dark:border-blue-400 p-8 rounded-lg">
            <div className="flex items-start gap-4">
              <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{t("responseGuarantee", locale)}</h3>
                <p className="text-slate-700 dark:text-slate-300">
                  {t("responseText", locale)}
                </p>
              </div>
            </div>
          </section>

          {/* Social Proof */}
          <section className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-slate-900 dark:text-white">{t("trustedByLeaders", locale)}</h2>
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-8">
              <div className="mb-6">
                <div className="flex justify-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400">★</span>
                  ))}
                </div>
              </div>
              <p className="text-lg text-slate-700 dark:text-slate-300 italic mb-4">
                "Tuganire News represents the future of responsible digital journalism in Rwanda. Their professionalism and commitment to truth set them apart."
              </p>
              <p className="font-semibold text-slate-900 dark:text-white">
                {t("partnerCollaborator", locale)}
              </p>
            </div>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
