"use client"

import { useState } from "react"

export default function NewsletterForm() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  async function handleSubscribe() {
    if (!email) return

    setLoading(true)
    setMessage("")

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage("✓ Subscribed successfully!")
        setEmail("")
        setTimeout(() => setMessage(""), 3000)
      } else if (response.status === 409) {
        setMessage("📧 Already subscribed")
      } else {
        setMessage(data.error || "Subscription failed")
      }
    } catch {
      setMessage("❌ Network error. Please try again.")
    }

    setLoading(false)
  }

  return (
    <div className="w-full flex flex-col gap-3">
      <div className="flex gap-2 w-full">
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
          className="flex-1 px-4 py-3 rounded-lg border-0 text-gray-900 focus:ring-2 focus:ring-white outline-none transition-all"
        />

        <button
          onClick={handleSubscribe}
          disabled={loading || !email}
          className="px-6 py-3 bg-white text-emerald-600 rounded-lg font-bold hover:bg-gray-100 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {loading ? "..." : "Subscribe"}
        </button>
      </div>

      {message && (
        <p className={`text-sm font-medium ${
          message.includes("successfully") 
            ? "text-emerald-100" 
            : "text-red-200"
        }`}>
          {message}
        </p>
      )}
    </div>
  )
}