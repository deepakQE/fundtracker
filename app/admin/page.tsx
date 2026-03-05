"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import type { Campaign } from "@/types/campaign"
import { calculateProgress, formatInrCurrency, formatInrRange, toSafeNumber } from "@/lib/currency"
import CampaignImage from "@/components/CampaignImage"

interface Subscriber {
  id: string
  email: string
  created_at: string
}

export default function AdminPage() {
  const router = useRouter()

  /* ================= STATE ================= */

  const [activeTab, setActiveTab] = useState<"campaigns" | "subscribers">("campaigns")
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [totalSubscribers, setTotalSubscribers] = useState(0)
  const [subscriberLoading, setSubscriberLoading] = useState(false)

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
  const [syncing, setSyncing] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null)
  const [apiStatus, setApiStatus] = useState<"checking" | "online" | "offline">("checking")

  /* ================= FETCH ================= */

  async function fetchCampaigns() {
    const { data } = await supabase
      .from("campaigns")
      .select("*")
      .order("created_at", { ascending: false })

    if (data) {
      setCampaigns(data)
      setApiStatus("online")
    } else {
      setApiStatus("offline")
    }
  }

  async function fetchSubscribers() {
    setSubscriberLoading(true)
    try {
      // Get total count
      const { count } = await supabase
        .from("subscribers")
        .select("*", { count: "exact", head: true })

      setTotalSubscribers(count || 0)

      // Get recent 10 subscribers
      const { data } = await supabase
        .from("subscribers")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10)

      if (data) {
        setSubscribers(data)
      }
    } catch {
      // Error fetching subscribers
    } finally {
      setSubscriberLoading(false)
    }
  }

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
      fetchSubscribers()
    }

    init()
  }, [router])

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

  const trendingCampaign = [...campaigns].sort((a, b) => 
    (b.trend_score || 0) - (a.trend_score || 0)
  )[0]

  async function handleRefreshAnalytics() {
    setMessage(null)
    await fetchCampaigns()
    setMessage("Analytics refreshed.")
  }

  async function handleRefreshSubscribers() {
    setMessage(null)
    await fetchSubscribers()
    setMessage("Subscribers refreshed.")
  }

  function handleExportSubscribers() {
    if (subscribers.length === 0) {
      setMessage("No subscribers to export.")
      return
    }

    // Get all subscribers for export
    supabase
      .from("subscribers")
      .select("email, created_at")
      .then(({ data }) => {
        if (!data) return

        // Create CSV content
        const headers = ["Email", "Subscribed Date"]
        const rows = data.map(s => [
          s.email,
          new Date(s.created_at).toLocaleDateString(),
        ])

        const csvContent = [
          headers.join(","),
          ...rows.map(row => row.map(cell => `"${cell}"`).join(",")),
        ].join("\n")

        // Download CSV
        const blob = new Blob([csvContent], { type: "text/csv" })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `subscribers_${new Date().toISOString().split("T")[0]}.csv`
        link.click()
        window.URL.revokeObjectURL(url)

        setMessage(`✅ Exported ${data.length} subscribers`)
      })
  }

  /* ================= SYNC CAMPAIGNS ================= */

  async function handleSync() {
    setSyncing(true)
    setMessage(null)

    try {
      const response = await fetch('/api/sync-campaigns', {
        method: 'POST',
      })

      const result = await response.json()

      if (result.ok) {
        setMessage(`✅ Sync successful! Fetched: ${result.fetched}, Inserted: ${result.inserted}, Updated: ${result.updated}`)
        setLastSyncTime(new Date().toLocaleString())
        fetchCampaigns()
      } else {
        setMessage(`❌ Sync failed: ${result.errors.join(', ')}`)
      }
    } catch {
      setMessage('❌ Sync error: Unable to connect to API')
    }

    setSyncing(false)
  }

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
    } catch {
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
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">⚙️ Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage campaigns and monitor performance</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors font-semibold"
          >
            🚪 Logout
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("campaigns")}
            className={`px-6 py-3 font-bold text-lg border-b-2 transition-colors ${
              activeTab === "campaigns"
                ? "border-emerald-600 text-emerald-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            📊 Campaigns
          </button>
          <button
            onClick={() => setActiveTab("subscribers")}
            className={`px-6 py-3 font-bold text-lg border-b-2 transition-colors ${
              activeTab === "subscribers"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            📧 Subscribers ({totalSubscribers})
          </button>
        </div>

        {/* Campaign Tab */}
        {activeTab === "campaigns" && (
          <>
        {/* Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <p className="text-gray-600 text-sm font-semibold mb-2">📊 Total Campaigns</p>
            <h2 className="text-4xl font-bold text-emerald-600">{totalCampaigns}</h2>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <p className="text-gray-600 text-sm font-semibold mb-2">💰 Total Raised</p>
            <h2 className="text-3xl font-bold text-green-600">{formatInrCurrency(totalRaised)}</h2>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <p className="text-gray-600 text-sm font-semibold mb-2">📈 Avg Funding</p>
            <h2 className="text-4xl font-bold text-blue-600">
              {averageFunding.toFixed(0)}%
            </h2>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <p className="text-gray-600 text-sm font-semibold mb-2">⏰ Last Sync</p>
            <h2 className="text-lg font-bold text-gray-700">
              {lastSyncTime || 'Never'}
            </h2>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <p className="text-gray-600 text-sm font-semibold mb-2">🌐 API Status</p>
            <h2 className={`text-lg font-bold ${apiStatus === "online" ? "text-emerald-600" : apiStatus === "offline" ? "text-red-600" : "text-gray-700"}`}>
              {apiStatus === "online" ? "Online" : apiStatus === "offline" ? "Offline" : "Checking"}
            </h2>
          </div>
        </div>

        {/* Trending Campaign */}
        {trendingCampaign && (
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-xl shadow-md border-2 border-emerald-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4">🔥 Top Trending Campaign</h3>
            <div className="flex gap-4 items-start">
              {trendingCampaign.image && (
                <CampaignImage 
                  src={trendingCampaign.image} 
                  alt={trendingCampaign.title} 
                  width={96}
                  height={96}
                  className="w-24 h-24 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <h4 className="font-bold text-lg text-gray-900">{trendingCampaign.title}</h4>
                <p className="text-sm text-gray-600">{trendingCampaign.category} • {trendingCampaign.platform}</p>
                <p className="text-emerald-600 font-bold mt-2">
                  {formatInrCurrency(trendingCampaign.amount)} raised
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="bg-emerald-600 text-white px-6 py-4 rounded-lg hover:bg-emerald-700 transition-colors font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {syncing ? '⏳ Syncing...' : '🔄 Sync Campaigns'}
          </button>

          <button
            onClick={handleRefreshAnalytics}
            className="bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 transition-colors font-bold text-lg text-center"
          >
            ♻️ Refresh Analytics
          </button>

          <a
            href="/trending"
            className="bg-purple-600 text-white px-6 py-4 rounded-lg hover:bg-purple-700 transition-colors font-bold text-lg text-center"
          >
            🔥 View Trending
          </a>
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
              <CampaignImage
                src={image}
                alt="Preview"
                width={400}
                height={160}
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
          </>
        )}

        {/* Subscriber Tab */}
        {activeTab === "subscribers" && (
          <>
        {/* Subscriber Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <p className="text-gray-600 text-sm font-semibold mb-2">📧 Total Subscribers</p>
            <h2 className="text-4xl font-bold text-blue-600">{totalSubscribers}</h2>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <p className="text-gray-600 text-sm font-semibold mb-2">📝 Recent Signups</p>
            <h2 className="text-4xl font-bold text-emerald-600">{subscribers.length}</h2>
            <p className="text-xs text-gray-500 mt-1">Last 10 subscribers shown</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <p className="text-gray-600 text-sm font-semibold mb-2">📊 Growth Status</p>
            <h2 className="text-3xl font-bold text-purple-600">
              {totalSubscribers > 0 ? "✅ Active" : "⏳ Awaiting"}
            </h2>
          </div>
        </div>

        {/* Subscriber Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={handleRefreshSubscribers}
            disabled={subscriberLoading}
            className="bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 transition-colors font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {subscriberLoading ? "⏳ Loading..." : "🔄 Refresh Subscribers"}
          </button>

          <button
            onClick={handleExportSubscribers}
            className="bg-emerald-600 text-white px-6 py-4 rounded-lg hover:bg-emerald-700 transition-colors font-bold text-lg"
          >
            📥 Export as CSV
          </button>
        </div>

        {/* Recent Subscribers */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">📧 Recent Subscriptions</h3>
          
          {subscriberLoading ? (
            <p className="text-center py-8 text-gray-500">Loading subscribers...</p>
          ) : subscribers.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No subscribers yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Subscribed Date</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map((subscriber) => (
                    <tr key={subscriber.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{subscriber.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(subscriber.created_at).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
          </>
        )}

      </div>
    </main>
  )
}