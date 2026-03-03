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
      setMessage("Subscribed successfully!")
      setEmail("")
    }

    setLoading(false)
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border px-4 py-2 rounded w-full max-w-md"
      />

      <button
        onClick={handleSubscribe}
        className="bg-emerald-600 text-white px-6 py-2 rounded"
      >
        {loading ? "Loading..." : "Subscribe"}
      </button>

      {message && <p className="text-sm text-gray-600">{message}</p>}
    </div>
  )
}