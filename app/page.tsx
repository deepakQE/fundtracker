"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

import NewsletterForm from "../components/NewsletterForm"
type Campaign = {
  id: string
  title: string
  platform: string
  amount: number
  goal: number
  category: string
  image?: string
  created_at: string
  trend_score?: number
}

export default function Home() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [sortOption, setSortOption] = useState("Trending")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  const campaignsPerPage = 6

  /* -------------------- */
  /* Fetch Campaigns      */
  /* -------------------- */

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")

      if (error) {
        console.error("Fetch Error:", error)
        setLoading(false)
        return
      }

      if (data) {
        const now = new Date().getTime()

        const ranked: Campaign[] = data.map((campaign: Campaign) => {
          const progress =
            campaign.goal > 0
              ? (campaign.amount / campaign.goal) * 100
              : 0

          const createdAt = new Date(campaign.created_at).getTime()
          const daysOld = (now - createdAt) / (1000 * 60 * 60 * 24)

          const recencyScore = Math.max(0, 100 - daysOld * 5)
          const amountScore = campaign.amount / 1000

          const trend_score =
            progress * 0.6 +
            recencyScore * 0.3 +
            amountScore * 0.1

          return {
            ...campaign,
            trend_score,
          }
        })

        setCampaigns(ranked)
      }

      setLoading(false)
    }

    fetchData()
  }, [])

  /* Reset page on filter change */
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategory, sortOption, searchQuery])

  if (loading) {
    return <p className="p-10 text-center">Loading campaigns...</p>
  }

  /* Categories */
  const categories = [
    "All",
    ...Array.from(new Set(campaigns.map((c) => c.category))),
  ]

  /* Filtering */
  let filteredCampaigns =
    selectedCategory === "All"
      ? campaigns
      : campaigns.filter((c) => c.category === selectedCategory)

  filteredCampaigns = filteredCampaigns.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  /* Sorting */
  if (sortOption === "Trending") {
    filteredCampaigns = [...filteredCampaigns].sort(
      (a, b) => (b.trend_score ?? 0) - (a.trend_score ?? 0)
    )
  }

  if (sortOption === "Highest Funded") {
    filteredCampaigns = [...filteredCampaigns].sort(
      (a, b) => b.amount - a.amount
    )
  }

  if (sortOption === "Lowest Funded") {
    filteredCampaigns = [...filteredCampaigns].sort(
      (a, b) => a.amount - b.amount
    )
  }

  if (sortOption === "Newest") {
    filteredCampaigns = [...filteredCampaigns].sort(
      (a, b) =>
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
    )
  }

  /* Pagination */
  const totalPages = Math.ceil(
    filteredCampaigns.length / campaignsPerPage
  )
  
  {filteredCampaigns.length === 0 && (
  <div className="text-center text-gray-500 py-20">
    No campaigns found.
  </div>
)}
  const paginatedCampaigns = filteredCampaigns.slice(
    (currentPage - 1) * campaignsPerPage,
    currentPage * campaignsPerPage
  )

  return (
    <main className="min-h-screen bg-gray-50 p-10">

      {/* Hero */}
      <section className="text-center py-20 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-3xl mb-16 shadow-xl">
        <h1 className="text-6xl font-extrabold mb-6 tracking-tight">
          FundTracker
        </h1>

        <p className="text-xl max-w-2xl mx-auto mb-8 opacity-90">
          Discover, analyze, and support the most impactful fundraising campaigns — 
          all in one powerful platform.
        </p>

        <div className="flex justify-center gap-4">
          <a
            href="#campaigns"
            className="bg-white text-emerald-600 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition"
          >
            Explore Campaigns
          </a>

          <a
            href="/admin"
            className="border border-white px-6 py-3 rounded-full font-semibold hover:bg-white hover:text-emerald-600 transition"
          >
            Admin Panel
          </a>
        </div>
      </section>

      {/* Search */}
      <div className="flex justify-center mb-6">
        <input
          type="text"
          placeholder="🔍 Search campaigns..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:w-1/2 border border-gray-300 px-4 py-3 rounded-full shadow-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
        />
      </div>

      {/* Results Count */}
      <p className="text-center text-sm text-gray-500 mb-8">
        Showing {filteredCampaigns.length} campaigns
      </p>

      {/* Filters + Sort */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">

        <div className="flex flex-wrap gap-3 justify-center">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition
                ${
                  selectedCategory === cat
                    ? "bg-emerald-600 text-white shadow-md"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="border border-gray-300 px-3 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500"
        >
          <option value="Trending">🔥 Trending</option>
          <option value="Highest Funded">💰 Highest Funded</option>
          <option value="Lowest Funded">📉 Lowest Funded</option>
          <option value="Newest">🆕 Newest</option>
        </select>
      </div>

      {/* Campaign Grid */}
      {paginatedCampaigns.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          No campaigns found.
        </div>
      ) : (
        <section id="campaigns" className="grid md:grid-cols-3 gap-8">
          {paginatedCampaigns.map((campaign, index) => {
            const progress =
              campaign.goal > 0
                ? (campaign.amount / campaign.goal) * 100
                : 0

            return (
              <Link
                href={`/campaign/${campaign.id}`}
                key={`${campaign.id}-${index}`}
                className="relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition"
              >
                <img
                  src={
                    campaign.image ||
                    "https://images.pexels.com/photos/6646918/pexels-photo-6646918.jpeg"
                  }
                  alt={campaign.title}
                  className="w-full h-48 object-cover"
                />

                <div className="p-6">
                  <h2 className="text-lg font-semibold mb-2">
                    {campaign.title}
                  </h2>

                  <p className="text-sm text-gray-500 mb-2">
                    {campaign.platform} • {campaign.category}
                  </p>

                  <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                    <div
                      className="bg-green-500 h-3 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <p className="text-sm font-medium">
                    ₹ {campaign.amount} raised of ₹ {campaign.goal}
                  </p>

                  <p className="text-xs text-gray-400 mt-1">
                    {progress.toFixed(1)}% funded
                  </p>
                </div>
              </Link>
            )
          })}
        </section>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-10 gap-4">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Previous
          </button>

          <span className="px-4 py-2 font-medium">
            Page {currentPage} of {totalPages}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Newsletter Section */}
      <div className="max-w-3xl mx-auto mt-20 bg-white p-10 rounded-2xl shadow text-center">
        <h2 className="text-2xl font-bold mb-4">
          📬 Stay Updated
        </h2>

        <p className="text-gray-600 mb-6">
          Get trending fundraising campaigns directly in your inbox.
        </p>

        <NewsletterForm />
      </div>
      {/* ================= CTA SECTION ================= */}

        <section className="mt-24 bg-black text-white rounded-3xl py-16 px-10 text-center shadow-xl">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Make an Impact?
          </h2>

          <p className="max-w-2xl mx-auto text-gray-300 mb-8 text-lg">
            Join thousands of supporters discovering meaningful fundraising campaigns.
            Track progress, analyze impact, and support causes that matter.
          </p>

          <div className="flex justify-center gap-6">
            <a
              href="#campaigns"
              className="bg-emerald-500 px-6 py-3 rounded-full font-semibold hover:bg-emerald-600 transition"
            >
              Browse Campaigns
            </a>

            <a
              href="/admin"
              className="border border-gray-400 px-6 py-3 rounded-full font-semibold hover:bg-white hover:text-black transition"
            >
              Manage Campaigns
            </a>
          </div>
        </section>
        {/* ================= FOOTER ================= */}

        <footer className="mt-20 border-t pt-10 pb-6 text-center text-gray-500 text-sm">
          <p className="mb-2 font-semibold text-gray-700">
            FundTracker © {new Date().getFullYear()}
          </p>

          <p>
            Built with Next.js + Supabase • Modern Fundraising Intelligence Platform
          </p>
        </footer>

    </main>
  )
}