"use client"

import { useState } from "react"
import { supabase } from "../lib/supabase"

export default function NewsletterForm() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  async function handleSubscribe() {
    if (!email) return

    setLoading(true)

    const { error } = await supabase
      .from("subscribers")
      .insert([{ email }])

    if (error) {
      setMessage("Already subscribed or invalid email.")
    } else {
      setMessage("✓ Subscribed successfully!")
      setEmail("")
      setTimeout(() => setMessage(""), 3000)
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
          className="flex-1 px-4 py-3 rounded-lg border-0 text-gray-900 focus:ring-2 focus:ring-white outline-none transition-all"
        />

        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="px-6 py-3 bg-white text-emerald-600 rounded-lg font-bold hover:bg-gray-100 transition-all duration-300 disabled:opacity-70 whitespace-nowrap"
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