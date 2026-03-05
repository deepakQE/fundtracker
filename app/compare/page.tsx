"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import { calculateProgress, formatInrCurrency } from "@/lib/currency"
import { getPrimaryCampaigns } from "@/lib/campaignData"
import CampaignImage from "@/components/CampaignImage"

type Campaign = {
  id: string
  title: string
  platform: string
  amount: number
  goal: number
  category: string
  image?: string
  url?: string
  ngo_name?: string
  created_at: string
  trust_score?: number
}

export default function ComparisonToolPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const [sortBy, setSortBy] = useState<"trust" | "growth" | "funded">("trust")
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(() => Date.now())

  useEffect(() => {
    async function fetchCampaigns() {
      setLoading(true)
      const { campaigns: allCampaigns } = await getPrimaryCampaigns()
      setCampaigns(allCampaigns)
      setCurrentTime(Date.now())
      setLoading(false)
    }

    fetchCampaigns()
  }, [])

  const categories = Array.from(new Set(campaigns.map((c) => c.category)))

  const filteredCampaigns =
    selectedCategory === "All"
      ? campaigns
      : campaigns.filter((c) => c.category === selectedCategory)

  const withMetrics = useMemo(() => {
    return filteredCampaigns.map((campaign) => {
      const daysOld = Math.max(1, (currentTime - new Date(campaign.created_at).getTime()) / (1000 * 60 * 60 * 24))
      return {
        ...campaign,
        growthScore: calculateProgress(campaign.amount, campaign.goal) / daysOld,
        trustScore: campaign.trust_score ?? Math.min(95, 55 + Math.floor(calculateProgress(campaign.amount, campaign.goal) / 2)),
      }
    })
  }, [filteredCampaigns, currentTime])

  const sortedCampaigns = [...withMetrics].sort((a, b) => {
    if (sortBy === "funded") {
      return b.amount - a.amount
    }
    if (sortBy === "growth") {
      return b.growthScore - a.growthScore
    }
    return b.trustScore - a.trustScore
  })

  const bestCampaign = sortedCampaigns[0]
  const trustedCampaign = [...withMetrics].sort((a, b) => b.trustScore - a.trustScore)[0]
  const fastestGrowing = [...withMetrics].sort((a, b) => b.growthScore - a.growthScore)[0]

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 p-10">
        <p className="text-center text-lg text-gray-700">Loading comparison data...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50">
      {/* Hero */}
      <section className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            ⚖️ Campaign Comparison Tool
          </h1>
          <p className="text-xl text-emerald-100">
            Find the best place to make your donation by category
          </p>
        </div>
      </section>

      {/* Category Selection */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          Choose a Category
        </h2>

        <div className="flex flex-wrap gap-3 justify-center mb-12">
          <button
            onClick={() => setSelectedCategory("All")}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
              selectedCategory === "All"
                ? "bg-emerald-600 text-white shadow-lg scale-105"
                : "bg-white text-gray-700 border hover:bg-emerald-50"
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                selectedCategory === cat
                  ? "bg-emerald-600 text-white shadow-lg scale-105"
                  : "bg-white text-gray-700 border hover:bg-emerald-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 justify-center mb-12">
          {[{ key: "trust", label: "Highest Trust Score" }, { key: "growth", label: "Fastest Growth" }, { key: "funded", label: "Most Funded" }].map((item) => (
            <button
              key={item.key}
              onClick={() => setSortBy(item.key as "trust" | "growth" | "funded")}
              className={`px-5 py-2 rounded-lg font-semibold transition-colors ${sortBy === item.key ? "bg-emerald-600 text-white" : "bg-white text-gray-700 border border-gray-200 hover:border-emerald-600"}`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Comparison Results */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Best Campaign */}
          {bestCampaign && (
            <div className="bg-white rounded-xl shadow-xl p-8 border-2 border-yellow-400">
              <div className="text-center mb-4">
                <span className="inline-block bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full font-bold text-sm">
                  🏆 Best Campaign
                </span>
              </div>

              {bestCampaign.image && (
                <CampaignImage
                  src={bestCampaign.image}
                  alt={bestCampaign.title}
                  width={600}
                  height={400}
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}

              <h3 className="font-bold text-xl text-gray-900 mb-2 line-clamp-2">
                {bestCampaign.title}
              </h3>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-bold text-emerald-600">
                    {calculateProgress(bestCampaign.amount, bestCampaign.goal).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Platform</span>
                  <span className="font-semibold">{bestCampaign.platform}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Raised</span>
                  <span className="font-bold">{formatInrCurrency(bestCampaign.amount)}</span>
                </div>
              </div>

              <Link
                href={`/campaign/${bestCampaign.id}`}
                className="block w-full bg-emerald-600 text-white text-center py-3 rounded-lg font-bold hover:bg-emerald-700 transition-colors"
              >
                View Campaign →
              </Link>
            </div>
          )}

          {/* Highest Trust */}
          {trustedCampaign && (
            <div className="bg-white rounded-xl shadow-xl p-8 border-2 border-blue-400">
              <div className="text-center mb-4">
                <span className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-bold text-sm">
                  🛡️ Highest Trust Score
                </span>
              </div>

              {trustedCampaign.image && (
                <CampaignImage
                  src={trustedCampaign.image}
                  alt={trustedCampaign.title}
                  width={600}
                  height={400}
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}

              <h3 className="font-bold text-xl text-gray-900 mb-2 line-clamp-2">
                {trustedCampaign.title}
              </h3>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Trust Score</span>
                  <span className="font-bold text-blue-600">94/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Platform</span>
                  <span className="font-semibold">{trustedCampaign.platform}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Raised</span>
                  <span className="font-bold">{formatInrCurrency(trustedCampaign.amount)}</span>
                </div>
              </div>

              <Link
                href={`/campaign/${trustedCampaign.id}`}
                className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
              >
                View Campaign →
              </Link>
            </div>
          )}

          {/* Fastest Growing */}
          {fastestGrowing && (
            <div className="bg-white rounded-xl shadow-xl p-8 border-2 border-orange-400">
              <div className="text-center mb-4">
                <span className="inline-block bg-orange-100 text-orange-700 px-4 py-2 rounded-full font-bold text-sm">
                  🚀 Fastest Growing
                </span>
              </div>

              {fastestGrowing.image && (
                <CampaignImage
                  src={fastestGrowing.image}
                  alt={fastestGrowing.title}
                  width={600}
                  height={400}
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}

              <h3 className="font-bold text-xl text-gray-900 mb-2 line-clamp-2">
                {fastestGrowing.title}
              </h3>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Growth Rate</span>
                  <span className="font-bold text-orange-600">High</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Platform</span>
                  <span className="font-semibold">{fastestGrowing.platform}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Raised</span>
                  <span className="font-bold">{formatInrCurrency(fastestGrowing.amount)}</span>
                </div>
              </div>

              <Link
                href={`/campaign/${fastestGrowing.id}`}
                className="block w-full bg-orange-600 text-white text-center py-3 rounded-lg font-bold hover:bg-orange-700 transition-colors"
              >
                View Campaign →
              </Link>
            </div>
          )}
        </div>

        {/* All Campaigns in Category */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            All {selectedCategory === "All" ? "" : selectedCategory} Campaigns
          </h2>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-emerald-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left">Campaign</th>
                  <th className="px-6 py-4 text-left">Platform</th>
                  <th className="px-6 py-4 text-left">Progress</th>
                  <th className="px-6 py-4 text-left">Raised</th>
                  <th className="px-6 py-4 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {sortedCampaigns.slice(0, 10).map((campaign, idx) => (
                  <tr key={campaign.id} className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900 line-clamp-1">
                        {campaign.title}
                      </div>
                      <div className="text-sm text-gray-600">{campaign.category}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{campaign.platform}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-600"
                            style={{
                              width: `${Math.min(calculateProgress(campaign.amount, campaign.goal), 100)}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-700">
                          {calculateProgress(campaign.amount, campaign.goal).toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {formatInrCurrency(campaign.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/campaign/${campaign.id}`}
                        className="text-emerald-600 font-semibold hover:text-emerald-700"
                      >
                        View →
                      </Link>
                    </td>
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
