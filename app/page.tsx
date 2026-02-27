"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

type Campaign = {
  id: string
  title: string
  platform: string
  amount: number
  goal: number
  category: string
  created_at: string
  trend_score?: number
}

export default function Home() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)

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

        const ranked: Campaign[] = data
          .map((campaign: Campaign) => {
            const progress =
              campaign.goal > 0
                ? (campaign.amount / campaign.goal) * 100
                : 0

            // 🧠 Recency score (newer campaigns get boost)
            const createdAt = new Date(campaign.created_at).getTime()
            const daysOld = (now - createdAt) / (1000 * 60 * 60 * 24)

            // New campaign = closer to 100
            const recencyScore = Math.max(0, 100 - daysOld * 5)

            // 🧠 Amount weight (scaled)
            const amountScore = campaign.amount / 1000

            // 🧠 Final Trend Score
            const trend_score =
              progress * 0.6 +
              recencyScore * 0.3 +
              amountScore * 0.1

            return {
              ...campaign,
              trend_score,
            }
          })
          .sort((a, b) => (b.trend_score ?? 0) - (a.trend_score ?? 0))

        setCampaigns(ranked)
      }

      setLoading(false)
    }

    fetchData()
  }, [])

  if (loading) {
    return <p className="p-10 text-center">Loading campaigns...</p>
  }

  return (
    <main className="min-h-screen bg-gray-50 p-10">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <h1 className="text-5xl font-bold mb-4">
          FundTracker 🚀
        </h1>
        <p className="text-gray-600 text-lg">
          Discover and analyze trending fundraising campaigns
        </p>
      </section>

      {/* Campaign Grid */}
      <section className="grid md:grid-cols-3 gap-8">
        {campaigns.map((campaign, index) => {
          const progress =
            campaign.goal > 0
              ? (campaign.amount / campaign.goal) * 100
              : 0

          return (
            <Link
              href={`/campaign/${campaign.id}`}
              key={campaign.id}
              className="relative bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition cursor-pointer"
            >
              {/* 🔥 Trending Badge */}
              {index === 0 && (
                <span className="absolute top-4 right-4 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  🔥 Trending
                </span>
              )}

              <h2 className="text-xl font-semibold mb-2">
                {campaign.title}
              </h2>

              <p className="text-sm text-gray-500 mb-4">
                Platform: {campaign.platform}
              </p>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div
                  className="bg-green-500 h-3 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <p className="text-sm font-medium">
                ₹ {campaign.amount} raised of ₹ {campaign.goal}
              </p>

              <p className="text-xs text-gray-400 mt-2">
                {progress.toFixed(1)}% funded
              </p>
            </Link>
            
            
          )
        })}
      </section>
    </main>
  )
}