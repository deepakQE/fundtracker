"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { Campaign } from "@/types/campaign"
import { calculateProgress, formatInrCurrency, formatInrRange, toSafeNumber } from "@/lib/currency"
import { getPrimaryCampaigns } from "@/lib/campaignData"
import CampaignSkeleton from "@/components/CampaignSkeleton"
import CampaignImage from "@/components/CampaignImage"

const CATEGORIES = {
  healthcare: { label: "Healthcare", icon: "🏥", description: "Medical aid, health awareness, and treatment campaigns", keywords: ["health", "medical", "healthcare", "hospital", "disease", "doctor", "patient"] },
  education: { label: "Education", icon: "📚", description: "School programs, scholarships, and learning initiatives", keywords: ["education", "school", "university", "learning", "student", "scholarship"] },
  environment: { label: "Environment", icon: "🌍", description: "Climate action, conservation, and sustainability projects", keywords: ["environment", "climate", "wildlife", "conservation", "green", "sustainable"] },
  emergency: { label: "Emergency Relief", icon: "🆘", description: "Disaster relief and urgent humanitarian aid", keywords: ["emergency", "disaster", "relief", "crisis", "urgent", "rescue"] },
  water: { label: "Water & Sanitation", icon: "💧", description: "Clean water access and sanitation infrastructure", keywords: ["water", "sanitation", "clean water", "wells", "sewage"] },
  food: { label: "Food Security", icon: "🍚", description: "Nutrition programs and hunger relief", keywords: ["food", "nutrition", "hunger", "farming", "agriculture"] },
}

type Props = {
  categorySlug: string
}

export default function CategoryPageClient({ categorySlug }: Props) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [comparisonList, setComparisonList] = useState<Campaign[]>([])
  const [sortBy, setSortBy] = useState<"trending" | "funded" | "newest" | "progress">("trending")

  const categoryInfo = useMemo(() => {
    return CATEGORIES[categorySlug as keyof typeof CATEGORIES] || {
      label: categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1),
      icon: "🎯",
      description: "Campaigns in this category",
      keywords: [categorySlug],
    }
  }, [categorySlug])

  const fetchCampaignsByCategory = useCallback(async () => {
    setLoading(true)
    try {
      const { campaigns, source } = await getPrimaryCampaigns()
      if (source === "mock") {
        console.warn("Using mock campaigns fallback because Supabase returned empty data")
      }

      const keywords = categoryInfo.keywords || [categorySlug]
      const filtered = campaigns.filter((c: Campaign) => {
        const campaignText = (c.title + " " + c.category).toLowerCase()
        return keywords.some((keyword) => campaignText.includes(keyword.toLowerCase()))
      })

      if (sortBy === "trending") {
        filtered.sort((a, b) => (b.trend_score || 0) - (a.trend_score || 0))
      } else if (sortBy === "funded") {
        filtered.sort((a, b) => toSafeNumber(b.amount) - toSafeNumber(a.amount))
      } else if (sortBy === "newest") {
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      } else if (sortBy === "progress") {
        filtered.sort((a, b) => {
          const progressA = calculateProgress(a.amount, a.goal)
          const progressB = calculateProgress(b.amount, b.goal)
          return progressB - progressA
        })
      }

      setCampaigns(filtered)
    } catch (err) {
      console.error("Error fetching campaigns:", err)
    } finally {
      setLoading(false)
    }
  }, [categorySlug, sortBy, categoryInfo])

  useEffect(() => {
    fetchCampaignsByCategory()
  }, [fetchCampaignsByCategory])

  const toggleComparison = (campaign: Campaign) => {
    const isInList = comparisonList.some((c) => c.id === campaign.id)
    if (isInList) {
      setComparisonList(comparisonList.filter((c) => c.id !== campaign.id))
    } else if (comparisonList.length < 3) {
      setComparisonList([...comparisonList, campaign])
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50 to-gray-50">
      <section className="bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 text-white px-4 md:px-6 py-12 md:py-16">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            {categoryInfo.icon} {categoryInfo.label}
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-emerald-100">{categoryInfo.description}</p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="flex gap-2 flex-wrap justify-center">
          {[
            { value: "trending", label: "Trending" },
            { value: "funded", label: "Most Funded" },
            { value: "progress", label: "Most Progress" },
            { value: "newest", label: "Newest" },
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => setSortBy(filter.value as "trending" | "funded" | "newest" | "progress")}
              className={`px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold transition-all duration-300 text-sm md:text-base ${
                sortBy === filter.value
                  ? "bg-emerald-600 text-white shadow-lg"
                  : "bg-white text-gray-700 border border-gray-200 hover:border-emerald-600"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {loading ? (
          <CampaignSkeleton />
        ) : campaigns.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-2xl font-bold text-gray-600">No campaigns in this category</div>
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 mb-20">
              {campaigns.map((campaign) => {
                const progress = calculateProgress(campaign.amount, campaign.goal)
                const isComparing = comparisonList.some((c) => c.id === campaign.id)

                return (
                  <div
                    key={campaign.id}
                    onClick={() => (window.location.href = `/campaign/${campaign.id}`)}
                    className={`group bg-white rounded-xl border overflow-hidden hover:shadow-2xl hover:border-emerald-500 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer ${
                      isComparing ? "ring-2 ring-emerald-500 shadow-xl" : "shadow-md border-gray-100"
                    }`}
                  >
                    <div className="relative overflow-hidden h-40 md:h-56 bg-gradient-to-br from-emerald-100 to-teal-100">
                      <CampaignImage
                        src={campaign.image}
                        alt={campaign.title}
                        width={600}
                        height={400}
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />

                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleComparison(campaign)
                        }}
                        className={`absolute top-2 md:top-3 right-2 md:right-3 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${
                          isComparing
                            ? "bg-emerald-600 border-emerald-600"
                            : "bg-white border-white hover:border-emerald-600"
                        }`}
                      >
                        {isComparing && <span className="text-white text-sm font-bold">✓</span>}
                      </button>
                    </div>

                    <div className="p-4 md:p-6">
                      <h2 className="text-base md:text-lg font-bold text-gray-900 mb-2 md:mb-3 line-clamp-2">{campaign.title}</h2>

                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <span className="px-2 md:px-3 py-0.5 md:py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold">
                          {campaign.category}
                        </span>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">{campaign.platform}</span>
                      </div>

                      <div className="space-y-2 md:space-y-3">
                        <div>
                          <div className="w-full bg-gray-200 rounded-full h-2 md:h-2.5 mb-2 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                          <div className="flex justify-between items-center">
                            <p className="text-xs md:text-sm font-bold text-gray-900">{formatInrCurrency(campaign.amount)}</p>
                            <p className="text-xs font-semibold text-emerald-600">{Math.min(progress, 100).toFixed(0)}%</p>
                          </div>
                        </div>

                        <div className="pt-2 md:pt-3 border-t border-gray-100">
                          <p className="text-xs text-gray-600">Goal: {formatInrCurrency(campaign.goal)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {comparisonList.length > 0 && (
              <section className="max-w-7xl mx-auto px-4 md:px-6 sticky bottom-0 z-40">
                <div className="bg-white rounded-xl shadow-2xl border border-emerald-200 p-4 md:p-8">
                  <div className="flex justify-between items-center mb-4 md:mb-6">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">Compare ({comparisonList.length}/3)</h2>
                    <button onClick={() => setComparisonList([])} className="text-gray-500 hover:text-gray-700 text-xl md:text-2xl font-bold">
                      x
                    </button>
                  </div>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                    {comparisonList.map((campaign) => {
                      const progress = calculateProgress(campaign.amount, campaign.goal)
                      return (
                        <div key={campaign.id} className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 md:p-6 rounded-lg border border-emerald-200">
                          <div className="flex justify-between items-start mb-3 md:mb-4">
                            <h3 className="font-bold text-gray-900 line-clamp-2 flex-1 text-sm md:text-base">{campaign.title}</h3>
                            <button onClick={() => toggleComparison(campaign)} className="text-red-500 hover:text-red-700 text-lg md:text-xl ml-2">
                              x
                            </button>
                          </div>

                          <div className="space-y-2 md:space-y-3 text-xs md:text-sm">
                            <div>
                              <span className="text-gray-600">Platform:</span>
                              <p className="font-semibold">{campaign.platform}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Fundraised:</span>
                              <p className="font-bold text-emerald-600">{formatInrRange(campaign.amount, campaign.goal)}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Progress:</span>
                              <p className="font-bold text-lg text-emerald-600">{Math.min(progress, 100).toFixed(1)}%</p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </section>
            )}
          </>
        )}
      </section>
    </main>
  )
}
