"use client"

import { useEffect, useState } from "react"
import NewsletterForm from "@/components/NewsletterForm"

const STORAGE_KEY = "fundtracker_newsletter_popup_dismissed"

export default function NewsletterPopup() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const dismissed = window.localStorage.getItem(STORAGE_KEY)
    if (dismissed) {
      return
    }

    const timer = window.setTimeout(() => setOpen(true), 5000)
    return () => window.clearTimeout(timer)
  }, [])

  if (!open) {
    return null
  }

  const close = () => {
    window.localStorage.setItem(STORAGE_KEY, "true")
    setOpen(false)
  }

  return (
    <div className="fixed inset-0 z-[80] bg-black/40 backdrop-blur-sm flex items-end md:items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 md:p-8">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <p className="text-sm uppercase tracking-wide text-emerald-700 font-semibold">Weekly Insights</p>
            <h2 className="text-2xl font-bold text-gray-900">Get top campaigns in your inbox</h2>
          </div>
          <button
            onClick={close}
            className="text-gray-500 hover:text-gray-800 text-xl leading-none"
            aria-label="Close newsletter popup"
          >
            x
          </button>
        </div>

        <p className="text-gray-700 mb-5">
          Join FundTracker updates for trending campaigns, trusted NGOs, and practical donation guides.
        </p>

        <NewsletterForm />
      </div>
    </div>
  )
}
