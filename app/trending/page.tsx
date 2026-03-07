"use client"

import { useEffect, useState, useCallback } from "react"
import CampaignSkeleton from "../../components/CampaignSkeleton"
import { calculateProgress, formatInrCurrency, formatInrRange, toSafeNumber } from "@/lib/currency"
import { getPrimaryCampaigns } from "@/lib/campaignData"
import CampaignImage from "@/components/CampaignImage"
import { appendReferralCode } from "@/lib/referral"
import { trackEvent } from "@/lib/analytics"

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
  url?: string
  trust_score?: number
}

export default function TrendingPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [comparisonList, setComparisonList] = useState<Campaign[]>([])
  const [timeFilter, setTimeFilter] = useState("7d") // 7d, 30d, all

  const fetchCampaigns = useCallback(async () => {
    setLoading(true)

    try {
      const { campaigns: allCampaigns, source } = await getPrimaryCampaigns()
      if (source === "mock") {
        console.warn("Using mock campaigns fallback because Supabase returned empty data")
      }

      const now = Date.now()
      const ranked: Campaign[] = allCampaigns.map((campaign) => {
        const progress = calculateProgress(campaign.amount, campaign.goal)

        const createdAt = new Date(campaign.created_at).getTime()
        const daysOld = Math.max(1, (now - createdAt) / (1000 * 60 * 60 * 24))

        const fundingSpeedScore = Math.min(100, (progress / daysOld) * 10)
        const growthScore = Math.min(100, (toSafeNumber(campaign.amount) / daysOld) / 10000)
        const recencyScore = Math.max(0, 100 - daysOld * 2)
        const donorActivityScore = Math.min(100, toSafeNumber(campaign.amount) / 1000000)

        const trend_score =
          fundingSpeedScore * 0.4 +
          growthScore * 0.3 +
          recencyScore * 0.2 +
          donorActivityScore * 0.1

        return {
          ...campaign,
          trend_score,
        }
      })

      // Filter by time
      let filtered = ranked
      const daysAgo = timeFilter === "7d" ? 7 : timeFilter === "30d" ? 30 : 999999
      filtered = ranked.filter((c) => {
        const createdAt = new Date(c.created_at).getTime()
        const daysOld = (now - createdAt) / (1000 * 60 * 60 * 24)
        return daysOld <= daysAgo
      })

      setCampaigns(filtered.sort((a, b) => (b.trend_score ?? 0) - (a.trend_score ?? 0)))
    } catch (err) {
      console.error("Fetch Error:", err)
    } finally {
      setLoading(false)
    }
  }, [timeFilter])

  useEffect(() => {
    fetchCampaigns()
  }, [fetchCampaigns, timeFilter])

  const toggleComparison = (campaign: Campaign) => {
    const isInList = comparisonList.some(c => c.id === campaign.id)
    if (isInList) {
      setComparisonList(comparisonList.filter(c => c.id !== campaign.id))
    } else if (comparisonList.length < 3) {
      setComparisonList([...comparisonList, campaign])
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50 to-gray-50 p-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="h-12 bg-gray-300 rounded w-80 mb-4 animate-pulse" />
            <div className="h-6 bg-gray-200 rounded w-64 animate-pulse" />
          </div>
          <CampaignSkeleton />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50 to-gray-50">

      {/* HERO SECTION */}
      <section className="bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 text-white px-4 md:px-6 py-12 md:py-16">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-3 md:mb-4">
            🔥 Trending Campaigns
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-emerald-100">
            Discover campaigns gaining momentum and making an impact right now
          </p>
        </div>
      </section>

      {/* TIME FILTER */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="flex gap-3 justify-center flex-wrap">
          {[
            { value: "7d", label: "Last 7 Days" },
            { value: "30d", label: "Last 30 Days" },
            { value: "all", label: "All Time" },
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => setTimeFilter(filter.value)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                timeFilter === filter.value
                  ? "bg-emerald-600 text-white shadow-lg"
                  : "bg-white text-gray-700 border border-gray-200 hover:border-emerald-600"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </section>

      {/* CAMPAIGNS GRID */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 pb-20">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {campaigns.map((campaign) => {
            const progress = calculateProgress(campaign.amount, campaign.goal)
            const isComparing = comparisonList.some(c => c.id === campaign.id)
            const supportUrl = appendReferralCode(campaign.url)

            return (
              <div
                key={campaign.id}
                onClick={() => window.location.href = `/campaign/${campaign.id}`}
                className={`group bg-white rounded-xl border overflow-hidden hover:shadow-2xl hover:border-emerald-500 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer ${
                  isComparing ? 'ring-2 ring-emerald-500 shadow-xl' : 'shadow-md border-gray-100'
                }`}
              >
                {/* IMAGE */}
                <div className="relative overflow-hidden h-40 md:h-56 bg-gradient-to-br from-emerald-100 to-teal-100">
                  <CampaignImage
                    src={campaign.image}
                    alt={campaign.title}
                    width={600}
                    height={400}
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />

                  {/* TREND BADGE */}
                  <div className="absolute top-2 md:top-3 left-2 md:left-3 bg-red-500 text-white px-2 md:px-3 py-0.5 md:py-1 rounded-lg text-xs font-bold">
                    🔥 Trending
                  </div>

                  {/* COMPARISON CHECKBOX */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleComparison(campaign)
                    }}
                    className={`absolute top-2 md:top-3 right-2 md:right-3 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${
                      isComparing
                        ? 'bg-emerald-600 border-emerald-600'
                        : 'bg-white border-white hover:border-emerald-600'
                    }`}
                  >
                    {isComparing && <span className="text-white text-sm font-bold">✓</span>}
                  </button>

                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>

                {/* CONTENT */}
                <div className="p-4 md:p-6">
                  <h2 className="text-base md:text-lg font-bold text-gray-900 mb-2 md:mb-3 line-clamp-2">
                    {campaign.title}
                  </h2>

                  {/* TRUST & IMPACT BADGES */}
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                      ✅ Trust: {campaign.trust_score || 75}
                    </span>
                    <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">
                      ⭐ Impact: {Math.min(99, 55 + Math.floor(calculateProgress(campaign.amount, campaign.goal) / 2))}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className="px-2 md:px-3 py-0.5 md:py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold">
                      {campaign.category}
                    </span>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                      {campaign.platform}
                    </span>
                  </div>

                  {/* PROGRESS */}
                  <div>
                    <div className="w-full bg-gray-200 rounded-full h-2 md:h-3 mb-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-red-500 via-orange-500 to-emerald-500 h-full rounded-full transition-all"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-xs md:text-sm mb-2 md:mb-3">
                      <p className="font-bold text-gray-900">{formatInrCurrency(campaign.amount)}</p>
                      <p className="font-semibold text-emerald-600">{Math.min(progress, 100).toFixed(0)}%</p>
                    </div>
                  </div>

                  {/* FOOTER */}
                  <div className="pt-2 md:pt-3 border-t border-gray-100 mb-3">
                    <p className="text-xs text-gray-600">Goal: {formatInrCurrency(campaign.goal)}</p>
                  </div>

                  {supportUrl ? (
                    <a
                      href={supportUrl}
                      target="_blank"
                      rel="noopener noreferrer nofollow sponsored"
                      onClick={(e) => {
                        e.stopPropagation()
                        trackEvent("support_click", { location: "trending_card", campaign_id: campaign.id })
                      }}
                      className="w-full block text-center bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition-colors font-semibold"
                    >
                      Support Campaign
                    </a>
                  ) : (
                    <a
                      href={`/campaign/${campaign.id}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        trackEvent("campaign_click", { location: "trending_card_fallback", campaign_id: campaign.id })
                      }}
                      className="w-full block text-center bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition-colors font-semibold"
                    >
                      View Campaign
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* COMPARISON PANEL */}
      {comparisonList.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 md:px-6 sticky bottom-0 z-40">
          <div className="bg-white rounded-xl shadow-2xl border border-emerald-200 p-4 md:p-8">
            <div className="flex justify-between items-center mb-4 md:mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                Compare ({comparisonList.length}/3)
              </h2>
              <button
                onClick={() => setComparisonList([])}
                className="text-gray-500 hover:text-gray-700 text-xl md:text-2xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
              {comparisonList.map((campaign) => {
                const progress = calculateProgress(campaign.amount, campaign.goal)
                return (
                  <div key={campaign.id} className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 md:p-6 rounded-lg border border-emerald-200">
                    <div className="flex justify-between items-start mb-3 md:mb-4">
                      <h3 className="font-bold text-gray-900 line-clamp-2 flex-1 text-sm md:text-base">
                        {campaign.title}
                      </h3>
                      <button
                        onClick={() => toggleComparison(campaign)}
                        className="text-red-500 hover:text-red-700 text-lg md:text-xl ml-2"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="space-y-2 md:space-y-3 text-xs md:text-sm">
                      <div>
                        <span className="text-gray-600">Platform:</span>
                        <p className="font-semibold">{campaign.platform}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Category:</span>
                        <p className="font-semibold">{campaign.category}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Fundraised:</span>
                        <p className="font-bold text-emerald-600">{formatInrRange(campaign.amount, campaign.goal)}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Progress:</span>
                        <p className="font-bold text-lg text-emerald-600">{Math.min(progress, 100).toFixed(1)}%</p>
                      </div>
                      {campaign.url && (
                        <a
                          href={appendReferralCode(campaign.url)}
                          target="_blank"
                          rel="noopener noreferrer nofollow sponsored"
                          onClick={() => trackEvent("support_click", { location: "trending_compare", campaign_id: campaign.id })}
                          className="block w-full text-center mt-4 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition-colors font-semibold"
                        >
                          Visit Website →
                        </a>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

    </main>
  )
}
