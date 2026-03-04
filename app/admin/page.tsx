"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import type { Campaign } from "@/types/campaign"
import { calculateProgress, formatInrCurrency, formatInrRange, toSafeNumber } from "@/lib/currency"

export default function AdminPage() {
  const router = useRouter()

  /* ================= STATE ================= */

  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)

  const [title, setTitle] = useState("")
  const [platform, setPlatform] = useState("")
  const [amount, setAmount] = useState("")
  const [goal, setGoal] = useState("")
  const [category, setCategory] = useState("")
  const [image, setImage] = useState("")
  const [description, setDescription] = useState("")

  const [loading, setLoading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [message, setMessage] = useState<string | null>(null)

  /* ================= AUTH ================= */

  useEffect(() => {
    async function init() {
      const { data } = await supabase.auth.getSession()

      if (!data.session) {
        router.push("/login")
        return
      }

      setCheckingAuth(false)
      fetchCampaigns()
    }

    init()
  }, [router])

  /* ================= FETCH ================= */

  async function fetchCampaigns() {
    const { data } = await supabase
      .from("campaigns")
      .select("*")
      .order("created_at", { ascending: false })

    if (data) setCampaigns(data)
  }

  /* ================= ANALYTICS ================= */

  const totalCampaigns = campaigns.length

  const totalRaised = campaigns.reduce(
    (sum, c) => sum + toSafeNumber(c.amount),
    0
  )

  const averageFunding =
    campaigns.length > 0
      ? campaigns.reduce(
          (sum, c) =>
            sum +
            calculateProgress(c.amount, c.goal),
          0
        ) / campaigns.length
      : 0

  /* ================= SUBMIT ================= */

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      if (editingId) {
        await supabase
          .from("campaigns")
          .update({
            title,
            platform,
            amount: Number(amount),
            goal: Number(goal),
            category,
            image,
            description,
          })
          .eq("id", editingId)

        setMessage("Campaign updated successfully!")
      } else {
        await supabase
          .from("campaigns")
          .insert([
            {
              title,
              platform,
              amount: Number(amount),
              goal: Number(goal),
              category,
              image,
              description,
              created_at: new Date().toISOString(),
            },
          ])

        setMessage("Campaign added successfully!")
      }

      resetForm()
      fetchCampaigns()
    } catch (error) {
      setMessage("Something went wrong.")
    }

    setLoading(false)
  }

  function resetForm() {
    setTitle("")
    setPlatform("")
    setAmount("")
    setGoal("")
    setCategory("")
    setImage("")
    setDescription("")
    setEditingId(null)
  }

  /* ================= DELETE ================= */

  async function handleDelete(id: string) {
    if (!confirm("Delete this campaign?")) return

    await supabase.from("campaigns").delete().eq("id", id)
    setMessage("Campaign deleted successfully!")
    fetchCampaigns()
  }

  /* ================= EDIT ================= */

  function handleEdit(campaign: Campaign) {
    setEditingId(campaign.id)
    setTitle(campaign.title)
    setPlatform(campaign.platform)
    setAmount(String(campaign.amount))
    setGoal(String(campaign.goal))
    setCategory(campaign.category)
    setImage(campaign.image || "")
    setDescription(campaign.description || "")
  }

  /* ================= LOGOUT ================= */

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push("/login")
  }

  if (checkingAuth) {
    return <p className="p-10 text-center">Checking authentication...</p>
  }

  /* ================= UI ================= */

  return (
    <main className="min-h-screen bg-gray-100 p-10">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>

        {/* Analytics */}
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-gray-500">Total Campaigns</p>
            <h2 className="text-2xl font-bold">{totalCampaigns}</h2>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-gray-500">Total Raised</p>
            <h2 className="text-2xl font-bold">{formatInrCurrency(totalRaised)}</h2>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-gray-500">Average Funding</p>
            <h2 className="text-2xl font-bold">
              {averageFunding.toFixed(0)}%
            </h2>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className="bg-green-100 text-green-700 p-3 rounded">
            {message}
          </div>
        )}

        {/* Form */}
        <div className="bg-white p-6 rounded-xl shadow">
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-2 gap-4"
          >
            <input
              type="text"
              placeholder="Campaign Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border p-2 rounded col-span-2"
              required
            />

            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border p-2 rounded col-span-2"
            />

            <input
              type="text"
              placeholder="Image URL"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="border p-2 rounded col-span-2"
            />

            {image && (
              <img
                src={image}
                alt="Preview"
                className="col-span-2 h-40 object-cover rounded"
              />
            )}

            <input
              type="text"
              placeholder="Platform"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="border p-2 rounded"
              required
            />

            <input
              type="text"
              placeholder="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border p-2 rounded"
              required
            />

            <input
              type="number"
              placeholder="Amount Raised"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="border p-2 rounded"
              required
            />

            <input
              type="number"
              placeholder="Goal"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="border p-2 rounded"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="col-span-2 bg-black text-white py-2 rounded"
            >
              {loading
                ? "Saving..."
                : editingId
                ? "Update Campaign"
                : "Add Campaign"}
            </button>
          </form>
        </div>

        {/* Campaign List */}
        <div className="space-y-4">
          {campaigns.map((campaign) => {
            const progress = calculateProgress(campaign.amount, campaign.goal)

            return (
              <div
                key={campaign.id}
                className="bg-white p-6 rounded-xl shadow"
              >
                <h3 className="text-lg font-semibold">
                  {campaign.title}
                </h3>
                <p className="text-sm text-gray-500">
                  {campaign.platform} | {campaign.category}
                </p>
                <p className="text-sm mb-2">
                  {formatInrRange(campaign.amount, campaign.goal)}
                </p>

                <div className="w-full bg-gray-200 h-2 rounded">
                  <div
                    className="bg-green-500 h-2 rounded"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="mt-4 space-x-2">
                  <button
                    onClick={() => handleEdit(campaign)}
                    className="bg-blue-500 text-white px-3 py-1 rounded"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(campaign.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </main>
  )
}