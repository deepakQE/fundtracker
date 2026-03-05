"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { calculateProgress, formatInrCurrency, toSafeNumber } from "@/lib/currency"
import { getMockPeopleHelpedIncrement, getMockTrustScore } from "@/lib/mockAnalyticsData"
import { getPrimaryCampaigns } from "@/lib/campaignData"

type NGORanking = {
  name: string
  total_raised: number
  campaign_count: number
  trust_score: number
  avg_success_rate: number
  platforms: string[]
  people_helped: number
  rank: number
}

export default function NGORankingsPage() {
  const [ngos, setNgos] = useState<NGORanking[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<"raised" | "trust" | "success">("raised")

  const fetchNGORankings = useCallback(async () => {
    setLoading(true)
    try {
      const { campaigns: allCampaigns, source } = await getPrimaryCampaigns()
      if (source === "mock") {
        console.warn("Using mock campaigns fallback because Supabase returned empty data")
      }

      // Group by organization
      const ngoMap = new Map()

      allCampaigns.forEach((campaign) => {
        const ngoName = campaign.ngo_name || "Unknown NGO"
        
        if (!ngoMap.has(ngoName)) {
          ngoMap.set(ngoName, {
            name: ngoName,
            total_raised: 0,
            campaign_count: 0,
            platforms: new Set(),
            trust_scores: [],
            success_rates: [],
            people_helped: 0,
          })
        }

        const ngo = ngoMap.get(ngoName)
        ngo.total_raised += toSafeNumber(campaign.amount)
        ngo.campaign_count += 1
        ngo.platforms.add(campaign.platform)
        
        // Mock trust score based on funding
        const trustScore = getMockTrustScore()
        ngo.trust_scores.push(trustScore)

        // Calculate success rate
        const successRate = calculateProgress(campaign.amount, campaign.goal)
        ngo.success_rates.push(successRate)

        // Mock people helped
        ngo.people_helped += getMockPeopleHelpedIncrement()
      })

      // Convert to array and calculate averages (don't sort here yet)
      const ngoArray: NGORanking[] = Array.from(ngoMap.values()).map((ngo, idx) => ({
        rank: idx + 1,
        name: ngo.name,
        total_raised: ngo.total_raised,
        campaign_count: ngo.campaign_count,
        trust_score: ngo.trust_scores.length > 0
          ? ngo.trust_scores.reduce((a: number, b: number) => a + b, 0) / ngo.trust_scores.length
          : 50,
        avg_success_rate: ngo.success_rates.length > 0
          ? ngo.success_rates.reduce((a: number, b: number) => a + b, 0) / ngo.success_rates.length
          : 0,
        platforms: Array.from(ngo.platforms),
        people_helped: ngo.people_helped,
      }))

      setNgos(ngoArray)
    } catch (err) {
      console.error("Error fetching NGO rankings:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNGORankings()
  }, [fetchNGORankings])

  // Sort the ngos based on sortBy
  const sortedNgos = [...ngos]
  if (sortBy === "trust") {
    sortedNgos.sort((a, b) => b.trust_score - a.trust_score)
  } else if (sortBy === "success") {
    sortedNgos.sort((a, b) => b.avg_success_rate - a.avg_success_rate)
  } else {
    sortedNgos.sort((a, b) => b.total_raised - a.total_raised)
  }

  // Re-rank after sorting
  sortedNgos.forEach((ngo, idx) => {
    ngo.rank = idx + 1
  })

  const handleSort = (newSortBy: typeof sortBy) => {
    setSortBy(newSortBy)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50 to-gray-50 flex items-center justify-center">
        <div className="text-2xl font-bold text-emerald-600">Loading NGO rankings...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50 to-gray-50">
      {/* HERO */}
      <section className="bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 text-white px-4 md:px-6 py-12 md:py-16">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-3 md:mb-4">
            🏆 Top NGOs Ranking
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-emerald-100">
            Discover the most impactful and trusted organizations globally
          </p>
        </div>
      </section>

      {/* SORT OPTIONS */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="flex gap-3 flex-wrap justify-center">
          <button
            onClick={() => handleSort("raised")}
            className={`px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold transition-all duration-300 ${
              sortBy === "raised"
                ? "bg-emerald-600 text-white shadow-lg"
                : "bg-white text-gray-700 border border-gray-200 hover:border-emerald-600"
            }`}
          >
            💰 Most Funded
          </button>
          <button
            onClick={() => handleSort("trust")}
            className={`px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold transition-all duration-300 ${
              sortBy === "trust"
                ? "bg-emerald-600 text-white shadow-lg"
                : "bg-white text-gray-700 border border-gray-200 hover:border-emerald-600"
            }`}
          >
            ✅ Most Trusted
          </button>
          <button
            onClick={() => handleSort("success")}
            className={`px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold transition-all duration-300 ${
              sortBy === "success"
                ? "bg-emerald-600 text-white shadow-lg"
                : "bg-white text-gray-700 border border-gray-200 hover:border-emerald-600"
            }`}
          >
            📈 Highest Success Rate
          </button>
        </div>
      </section>

      {/* NGO RANKINGS */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 pb-20">
        <div className="space-y-4">
          {ngos.slice(0, 10).map((ngo) => (
            <div
              key={ngo.name}
              className="bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg hover:border-emerald-300 transition-all duration-300 overflow-hidden"
            >
              <div className="p-4 md:p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    {/* RANK BADGE */}
                    <div className="flex-shrink-0">
                      <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center font-bold text-white text-lg md:text-xl ${
                        ngo.rank === 1
                          ? "bg-gradient-to-br from-yellow-400 to-yellow-500"
                          : ngo.rank === 2
                          ? "bg-gradient-to-br from-gray-400 to-gray-500"
                          : ngo.rank === 3
                          ? "bg-gradient-to-br from-orange-400 to-orange-500"
                          : "bg-gradient-to-br from-emerald-500 to-teal-500"
                      }`}>
                        {ngo.rank === 1 ? "🥇" : ngo.rank === 2 ? "🥈" : ngo.rank === 3 ? "🥉" : "#" + ngo.rank}
                      </div>
                    </div>

                    {/* INFO */}
                    <div className="flex-1">
                      <h2 className="text-lg md:text-2xl font-bold text-gray-900 mb-2">
                        <Link href={`/ngo/${encodeURIComponent(ngo.name)}`} className="hover:text-emerald-700 transition-colors">
                          {ngo.name}
                        </Link>
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        {ngo.platforms.map((platform) => (
                          <span
                            key={platform}
                            className="px-2 md:px-3 py-0.5 md:py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold"
                          >
                            {platform}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* TRUST BADGE */}
                  <div className="flex-shrink-0 text-right">
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg px-3 md:px-4 py-2 md:py-3">
                      <p className="text-xs text-gray-600 font-semibold">Trust Score</p>
                      <p className="text-2xl md:text-3xl font-bold text-emerald-600">
                        {ngo.trust_score.toFixed(0)}
                      </p>
                      <p className="text-xs text-gray-500">/100</p>
                    </div>
                  </div>
                </div>

                {/* STATS GRID */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-3 md:p-4 border border-emerald-100">
                    <p className="text-xs text-gray-600 font-semibold mb-1">Total Fundraised</p>
                    <p className="text-lg md:text-2xl font-bold text-emerald-600">
                      {formatInrCurrency(ngo.total_raised)}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-3 md:p-4 border border-blue-100">
                    <p className="text-xs text-gray-600 font-semibold mb-1">Active Campaigns</p>
                    <p className="text-lg md:text-2xl font-bold text-blue-600">
                      {ngo.campaign_count}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-3 md:p-4 border border-purple-100">
                    <p className="text-xs text-gray-600 font-semibold mb-1">Success Rate</p>
                    <p className="text-lg md:text-2xl font-bold text-purple-600">
                      {ngo.avg_success_rate.toFixed(1)}%
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-3 md:p-4 border border-orange-100">
                    <p className="text-xs text-gray-600 font-semibold mb-1">People Helped</p>
                    <p className="text-lg md:text-2xl font-bold text-orange-600">
                      {(ngo.people_helped / 1000).toFixed(1)}K
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
