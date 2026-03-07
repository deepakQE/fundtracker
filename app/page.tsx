"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import Link from "next/link"
import NewsletterForm from "../components/NewsletterForm"
import CampaignSkeleton from "../components/CampaignSkeleton"
import CampaignImage from "@/components/CampaignImage"
import { calculateProgress, formatInrCurrency, formatCompactCurrency, toSafeNumber } from "@/lib/currency"
import { getPrimaryCampaigns } from "@/lib/campaignData"
import { supabase } from "@/lib/supabase"
import { appendReferralCode } from "@/lib/referral"
import { generatePlatformUrl } from "@/lib/platformUrls"
import { trackEvent } from "@/lib/analytics"
import HomeHero from "@/components/home/HomeHero"
import CategoryGrid from "@/components/home/CategoryGrid"
import TrustSection from "@/components/home/TrustSection"

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
  ngo_name?: string
}

type TopNgo = {
  name: string
  campaigns: number
  total: number
  trust: number
  country: string
}

export default function Home() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [now, setNow] = useState(() => Date.now())
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [sortOption] = useState("Trending")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [comparisonList, setComparisonList] = useState<Campaign[]>([])
  const [showComparisonModal, setShowComparisonModal] = useState(false)

  const campaignsPerPage = 6

  useEffect(() => {
    async function fetchCampaigns() {
      setLoading(true)

      try {
        const { campaigns: allCampaigns, source } = await getPrimaryCampaigns()
        if (source === "mock") {
          console.warn("Using mock campaigns fallback because Supabase returned empty data")
        }

        const currentTime = Date.now()

        const ranked: Campaign[] = allCampaigns.map((campaign) => {
          const progress = calculateProgress(campaign.amount, campaign.goal)
          const createdAt = new Date(campaign.created_at).getTime()
          const daysOld = Math.max(1, (currentTime - createdAt) / (1000 * 60 * 60 * 24))

          const donationProgress = Math.min(100, progress)
          const growthRate = Math.min(100, (toSafeNumber(campaign.amount) / daysOld) / 10000)
          const recencyScore = Math.max(0, 100 - daysOld * 2)
          const engagementScore = Math.min(
            100,
            Math.sqrt(Math.max(0, toSafeNumber(campaign.amount))) / 20 + (campaign.trust_score ?? 50) / 3
          )

          const trend_score =
            donationProgress * 0.4 +
            growthRate * 0.3 +
            recencyScore * 0.2 +
            engagementScore * 0.1

          return {
            ...campaign,
            trend_score,
          }
        })

        setCampaigns(ranked)
      } catch (err) {
        console.error("Fetch Campaigns Error:", err)
      }

      setLoading(false)
    }

    fetchCampaigns()

    try {
      const channel = supabase
        .channel("campaign-realtime")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "campaigns",
          },
          () => fetchCampaigns()
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    } catch (err) {
      console.error("Realtime subscription error:", err)
      return undefined
    }
  }, [])

  const resetPagination = useCallback(() => {
    setCurrentPage(1)
  }, [])

  const syncTime = useCallback(() => {
    setNow(Date.now())
  }, [])

  useEffect(() => {
    resetPagination()
  }, [selectedCategory, sortOption, resetPagination])

  useEffect(() => {
    syncTime()
  }, [syncTime])

  const categories = useMemo(() => {
    return ["All", ...Array.from(new Set(campaigns.map((c) => c.category)))]
  }, [campaigns])

  const urgentCampaigns = useMemo(() => {
    return [...campaigns]
      .filter((campaign) => {
        const daysActive = (now - new Date(campaign.created_at).getTime()) / (1000 * 60 * 60 * 24)
        const progress = calculateProgress(campaign.amount, campaign.goal)
        return daysActive >= 20 && progress >= 40 && progress < 100
      })
      .sort((a, b) => calculateProgress(b.amount, b.goal) - calculateProgress(a.amount, a.goal))
      .slice(0, 3)
  }, [campaigns, now])

  const topNgos = useMemo(() => {
    const ngoMap = new Map<string, TopNgo>()

    campaigns.forEach((campaign) => {
      const name = campaign.ngo_name || "Unknown NGO"
      const existing = ngoMap.get(name)
      const trust = campaign.trust_score ?? 75

      if (existing) {
        existing.campaigns += 1
        existing.total += toSafeNumber(campaign.amount)
        existing.trust = Math.round((existing.trust + trust) / 2)
      } else {
        ngoMap.set(name, {
          name,
          campaigns: 1,
          total: toSafeNumber(campaign.amount),
          trust,
          country: "Global",
        })
      }
    })

    return Array.from(ngoMap.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 6)
  }, [campaigns])

  const filteredCampaigns = useMemo(() => {
    let next =
      selectedCategory === "All"
        ? campaigns
        : campaigns.filter((c) => c.category === selectedCategory)

    next = next.filter((c) => {
      const needle = searchQuery.toLowerCase()
      return (
        c.title.toLowerCase().includes(needle) ||
        c.category.toLowerCase().includes(needle) ||
        (c.ngo_name || "").toLowerCase().includes(needle)
      )
    })

    if (sortOption === "Trending") {
      next = [...next].sort((a, b) => (b.trend_score ?? 0) - (a.trend_score ?? 0))
    }

    if (sortOption === "Highest Funded") {
      next = [...next].sort((a, b) => toSafeNumber(b.amount) - toSafeNumber(a.amount))
    }

    if (sortOption === "Lowest Funded") {
      next = [...next].sort((a, b) => toSafeNumber(a.amount) - toSafeNumber(b.amount))
    }

    if (sortOption === "Newest") {
      next = [...next].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    }

    return next
  }, [campaigns, selectedCategory, searchQuery, sortOption])

  const totalPages = Math.ceil(filteredCampaigns.length / campaignsPerPage)

  const paginatedCampaigns = filteredCampaigns.slice(
    (currentPage - 1) * campaignsPerPage,
    currentPage * campaignsPerPage
  )

  const blogCards = [
    {
      href: "/blog/best-charities-to-donate-to-2026",
      title: "Best Charities to Donate to in 2026",
      excerpt:
        "Discover trusted charities in healthcare, education, disaster relief, and poverty reduction with practical donation tips.",
    },
    {
      href: "/blog/how-to-donate-safely-online",
      title: "How to Donate Safely Online",
      excerpt:
        "Learn how to verify charities, avoid risky fundraising pages, and donate through transparent campaigns.",
    },
    {
      href: "/blog/top-ngos-helping-children-around-the-world",
      title: "Top NGOs Helping Children Around the World",
      excerpt:
        "Explore child-focused nonprofits and high-impact campaigns supporting education, healthcare, and nutrition.",
    },
  ]

  const toggleComparison = (campaign: Campaign) => {
    const isInList = comparisonList.some((c) => c.id === campaign.id)
    if (isInList) {
      setComparisonList(comparisonList.filter((c) => c.id !== campaign.id))
    } else if (comparisonList.length < 3) {
      setComparisonList([...comparisonList, campaign])
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50 to-gray-50 p-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <div className="mb-4 h-10 w-64 animate-pulse rounded bg-gray-300" />
            <div className="h-6 w-48 animate-pulse rounded bg-gray-200" />
          </div>
          <CampaignSkeleton />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-gray-50">
      <HomeHero />

      <CategoryGrid />

      <section className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">Trending Campaigns</h2>
            <p className="mt-2 text-gray-600">Compare live fundraising performance and support campaigns directly.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  selectedCategory === cat
                    ? "bg-emerald-600 text-white shadow"
                    : "bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div id="campaigns" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {paginatedCampaigns.map((campaign) => {
            const progress = calculateProgress(campaign.amount, campaign.goal)
            const daysActive = Math.floor((now - new Date(campaign.created_at).getTime()) / (1000 * 60 * 60 * 24))
            const daysRemaining = Math.max(0, 30 - daysActive)
            const isEndingSoon = daysRemaining <= 7 && daysRemaining > 0
            const isComparing = comparisonList.some((c) => c.id === campaign.id)
            const generatedUrl = generatePlatformUrl(campaign.platform, campaign.id, campaign.url)
            const supportUrl = appendReferralCode(generatedUrl || campaign.url)

            return (
              <div
                key={campaign.id}
                className={`group overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl ${
                  isComparing ? "border-emerald-500 ring-2 ring-emerald-300" : "border-gray-100"
                }`}
              >
                <div className="relative h-52 overflow-hidden bg-gradient-to-br from-emerald-100 to-teal-100">
                  <CampaignImage
                    src={campaign.image}
                    alt={campaign.title}
                    width={600}
                    height={400}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />

                  {isEndingSoon && (
                    <div className="absolute left-3 top-3 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white shadow">
                      Ending Soon
                    </div>
                  )}

                  <button
                    onClick={() => toggleComparison(campaign)}
                    className={`absolute right-3 top-3 rounded-lg px-2 py-1 text-xs font-semibold shadow ${
                      isComparing ? "bg-emerald-600 text-white" : "bg-white text-gray-700"
                    }`}
                  >
                    {isComparing ? "Comparing" : "Compare"}
                  </button>
                </div>

                <div className="p-5">
                  <h3 className="line-clamp-2 text-lg font-bold text-gray-900">{campaign.title}</h3>

                  {campaign.ngo_name && (
                    <Link
                      href={`/ngo/${encodeURIComponent(campaign.ngo_name)}`}
                      className="mt-2 inline-block text-sm font-semibold text-gray-700 hover:text-emerald-600"
                    >
                      {campaign.ngo_name}
                    </Link>
                  )}

                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-lg bg-emerald-100 px-2.5 py-1 font-semibold text-emerald-700">
                      {campaign.category}
                    </span>
                    <span className="rounded-lg bg-sky-100 px-2.5 py-1 font-semibold text-sky-700">
                      {campaign.platform}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-bold text-green-700">
                      Trust {campaign.trust_score || 75}
                    </span>
                    <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700">
                      Impact {Math.min(99, 55 + Math.floor(progress / 2))}
                    </span>
                  </div>

                  <div className="mt-4">
                    <div className="mb-2 h-3 w-full overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <p className="font-semibold text-gray-900">{formatCompactCurrency(campaign.amount)}</p>
                      <p className="font-semibold text-emerald-600">{Math.min(progress, 100).toFixed(0)}%</p>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-gray-600">
                      <p>Goal: {formatCompactCurrency(campaign.goal)}</p>
                      <p>{daysRemaining > 0 ? `${daysRemaining} days remaining` : "Goal period ended"}</p>
                    </div>
                  </div>

                  {supportUrl ? (
                    <a
                      href={supportUrl}
                      target="_blank"
                      rel="noopener noreferrer nofollow sponsored"
                      onClick={() =>
                        trackEvent("support_click", { location: "homepage_card", campaign_id: campaign.id })
                      }
                      className="mt-4 block w-full rounded-lg bg-emerald-600 px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-emerald-700"
                    >
                      Support Campaign
                    </a>
                  ) : (
                    <Link
                      href={`/campaign/${campaign.id}`}
                      onClick={() =>
                        trackEvent("campaign_click", { location: "homepage_card_fallback", campaign_id: campaign.id })
                      }
                      className="mt-4 block w-full rounded-lg bg-emerald-600 px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-emerald-700"
                    >
                      View Campaign
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {comparisonList.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setShowComparisonModal(true)}
            className="rounded-full bg-emerald-600 px-6 py-4 font-bold text-white shadow-2xl transition hover:bg-emerald-700"
          >
            Compare ({comparisonList.length})
          </button>
        </div>
      )}

      {showComparisonModal && comparisonList.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
          <div className="max-h-[90vh] w-full max-w-6xl overflow-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white p-6">
              <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">Campaign Comparison</h2>
              <button
                onClick={() => setShowComparisonModal(false)}
                className="text-3xl font-bold text-gray-500 hover:text-gray-700"
              >
                x
              </button>
            </div>

            <div className="grid gap-6 p-6 md:grid-cols-2 lg:grid-cols-3">
              {comparisonList.map((campaign) => {
                const progress = calculateProgress(campaign.amount, campaign.goal)
                const generatedUrl = generatePlatformUrl(campaign.platform, campaign.id, campaign.url)
                const supportUrl = appendReferralCode(generatedUrl || campaign.url)

                return (
                  <div key={campaign.id} className="rounded-xl border-2 border-emerald-200 bg-emerald-50/50 p-6">
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <h3 className="line-clamp-2 flex-1 text-lg font-bold text-gray-900">{campaign.title}</h3>
                      <button
                        onClick={() => toggleComparison(campaign)}
                        className="text-xl font-bold text-red-500 hover:text-red-700"
                      >
                        x
                      </button>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="rounded-lg bg-white p-3">
                        <span className="mb-1 block text-gray-600">NGO</span>
                        <p className="font-bold text-gray-900">{campaign.ngo_name || "Not specified"}</p>
                      </div>
                      <div className="rounded-lg bg-white p-3">
                        <span className="mb-1 block text-gray-600">Amount Raised</span>
                        <p className="text-lg font-bold text-emerald-600">{formatCompactCurrency(campaign.amount)}</p>
                      </div>
                      <div className="rounded-lg bg-white p-3">
                        <span className="mb-1 block text-gray-600">Goal</span>
                        <p className="font-bold text-gray-900">{formatCompactCurrency(campaign.goal)}</p>
                      </div>
                      <div className="rounded-lg bg-white p-3">
                        <span className="mb-1 block text-gray-600">Progress</span>
                        <div className="mt-1 h-2.5 w-full rounded-full bg-gray-200">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                        <p className="mt-2 font-bold text-emerald-600">{Math.min(progress, 100).toFixed(1)}%</p>
                      </div>
                    </div>

                    {supportUrl ? (
                      <a
                        href={supportUrl}
                        target="_blank"
                        rel="noopener noreferrer nofollow sponsored"
                        onClick={() =>
                          trackEvent("support_click", { location: "comparison_modal", campaign_id: campaign.id })
                        }
                        className="mt-4 block w-full rounded-lg bg-emerald-600 py-3 text-center font-bold text-white transition hover:bg-emerald-700"
                      >
                        Support Campaign
                      </a>
                    ) : (
                      <Link
                        href={`/campaign/${campaign.id}`}
                        onClick={() =>
                          trackEvent("campaign_click", {
                            location: "comparison_modal_fallback",
                            campaign_id: campaign.id,
                          })
                        }
                        className="mt-4 block w-full rounded-lg bg-emerald-600 py-3 text-center font-bold text-white transition hover:bg-emerald-700"
                      >
                        View Campaign
                      </Link>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 px-6 py-10">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`h-10 w-10 rounded-lg font-bold transition ${
                currentPage === page
                  ? "bg-emerald-600 text-white shadow"
                  : "border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      <section className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Ending Soon</h2>
              <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white">Urgent</span>
            </div>
            <div className="space-y-3">
              {urgentCampaigns.length === 0 && <p className="text-gray-600">No urgent campaigns right now.</p>}
              {urgentCampaigns.map((campaign) => (
                <Link
                  key={campaign.id}
                  href={`/campaign/${campaign.id}`}
                  className="block rounded-xl border border-red-100 bg-white p-4 transition hover:border-red-300"
                >
                  <p className="line-clamp-1 font-semibold text-gray-900">{campaign.title}</p>
                  <p className="mt-1 text-sm text-gray-600">
                    {formatInrCurrency(campaign.amount)} raised of {formatInrCurrency(campaign.goal)}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Top NGOs</h2>
              <Link href="/ngo-rankings" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">
                View rankings
              </Link>
            </div>
            <div className="space-y-3">
              {topNgos.map((ngo) => (
                <Link
                  key={ngo.name}
                  href={`/ngo/${encodeURIComponent(ngo.name)}`}
                  className="block rounded-xl border border-gray-100 p-4 transition hover:border-emerald-300"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-gray-900">{ngo.name}</p>
                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-bold text-green-700">
                      Trust {ngo.trust}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">Country: {ngo.country}</p>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <p className="text-gray-600">Campaigns: {ngo.campaigns}</p>
                    <p className="font-semibold text-emerald-700">{formatCompactCurrency(ngo.total)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <TrustSection />

      <section className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-16">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">From the Blog</h2>
          <p className="mt-2 text-gray-600">Practical insights for safer, smarter, and higher-impact giving.</p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {blogCards.map((post) => (
            <Link
              key={post.href}
              href={post.href}
              className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <h3 className="text-xl font-bold text-gray-900">{post.title}</h3>
              <p className="mt-3 text-sm text-gray-600">{post.excerpt}</p>
              <span className="mt-5 inline-block text-sm font-semibold text-emerald-600">Read more</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-gradient-to-br from-emerald-50 to-teal-50 px-4 py-16 md:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 p-8 shadow-xl md:p-12">
            <div className="mb-8 text-center text-white">
              <h2 className="text-3xl font-bold md:text-4xl">Stay Updated with High-Impact Campaigns</h2>
              <p className="mt-2 text-lg text-emerald-100">
                Weekly campaign trends, NGO spotlights, and trusted giving insights.
              </p>
            </div>

            <div className="mx-auto max-w-md">
              <NewsletterForm />
            </div>

            <p className="mt-4 text-center text-sm text-emerald-100">Updated daily. Unsubscribe anytime.</p>
          </div>
        </div>
      </section>
    </main>
  )
}
