"use client"

import { useEffect, useState, useCallback } from "react"
import { calculateProgress, formatInrCurrency, toSafeNumber } from "@/lib/currency"
import { getPrimaryCampaigns } from "@/lib/campaignData"

type PlatformData = {
  name: string
  fees: number
  trust_score: number
  success_rate: number
  campaigns: number
  raised: number
  avg_goal: number
  days_active: number
}

export default function PlatformComparisonPage() {
  const [platforms, setPlatforms] = useState<PlatformData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMetric, setSelectedMetric] = useState<"fees" | "trust" | "success" | "raised">("trust")

  const fetchPlatformData = useCallback(async () => {
    setLoading(true)
    try {
      const { campaigns: allCampaigns, source } = await getPrimaryCampaigns()
      if (source === "mock") {
        console.warn("Using mock campaigns fallback because Supabase returned empty data")
      }

      // Calculate platform stats
      const platformMap = new Map()

      allCampaigns.forEach((campaign) => {
        if (!platformMap.has(campaign.platform)) {
          platformMap.set(campaign.platform, {
            campaigns: 0,
            raised: 0,
            goals: 0,
            success_count: 0,
            created_dates: [],
          })
        }

        const data = platformMap.get(campaign.platform)
        data.campaigns += 1
        data.raised += toSafeNumber(campaign.amount)
        data.goals += toSafeNumber(campaign.goal)
        data.created_dates.push(new Date(campaign.created_at).getTime())

        if (calculateProgress(campaign.amount, campaign.goal) >= 100) {
          data.success_count += 1
        }
      })

      const platformData: PlatformData[] = Array.from(platformMap.entries()).map(([name, data]) => {
        const trustScores: { [key: string]: number } = {
          "GlobalGiving": 94,
          "GoFundMe": 92,
          "JustGiving": 91,
          "GiveWell": 96,
          "Charity Navigator": 95,
        }

        const platformFees: { [key: string]: number } = {
          "GlobalGiving": 4,
          "GoFundMe": 5,
          "JustGiving": 5,
          "GiveWell": 3,
          "Charity Navigator": 0,
        }

        const now = Date.now()
        const oldestDate = Math.min(...data.created_dates)
        const daysActive = Math.floor((now - oldestDate) / (1000 * 60 * 60 * 24))

        return {
          name,
          fees: platformFees[name] || 4.5,
          trust_score: trustScores[name] || 85,
          success_rate: data.campaigns > 0 ? (data.success_count / data.campaigns) * 100 : 0,
          campaigns: data.campaigns,
          raised: data.raised,
          avg_goal: data.campaigns > 0 ? data.goals / data.campaigns : 0,
          days_active: Math.max(1, daysActive),
        }
      })

      setPlatforms(platformData.sort((a, b) => b.trust_score - a.trust_score))
    } catch (err) {
      console.error("Error:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPlatformData()
  }, [fetchPlatformData])

  const sortedPlatforms = [...platforms].sort((a, b) => {
    if (selectedMetric === "fees") return a.fees - b.fees
    if (selectedMetric === "trust") return b.trust_score - a.trust_score
    if (selectedMetric === "success") return b.success_rate - a.success_rate
    return b.raised - a.raised
  })

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50 to-gray-50 flex items-center justify-center">
        <div className="text-2xl font-bold text-emerald-600">Loading platform data...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50 to-gray-50">
      {/* HERO */}
      <section className="bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 text-white px-4 md:px-6 py-12 md:py-16">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-3 md:mb-4">
            ⚖️ Platform Comparison
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-emerald-100">
            Compare fundraising platforms on fees, trust, success rates, and more
          </p>
        </div>
      </section>

      {/* KEY INSIGHTS */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[
            { icon: "💰", label: "Lowest Fees", value: sortedPlatforms[0]?.fees || "4%", detail: sortedPlatforms[0]?.name },
            { icon: "✅", label: "Most Trusted", value: sortedPlatforms.sort((a, b) => b.trust_score - a.trust_score)[0]?.trust_score || 94, detail: sortedPlatforms.sort((a, b) => b.trust_score - a.trust_score)[0]?.name },
            { icon: "📈", label: "Best Success Rate", value: (sortedPlatforms.sort((a, b) => b.success_rate - a.success_rate)[0]?.success_rate || 85).toFixed(1) + "%", detail: sortedPlatforms.sort((a, b) => b.success_rate - a.success_rate)[0]?.name },
            { icon: "💵", label: "Total Fundraised", value: formatInrCurrency(sortedPlatforms.reduce((sum, p) => sum + toSafeNumber(p.raised), 0)), detail: "Across all platforms" },
          ].map((metric, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-md border border-emerald-100 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-600 font-semibold">{metric.label}</h3>
                <span className="text-2xl">{metric.icon}</span>
              </div>
              <p className="text-3xl font-bold text-emerald-600">{metric.value}</p>
              <p className="text-xs text-gray-500 mt-2">{metric.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SORT OPTIONS */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="flex gap-2 flex-wrap justify-center">
          {[
            { value: "trust", label: "💚 Most Trusted" },
            { value: "success", label: "📈 Best Success" },
            { value: "fees", label: "💰 Lowest Fees" },
            { value: "raised", label: "🏆 Most Funded" },
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => setSelectedMetric(filter.value as "fees" | "trust" | "success" | "raised")}
              className={`px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold transition-all duration-300 text-sm md:text-base ${
                selectedMetric === filter.value
                  ? "bg-emerald-600 text-white shadow-lg"
                  : "bg-white text-gray-700 border border-gray-200 hover:border-emerald-600"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </section>

      {/* PLATFORM CARDS */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 pb-20">
        <div className="space-y-4">
          {sortedPlatforms.map((platform, idx) => (
            <div
              key={platform.name}
              className="bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg hover:border-emerald-300 transition-all duration-300 overflow-hidden"
            >
              <div className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* PLATFORM INFO */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-sm ${
                        idx === 0
                          ? "bg-gradient-to-br from-yellow-400 to-yellow-500"
                          : idx === 1
                          ? "bg-gradient-to-br from-gray-400 to-gray-500"
                          : idx === 2
                          ? "bg-gradient-to-br from-orange-400 to-orange-500"
                          : "bg-gradient-to-br from-emerald-500 to-teal-500"
                      }`}>
                        {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : "#" + (idx + 1)}
                      </div>
                      <div>
                        <h3 className="text-lg md:text-xl font-bold text-gray-900">{platform.name}</h3>
                        <p className="text-xs text-gray-500">{platform.campaigns} campaigns</p>
                      </div>
                    </div>
                  </div>

                  {/* STATS GRID */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-4">
                    {/* FEES */}
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200 text-center">
                      <p className="text-xs text-gray-600 font-semibold mb-1">Fees</p>
                      <p className="text-2xl font-bold text-blue-600">{platform.fees}%</p>
                    </div>

                    {/* TRUST SCORE */}
                    <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200 text-center">
                      <p className="text-xs text-gray-600 font-semibold mb-1">Trust</p>
                      <p className="text-2xl font-bold text-emerald-600">{platform.trust_score}</p>
                    </div>

                    {/* SUCCESS RATE */}
                    <div className="bg-purple-50 rounded-lg p-3 border border-purple-200 text-center">
                      <p className="text-xs text-gray-600 font-semibold mb-1">Success</p>
                      <p className="text-2xl font-bold text-purple-600">{platform.success_rate.toFixed(0)}%</p>
                    </div>

                    {/* RAISED */}
                    <div className="bg-orange-50 rounded-lg p-3 border border-orange-200 text-center">
                      <p className="text-xs text-gray-600 font-semibold mb-1">Raised</p>
                      <p className="text-lg font-bold text-orange-600">{formatInrCurrency(platform.raised)}</p>
                    </div>
                  </div>
                </div>

                {/* RECOMMENDATION BADGE */}
                {idx === 0 && selectedMetric === "trust" && (
                  <div className="mt-4 pt-4 border-t border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50 -mx-4 md:-mx-6 px-4 md:px-6 py-3">
                    <p className="text-sm text-emerald-700 font-semibold">
                      ⭐ Recommended: Best overall for trust and donor security
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* DETAILED COMPARISON TABLE */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900">Detailed Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm md:text-base">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-bold text-gray-700">Platform</th>
                  <th className="text-center py-3 px-4 font-bold text-gray-700">Fees</th>
                  <th className="text-center py-3 px-4 font-bold text-gray-700">Trust Score</th>
                  <th className="text-center py-3 px-4 font-bold text-gray-700">Success %</th>
                  <th className="text-center py-3 px-4 font-bold text-gray-700">Campaigns</th>
                  <th className="text-center py-3 px-4 font-bold text-gray-700">Total Raised</th>
                </tr>
              </thead>
              <tbody>
                {sortedPlatforms.map((platform) => (
                  <tr key={platform.name} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-gray-900">{platform.name}</td>
                    <td className="py-3 px-4 text-center text-blue-600 font-bold">{platform.fees}%</td>
                    <td className="py-3 px-4 text-center">
                      <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-semibold">
                        {platform.trust_score}/100
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-purple-600">{platform.success_rate.toFixed(1)}%</td>
                    <td className="py-3 px-4 text-center text-gray-700">{platform.campaigns}</td>
                    <td className="py-3 px-4 text-center font-bold text-orange-600">{formatInrCurrency(platform.raised)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  )
}
