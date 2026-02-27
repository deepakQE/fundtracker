"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function AdminPage() {
  const router = useRouter()

  const [title, setTitle] = useState("")
  const [platform, setPlatform] = useState("")
  const [amount, setAmount] = useState("")
  const [goal, setGoal] = useState("")
  const [category, setCategory] = useState("")
  const [loading, setLoading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)

  // 🔐 Protect Admin Route
  useEffect(() => {
    async function checkSession() {
      const { data } = await supabase.auth.getSession()

      if (!data.session) {
        router.push("/login")
      } else {
        setCheckingAuth(false)
      }
    }

    checkSession()
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase
      .from("campaigns")
      .insert([
        {
          title,
          platform,
          amount: Number(amount),
          goal: Number(goal),
          category,
        },
      ])

    if (error) {
      alert("Error adding campaign")
      console.error(error)
    } else {
      alert("Campaign added successfully!")
      setTitle("")
      setPlatform("")
      setAmount("")
      setGoal("")
      setCategory("")
    }

    setLoading(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push("/login")
  }

  if (checkingAuth) {
    return <p className="p-10 text-center">Checking authentication...</p>
  }

  return (
    <main className="min-h-screen p-10 bg-gray-50">
      <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow">

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            Admin Dashboard
          </h1>

          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            type="text"
            placeholder="Campaign Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />

          <input
            type="text"
            placeholder="Platform"
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />

          <input
            type="number"
            placeholder="Amount Raised"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />

          <input
            type="number"
            placeholder="Goal"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />

          <input
            type="text"
            placeholder="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2 rounded"
          >
            {loading ? "Adding..." : "Add Campaign"}
          </button>

        </form>
      </div>
    </main>
  )
}