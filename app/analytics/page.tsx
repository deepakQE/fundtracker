"use client"

import { useEffect, useState } from "react"
import { Campaign } from "@/types/campaign"
import { calculateProgress, formatInrCurrency, formatInrRange, toSafeNumber } from "@/lib/currency"
import { getMockWeeklyTrends } from "@/lib/mockAnalyticsData"
import { getPrimaryCampaigns } from "@/lib/campaignData"

type AnalyticsMetrics = {
  total_raised: number
  total_campaigns: number
  average_funding_rate: number
  top_category: string
  top_platform: string
  trending_campaign: Campaign | null
  platform_breakdown: Array<{
    name: string
    campaigns: number
    raised: number
    avg_rate: number
  }>
  category_breakdown: Array<{
    name: string
    campaigns: number
    raised: number
  }>
  weekly_data: Array<{
    week: string
    amount: number
    campaigns: number
  }>
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  async function fetchAnalytics() {
    try {
      const { campaigns: allCampaigns, source } = await getPrimaryCampaigns()
      if (source === "mock") {
        console.warn("Using mock campaigns fallback because Supabase returned empty data")
      }

      // Calculate metrics
      const totalRaised = allCampaigns.reduce((sum, c) => sum + toSafeNumber(c.amount), 0)
      const totalCampaigns = allCampaigns.length

      const averageFundingRate = totalCampaigns > 0
        ? (allCampaigns.reduce((sum, c) => sum + calculateProgress(c.amount, c.goal), 0) / totalCampaigns)
        : 0

      // Category breakdown
      const categoryMap = new Map()
      allCampaigns.forEach(c => {
        if (!categoryMap.has(c.category)) {
          categoryMap.set(c.category, { campaigns: 0, raised: 0 })
        }
        const data = categoryMap.get(c.category)
        data.campaigns += 1
        data.raised += toSafeNumber(c.amount)
      })

      const categoryBreakdown = Array.from(categoryMap.entries())
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.raised - a.raised)

      const topCategory = categoryBreakdown[0]?.name || "Healthcare"

      // Platform breakdown
      const platformMap = new Map()
      allCampaigns.forEach(c => {
        if (!platformMap.has(c.platform)) {
          platformMap.set(c.platform, { campaigns: 0, raised: 0, count: 0 })
        }
        const data = platformMap.get(c.platform)
        data.campaigns += 1
        data.raised += toSafeNumber(c.amount)
        data.count += calculateProgress(c.amount, c.goal)
      })

      const platformBreakdown = Array.from(platformMap.entries())
        .map(([name, data]) => ({
          name,
          campaigns: data.campaigns,
          raised: data.raised,
          avg_rate: data.count / data.campaigns,
        }))
        .sort((a, b) => b.raised - a.raised)

      const topPlatform = platformBreakdown[0]?.name || "GlobalGiving"

      // Find trending campaign (highest trend score)
      const trendingCampaign = allCampaigns.reduce((best, current) => {
        const currentScore = current.trend_score || 0
        const bestScore = best.trend_score || 0
        return currentScore > bestScore ? current : best
      }, allCampaigns[0] || null)

      setAnalytics({
        total_raised: totalRaised,
        total_campaigns: totalCampaigns,
        average_funding_rate: averageFundingRate,
        top_category: topCategory,
        top_platform: topPlatform,
        trending_campaign: trendingCampaign,
        platform_breakdown: platformBreakdown,
        category_breakdown: categoryBreakdown,
        weekly_data: getMockWeeklyTrends(totalRaised, totalCampaigns).map((item) => ({
          week: item.week,
          amount: item.amount_raised,
          campaigns: item.campaigns_launched,
        })),
      })
      setLoading(false)
    } catch (err) {
      console.error("Error fetching analytics:", err)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50 to-gray-50 flex items-center justify-center">
        <div className="text-2xl font-bold text-emerald-600">Loading analytics...</div>
      </main>
    )
  }

  if (!analytics) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50 to-gray-50 flex items-center justify-center">
        <div className="text-2xl font-bold text-gray-600">No data available</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50 to-gray-50">
      {/* HERO */}
      <section className="bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 text-white px-4 md:px-6 py-12 md:py-16">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-3 md:mb-4">
            📊 Donation Analytics
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-emerald-100">
            Real-time insights into global fundraising trends and campaign performance
          </p>
        </div>
      </section>

      {/* KEY METRICS */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Total Raised */}
          <div className="bg-white rounded-xl shadow-md border border-emerald-100 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 font-semibold">Total Fundraised</h3>
              <span className="text-2xl">💰</span>
            </div>
            <p className="text-3xl font-bold text-emerald-600">
              {formatInrCurrency(analytics.total_raised)}
            </p>
            <p className="text-xs text-gray-500 mt-2">Across all platforms</p>
          </div>

          {/* Total Campaigns */}
          <div className="bg-white rounded-xl shadow-md border border-blue-100 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 font-semibold">Active Campaigns</h3>
              <span className="text-2xl">🎯</span>
            </div>
            <p className="text-3xl font-bold text-blue-600">
              {analytics.total_campaigns.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-2">Making an impact</p>
          </div>

          {/* Avg Funding Rate */}
          <div className="bg-white rounded-xl shadow-md border border-purple-100 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 font-semibold">Avg Funding Rate</h3>
              <span className="text-2xl">📈</span>
            </div>
            <p className="text-3xl font-bold text-purple-600">
              {analytics.average_funding_rate.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500 mt-2">Goal achievement</p>
          </div>

          {/* Top Category */}
          <div className="bg-white rounded-xl shadow-md border border-orange-100 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 font-semibold">Top Category</h3>
              <span className="text-2xl">⭐</span>
            </div>
            <p className="text-3xl font-bold text-orange-600">
              {analytics.top_category}
            </p>
            <p className="text-xs text-gray-500 mt-2">Most popular</p>
          </div>
        </div>
      </section>

      {/* PLATFORM BREAKDOWN */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900">Platform Performance</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm md:text-base">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-bold text-gray-700">Platform</th>
                  <th className="text-right py-3 px-4 font-bold text-gray-700">Campaigns</th>
                  <th className="text-right py-3 px-4 font-bold text-gray-700">Raised</th>
                  <th className="text-right py-3 px-4 font-bold text-gray-700">Avg Funding</th>
                </tr>
              </thead>
              <tbody>
                {analytics.platform_breakdown.map((platform, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-gray-900">{platform.name}</td>
                    <td className="py-3 px-4 text-right text-gray-700">{platform.campaigns}</td>
                    <td className="py-3 px-4 text-right text-emerald-600 font-bold">
                      {formatInrCurrency(platform.raised)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold">
                        {platform.avg_rate.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CATEGORY BREAKDOWN */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900">Top Categories</h2>
          <div className="space-y-4">
            {analytics.category_breakdown.slice(0, 5).map((category, idx) => {
              const percentage = (category.raised / analytics.total_raised) * 100
              return (
                <div key={idx}>
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <p className="font-bold text-gray-900">{category.name}</p>
                      <p className="text-xs text-gray-500">{category.campaigns} campaigns</p>
                    </div>
                    <p className="font-bold text-emerald-600">{formatInrCurrency(category.raised)}</p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 h-3 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* TRENDING CAMPAIGN */}
      {analytics.trending_campaign && (
        <section className="max-w-7xl mx-auto px-4 md:px-6 py-12">
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl shadow-lg border border-emerald-200 p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900">🔥 Hottest Campaign Right Now</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {analytics.trending_campaign.image && (
                <div className="md:col-span-1">
                  <img
                    src={analytics.trending_campaign.image}
                    alt={analytics.trending_campaign.title}
                    className="w-full h-48 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.src = `https://via.placeholder.com/400x300/009767/ffffff?text=${encodeURIComponent(analytics.trending_campaign?.category || 'Campaign')}`
                    }}
                  />
                </div>
              )}
              <div className={analytics.trending_campaign.image ? "md:col-span-2" : "md:col-span-3"}>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                  {analytics.trending_campaign.title}
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Platform:</span>
                    <span className="font-semibold text-emerald-600">{analytics.trending_campaign.platform}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-semibold">{analytics.trending_campaign.category}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Fundraised:</span>
                    <span className="font-bold text-emerald-600">
                      {formatInrRange(analytics.trending_campaign.amount, analytics.trending_campaign.goal)}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-2">Progress</p>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-red-500 via-orange-500 to-emerald-500 h-3 rounded-full"
                        style={{
                          width: `${Math.min(calculateProgress(analytics.trending_campaign.amount, analytics.trending_campaign.goal), 100)}%`,
                        }}
                      />
                    </div>
                    <p className="text-sm text-emerald-600 font-bold mt-2">
                      {calculateProgress(analytics.trending_campaign.amount, analytics.trending_campaign.goal).toFixed(1)}
                      %
                    </p>
                  </div>
                  <a
                    href={`/campaign/${analytics.trending_campaign.id}`}
                    className="inline-block mt-4 bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
                  >
                    View Details →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
