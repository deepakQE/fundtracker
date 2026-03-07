"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import Link from "next/link"
import NewsletterForm from "../components/NewsletterForm"
import CampaignSkeleton from "../components/CampaignSkeleton"
import CampaignImage from "@/components/CampaignImage"
import { calculateProgress, formatInrCurrency, formatInrRange, formatCompactCurrency, toSafeNumber } from "@/lib/currency"
import { getPrimaryCampaigns } from "@/lib/campaignData"
import { supabase } from "@/lib/supabase"
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
  ngo_name?: string
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
  const highlightedRaisedAmount = formatCompactCurrency(1000000000)

  /* -------------------- */
  /* 🚀 Fetch Campaigns  */
  /* -------------------- */

  useEffect(() => {
    async function fetchCampaigns() {
      setLoading(true)

      try {
        const { campaigns: allCampaigns, source } = await getPrimaryCampaigns()
        if (source === "mock") {
          console.warn("Using mock campaigns fallback because Supabase returned empty data")
        }

        /* -------------------- */
        /* 2️⃣ Ranking Algorithm */
        /* -------------------- */

        const now = Date.now()

        const ranked: Campaign[] = allCampaigns.map((campaign) => {
          const progress = calculateProgress(campaign.amount, campaign.goal)

          const createdAt = new Date(campaign.created_at).getTime()
          const daysOld = Math.max(1, (now - createdAt) / (1000 * 60 * 60 * 24))

          // 40% donation progress
          const donationProgress = Math.min(100, progress)

          // 30% growth rate (amount raised per day)
          const growthRate = Math.min(100, (toSafeNumber(campaign.amount) / daysOld) / 10000)

          // 20% recency (newer campaigns score higher)
          const recencyScore = Math.max(0, 100 - daysOld * 2)

          // 10% engagement (engagement proxy using donations + trust)
          const engagementScore = Math.min(
            100,
            (Math.sqrt(Math.max(0, toSafeNumber(campaign.amount))) / 20) + (campaign.trust_score ?? 50) / 3
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

    /* -------------------- */
    /* Realtime updates */
    /* -------------------- */

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

  /* Reset pagination when filters change */

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    resetPagination()
  }, [selectedCategory, sortOption, searchQuery, resetPagination])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    syncTime()
  }, [syncTime])

  const urgentCampaigns = useMemo(() => {
    return [...campaigns]
      .filter((campaign) => {
        const daysActive = (now - new Date(campaign.created_at).getTime()) / (1000 * 60 * 60 * 24)
        const progress = calculateProgress(campaign.amount, campaign.goal)
        return daysActive >= 20 && progress >= 40 && progress < 100
      })
      .sort((a, b) => {
        const progressA = calculateProgress(a.amount, a.goal)
        const progressB = calculateProgress(b.amount, b.goal)
        return progressB - progressA
      })
      .slice(0, 3)
  }, [campaigns, now])

  const recentlyFundedCampaigns = useMemo(() => {
    return [...campaigns]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 3)
  }, [campaigns])

  const topNgos = useMemo(() => {
    const ngoMap = new Map<string, { name: string; campaigns: number; total: number }>()

    campaigns.forEach((campaign) => {
      const name = campaign.ngo_name || "Unknown NGO"
      const existing = ngoMap.get(name)
      if (existing) {
        existing.campaigns += 1
        existing.total += toSafeNumber(campaign.amount)
      } else {
        ngoMap.set(name, { name, campaigns: 1, total: toSafeNumber(campaign.amount) })
      }
    })

    return Array.from(ngoMap.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 4)
  }, [campaigns])

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
            <div className="h-10 bg-gray-300 rounded w-64 mb-4 animate-pulse" />
            <div className="h-6 bg-gray-200 rounded w-48 animate-pulse" />
          </div>
          <CampaignSkeleton />
        </div>
      </main>
    )
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
      (a, b) => toSafeNumber(b.amount) - toSafeNumber(a.amount)
    )
  }

  if (sortOption === "Lowest Funded") {
    filteredCampaigns = [...filteredCampaigns].sort(
      (a, b) => toSafeNumber(a.amount) - toSafeNumber(b.amount)
    )
  }

  if (sortOption === "Newest") {
    filteredCampaigns = [...filteredCampaigns].sort(
      (a, b) =>
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
    )
  }

  const totalPages = Math.ceil(filteredCampaigns.length / campaignsPerPage)

  const paginatedCampaigns = filteredCampaigns.slice(
    (currentPage - 1) * campaignsPerPage,
    currentPage * campaignsPerPage
  )

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50 to-gray-50">

      {/* HERO SECTION */}

      <section className="text-center py-20 md:py-40 px-4 md:px-6 bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-600 text-white relative overflow-hidden">
        
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="mb-8 inline-block">
            <span className="text-emerald-100 text-sm font-semibold tracking-wider uppercase">Discover & Compare Campaigns</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-8xl font-extrabold mb-6 md:mb-8 leading-tight drop-shadow-lg">
            Find the Best
            <br />
            <span className="text-emerald-200">Causes to Support</span>
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl max-w-3xl mx-auto mb-8 md:mb-12 text-emerald-50 font-light leading-relaxed">
            Compare fundraising campaigns side-by-side. Analyze funding progress, trust levels, and impact metrics. Make informed donations to causes that matter.
          </p>

          {/* PRIMARY CTA */}
          <div className="flex flex-col items-center gap-4 mb-8">
            <a
              href="#campaigns"
              aria-label="Browse all fundraising campaigns"
              className="bg-white text-emerald-600 px-12 py-5 rounded-lg font-bold text-xl hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-2xl"
            >
              Browse Campaigns
            </a>
            <p className="text-sm text-emerald-100 max-w-md">
              Compare funding progress, trust ratings, and impact side-by-side.
            </p>
          </div>

          {/* SECONDARY ACTIONS */}
          <div className="flex flex-col sm:flex-row justify-center gap-3 mb-12">
            <a
              href="/compare"
              aria-label="Compare multiple campaigns"
              className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold text-base hover:bg-white hover:text-emerald-600 transition-all duration-300"
            >
              Compare Campaigns
            </a>

            <a
              href="/analytics"
              aria-label="View fundraising analytics"
              className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold text-base hover:bg-white hover:text-emerald-600 transition-all duration-300"
            >
              View Analytics
            </a>
          </div>

          {/* STATS */}
          <div className="grid sm:grid-cols-4 gap-4 md:gap-6 mt-12 md:mt-16 pt-8 md:pt-16 border-t border-emerald-400">
            <div>
              <p className="text-3xl sm:text-4xl md:text-5xl font-bold mb-1 md:mb-2">10,000+</p>
              <p className="text-sm md:text-base text-emerald-100">Campaigns Tracked</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl md:text-5xl font-bold mb-1 md:mb-2">1,000+</p>
              <p className="text-sm md:text-base text-emerald-100">NGOs Analyzed</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl md:text-5xl font-bold mb-1 md:mb-2">{highlightedRaisedAmount}</p>
              <p className="text-sm md:text-base text-emerald-100">Donations Monitored</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl md:text-5xl font-bold mb-1 md:mb-2">50+</p>
              <p className="text-sm md:text-base text-emerald-100">Countries Covered</p>
            </div>
          </div>
        </div>

      </section>

      {/* TRUST SIGNALS SECTION */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-16 bg-white">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Trusted by donors worldwide
          </h2>
          <p className="text-gray-600 mb-6">
            Supporting transparent fundraising across verified platforms and NGOs
          </p>
          <Link href="/guides/how-fundtracker-calculates-trust-scores" className="text-emerald-600 hover:text-emerald-700 font-semibold underline">
            How FundTracker calculates trust and impact scores {"->"}
          </Link>
        </div>

        {/* Partner Logos */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 md:gap-8 items-center justify-items-center opacity-70">
          {[
            { name: "GlobalGiving", color: "text-blue-600" },
            { name: "UNICEF", color: "text-cyan-600" },
            { name: "Save the Children", color: "text-red-600" },
            { name: "Doctors Without Borders", color: "text-orange-600" },
            { name: "GiveWell", color: "text-emerald-600" },
            { name: "Charity Navigator", color: "text-purple-600" }
          ].map((partner) => (
            <div key={partner.name} className={`${partner.color} font-bold text-sm md:text-base text-center px-4`}>
              {partner.name}
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="bg-gradient-to-br from-gray-50 to-emerald-50 py-16 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">
            What donors are saying
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
              <p className="text-gray-700 text-lg mb-6 italic">
                "FundTracker helped us find the most transparent campaigns to support. The comparison tool is invaluable for making informed decisions."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold text-xl">
                  D
                </div>
                <div>
                  <p className="font-bold text-gray-900">Community Donor</p>
                  <p className="text-sm text-gray-600">Verified User</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
              <p className="text-gray-700 text-lg mb-6 italic">
                "Finally a platform that compares NGOs based on real impact. The trust scores and analytics give us confidence in our CSR investments."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                  C
                </div>
                <div>
                  <p className="font-bold text-gray-900">CSR Program Manager</p>
                  <p className="text-sm text-gray-600">Corporate Partner</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BEST CAMPAIGNS TODAY */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            🔥 Best Campaigns Today
          </h2>
          <p className="text-lg text-gray-600">
            Fastest-growing campaigns making real impact right now
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {[...campaigns]
            .sort((a, b) => (b.trend_score ?? 0) - (a.trend_score ?? 0))
            .slice(0, 3)
            .map((campaign, idx) => {
              const progress = calculateProgress(campaign.amount, campaign.goal)
              const badges = ['🥇 Fastest Growing', '🥈 Top Rated', '🥉 Most Trusted']
              
              return (
                <Link
                  key={campaign.id}
                  href={`/campaign/${campaign.id}`}
                  className="group bg-white rounded-xl shadow-lg border-2 border-emerald-200 overflow-hidden hover:shadow-2xl hover:border-emerald-400 transition-all duration-300 transform hover:-translate-y-2"
                >
                  {/* Badge */}
                  <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-center py-2 font-bold text-sm">
                    {badges[idx]}
                  </div>

                  {/* Image */}
                  <div className="relative overflow-hidden h-48 bg-gradient-to-br from-emerald-100 to-teal-100">
                    <CampaignImage
                      src={campaign.image}
                      alt={campaign.title}
                      width={600}
                      height={400}
                      sizes="(max-width: 768px) 100vw, 33vw"
                      priority={idx === 0}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>

                  <div className="p-6">
                    <h3 className="font-bold text-xl text-gray-900 mb-3 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                      {campaign.title}
                    </h3>

                    <div className="flex items-center gap-2 mb-4">
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold">
                        {campaign.category}
                      </span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold">
                        {campaign.platform}
                      </span>
                      {campaign.ngo_name && (
                        <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-lg text-xs font-semibold">
                          NGO: {campaign.ngo_name}
                        </span>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-semibold text-gray-700">Progress</span>
                          <span className="text-sm font-bold text-emerald-600">{Math.min(progress, 100).toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2.5 rounded-full"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                        <span className="text-xs text-gray-600">Raised</span>
                        <span className="text-lg font-bold text-gray-900">{formatInrCurrency(campaign.amount)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          <div className="bg-white rounded-xl shadow-lg border border-red-100 p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">⏳ Urgent Campaigns Ending Soon</h3>
            <div className="space-y-3">
              {urgentCampaigns.length === 0 && (
                <p className="text-gray-600">No urgent campaigns right now.</p>
              )}
              {urgentCampaigns.map((campaign) => (
                <Link key={campaign.id} href={`/campaign/${campaign.id}`} className="block rounded-lg border border-gray-100 p-3 hover:border-emerald-400 transition-colors">
                  <p className="font-semibold text-gray-900 line-clamp-1">{campaign.title}</p>
                  <p className="text-sm text-gray-700">{formatInrRange(campaign.amount, campaign.goal)}</p>
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-emerald-100 p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">🆕 Recently Funded Campaigns</h3>
            <div className="space-y-3">
              {recentlyFundedCampaigns.map((campaign) => (
                <Link key={campaign.id} href={`/campaign/${campaign.id}`} className="block rounded-lg border border-gray-100 p-3 hover:border-emerald-400 transition-colors">
                  <p className="font-semibold text-gray-900 line-clamp-1">{campaign.title}</p>
                  <p className="text-sm text-gray-700">Started {new Date(campaign.created_at).toLocaleDateString()}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="bg-white rounded-xl shadow-lg border border-emerald-100 p-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Top NGOs</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {topNgos.map((ngo) => (
              <Link
                key={ngo.name}
                href={`/ngo/${encodeURIComponent(ngo.name)}`}
                className="rounded-lg border border-gray-100 p-4 hover:border-emerald-400 transition-colors"
              >
                <p className="font-semibold text-gray-900">{ngo.name}</p>
                <p className="text-sm text-gray-700">Campaigns: {ngo.campaigns}</p>
                <p className="text-sm text-emerald-700 font-semibold">Tracked: {formatInrCurrency(ngo.total)}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SEARCH & FILTERS SECTION */}

      <section className="sticky top-0 z-30 bg-white shadow-md mb-8">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
          
          {/* SEARCH */}
          <div className="mb-6">
            <div className="relative max-w-3xl mx-auto">
              <label htmlFor="campaign-search" className="sr-only">Search campaigns</label>
              <input
                id="campaign-search"
                type="text"
                placeholder="🔍 Search by campaign name, category, or NGO..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search campaigns by name, category or NGO"
                className="w-full border-2 border-emerald-300 px-6 py-4 rounded-xl shadow-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 text-base md:text-lg font-medium text-gray-900 placeholder-gray-500"
              />
            </div>
            <p className="text-center text-gray-700 font-semibold mt-3">
              Found <span className="text-emerald-600 font-bold text-lg">{filteredCampaigns.length}</span> campaigns
            </p>
          </div>

          {/* QUICK FILTERS */}
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            <button
              onClick={() => {
                setSelectedCategory("All")
                setSearchQuery("")
              }}
              aria-label="Show most funded campaigns"
              className="px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all duration-300 bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
            >
              💰 Most Funded
            </button>
            <button
              onClick={() => setSelectedCategory("All")}
              aria-label="Show most trusted campaigns"
              className="px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all duration-300 bg-blue-100 text-blue-700 hover:bg-blue-200"
            >
              ✅ Most Trusted
            </button>
            <button
              onClick={() => setSearchQuery("")}
              aria-label="Show ending soon campaigns"
              className="px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all duration-300 bg-orange-100 text-orange-700 hover:bg-orange-200"
            >
              ⏰ Ending Soon
            </button>
            <button
              onClick={() => {
                setSelectedCategory("All")
                setSearchQuery("")
              }}
              aria-label="Show new campaigns"
              className="px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all duration-300 bg-purple-100 text-purple-700 hover:bg-purple-200"
            >
              🆕 New Campaigns
            </button>
          </div>

          {/* CATEGORY FILTERS */}
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                aria-label={`Filter by ${cat} category`}
                aria-pressed={selectedCategory === cat}
                className={`px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all duration-300 ${
                  selectedCategory === cat
                    ? "bg-emerald-600 text-white shadow-md scale-105"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORY CARDS */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 mb-12">
        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 text-center">Explore by Category</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {[
            { slug: "healthcare", label: "🏥 Healthcare", desc: "Medical & health campaigns" },
            { slug: "education", label: "📚 Education", desc: "Education & learning" },
            { slug: "environment", label: "🌍 Environment", desc: "Climate & sustainability" },
            { slug: "emergency", label: "🆘 Emergency", desc: "Disaster relief" },
            { slug: "water", label: "💧 Water", desc: "Clean water access" },
            { slug: "food", label: "🍚 Food Security", desc: "Hunger relief" },
          ].map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              aria-label={`View ${cat.label} campaigns`}
              className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg hover:border-emerald-500 transition-all duration-300 transform hover:-translate-y-1 group"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">{cat.label.split(' ')[0]}</div>
              <h4 className="text-lg font-bold text-gray-900 mb-1">{cat.label}</h4>
              <p className="text-sm text-gray-600">{cat.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section
        id="campaigns"
        className="max-w-7xl mx-auto px-4 md:px-6 py-8"
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {paginatedCampaigns.map((campaign) => {
            const progress = calculateProgress(campaign.amount, campaign.goal)
            const daysActive = Math.floor((now - new Date(campaign.created_at).getTime()) / (1000 * 60 * 60 * 24))
            const daysRemaining = Math.max(0, 30 - daysActive)
            const isEndingSoon = daysRemaining <= 7 && daysRemaining > 0
            const isComparing = comparisonList.some(c => c.id === campaign.id)
            const supportUrl = appendReferralCode(campaign.url)

            return (
              <div
                key={campaign.id}
                className={`group bg-white rounded-xl border overflow-hidden hover:shadow-2xl hover:border-emerald-500 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer ${
                  isComparing ? 'ring-2 ring-emerald-500 shadow-xl' : 'shadow-md border-gray-100'
                }`}
              >

                {/* IMAGE CONTAINER */}
                <div className="relative overflow-hidden h-40 md:h-56 bg-gradient-to-br from-emerald-100 to-teal-100">
                  <CampaignImage
                    src={campaign.image}
                    alt={campaign.title}
                    width={600}
                    height={400}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  
                  {/* URGENCY BADGE */}
                  {isEndingSoon && (
                    <div className="absolute top-3 left-3 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      ⏰ Ending Soon
                    </div>
                  )}

                  {/* COMPARISON CHECKBOX */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleComparison(campaign)
                    }}
                    aria-label={isComparing ? "Remove from comparison" : "Add to comparison"}
                    className={`absolute top-2 md:top-3 right-2 md:right-3 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${
                      isComparing
                        ? 'bg-emerald-600 border-emerald-600'
                        : 'bg-white border-white hover:border-emerald-600'
                    }`}
                  >
                    {isComparing && (
                      <span className="text-white text-sm font-bold">✓</span>
                    )}
                  </button>
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                <div className="p-4 md:p-6">

                  <div className="flex items-start justify-between gap-2 mb-2 md:mb-3">
                    <h2 className="text-base md:text-lg font-bold text-gray-900 group-hover:text-emerald-600 transition-colors leading-tight flex-1 line-clamp-2">
                      {campaign.title}
                    </h2>
                  </div>

                  {/* NGO NAME */}
                  {campaign.ngo_name && (
                    <Link
                      href={`/ngo/${encodeURIComponent(campaign.ngo_name)}`}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-block mb-3 text-sm font-semibold text-gray-700 hover:text-emerald-600"
                    >
                      {campaign.ngo_name}
                    </Link>
                  )}

                  {/* CATEGORY & PLATFORM */}
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className="inline-block px-2 md:px-3 py-0.5 md:py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold">
                      {campaign.category}
                    </span>
                    <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                      {campaign.platform}
                    </span>
                  </div>

                  {/* TRUST & IMPACT BADGES */}
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                      ✅ Trust: {campaign.trust_score || 75}
                    </span>
                    <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">
                      ⭐ Impact: {Math.min(99, 55 + Math.floor(calculateProgress(campaign.amount, campaign.goal) / 2))}
                    </span>
                  </div>

                  {/* PROGRESS BAR */}
                  <div className="space-y-2 md:space-y-3 mb-4">
                    <div>
                      <div className="w-full bg-gray-200 rounded-full h-3 md:h-3.5 mb-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-xs md:text-sm font-bold text-gray-900">
                          {formatCompactCurrency(campaign.amount)}
                        </p>
                        <p className="text-xs font-semibold text-emerald-600">
                          {Math.min(progress, 100).toFixed(0)}% funded
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-100 flex justify-between items-center">
                      <p className="text-xs text-gray-600">
                        Goal: {formatCompactCurrency(campaign.goal)}
                      </p>
                      {daysRemaining > 0 && (
                        <p className="text-xs text-gray-600 font-semibold">
                          {daysRemaining} days left
                        </p>
                      )}
                    </div>
                  </div>

                  {/* SUPPORT CTA */}
                  {supportUrl ? (
                    <a
                      href={supportUrl}
                      target="_blank"
                      rel="noopener noreferrer nofollow sponsored"
                      onClick={() => trackEvent("support_click", { location: "homepage_card", campaign_id: campaign.id })}
                      aria-label={`Support ${campaign.title}`}
                      className="w-full block text-center bg-emerald-600 text-white py-3 rounded-lg font-bold text-sm hover:bg-emerald-700 transition-colors duration-300 shadow-md hover:shadow-lg"
                    >
                      Support Campaign
                    </a>
                  ) : (
                    <Link
                      href={`/campaign/${campaign.id}`}
                      onClick={() => trackEvent("campaign_click", { location: "homepage_card_fallback", campaign_id: campaign.id })}
                      aria-label={`View ${campaign.title}`}
                      className="w-full block text-center bg-emerald-600 text-white py-3 rounded-lg font-bold text-sm hover:bg-emerald-700 transition-colors duration-300 shadow-md hover:shadow-lg"
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

      {/* COMPARISON MODAL */}
      {comparisonList.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setShowComparisonModal(true)}
            aria-label={`Compare ${comparisonList.length} selected campaigns`}
            className="bg-emerald-600 text-white px-6 py-4 rounded-full shadow-2xl hover:bg-emerald-700 transition-all duration-300 font-bold flex items-center gap-2"
          >
            <span>Compare ({comparisonList.length})</span>
            <span className="text-2xl">⚖️</span>
          </button>
        </div>
      )}

      {showComparisonModal && comparisonList.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Campaign Comparison
              </h2>
              <button
                onClick={() => setShowComparisonModal(false)}
                aria-label="Close comparison modal"
                className="text-gray-500 hover:text-gray-700 text-3xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {comparisonList.map((campaign) => {
                  const progress = calculateProgress(campaign.amount, campaign.goal)
                  return (
                    <div key={campaign.id} className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-xl border-2 border-emerald-200">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-bold text-lg text-gray-900 line-clamp-2 flex-1">
                          {campaign.title}
                        </h3>
                        <button
                          onClick={() => toggleComparison(campaign)}
                          aria-label={`Remove ${campaign.title} from comparison`}
                          className="text-red-500 hover:text-red-700 text-xl ml-2 font-bold"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="space-y-4 text-sm">
                        <div className="bg-white p-3 rounded-lg">
                          <span className="text-gray-600 font-medium block mb-1">Campaign</span>
                          <p className="font-bold text-gray-900">{campaign.title}</p>
                        </div>

                        <div className="bg-white p-3 rounded-lg">
                          <span className="text-gray-600 font-medium block mb-1">NGO</span>
                          <p className="font-bold text-gray-900">{campaign.ngo_name || "Not specified"}</p>
                        </div>

                        <div className="bg-white p-3 rounded-lg">
                          <span className="text-gray-600 font-medium block mb-1">Amount Raised</span>
                          <p className="font-bold text-emerald-600 text-lg">{formatCompactCurrency(campaign.amount)}</p>
                        </div>

                        <div className="bg-white p-3 rounded-lg">
                          <span className="text-gray-600 font-medium block mb-1">Goal</span>
                          <p className="font-bold text-gray-900">{formatCompactCurrency(campaign.goal)}</p>
                        </div>

                        <div className="bg-white p-3 rounded-lg">
                          <span className="text-gray-600 font-medium block mb-1">Progress</span>
                          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2 mb-2">
                            <div
                              className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                          <p className="font-bold text-emerald-600 text-lg">{Math.min(progress, 100).toFixed(1)}%</p>
                        </div>

                        <div className="bg-white p-3 rounded-lg">
                          <span className="text-gray-600 font-medium block mb-1">Trust Score</span>
                          <p className="font-bold text-green-600 text-lg">✅ {campaign.trust_score || 75}/100</p>
                        </div>

                        <div className="bg-white p-3 rounded-lg">
                          <span className="text-gray-600 font-medium block mb-1">Impact Score</span>
                          <p className="font-bold text-orange-600 text-lg">⭐ {Math.min(99, 55 + Math.floor(progress / 2))}/100</p>
                        </div>

                        <div className="bg-white p-3 rounded-lg">
                          <span className="text-gray-600 font-medium block mb-1">Platform</span>
                          <p className="font-semibold text-gray-900">{campaign.platform}</p>
                        </div>

                        {appendReferralCode(campaign.url) ? (
                          <a
                            href={appendReferralCode(campaign.url)}
                            target="_blank"
                            rel="noopener noreferrer nofollow sponsored"
                            onClick={() => trackEvent("support_click", { location: "comparison_modal", campaign_id: campaign.id })}
                            className="block w-full text-center mt-4 bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition-colors font-bold shadow-md"
                          >
                            Support Campaign
                          </a>
                        ) : (
                          <Link
                            href={`/campaign/${campaign.id}`}
                            onClick={() => trackEvent("campaign_click", { location: "comparison_modal_fallback", campaign_id: campaign.id })}
                            className="block w-full text-center mt-4 bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition-colors font-bold shadow-md"
                          >
                            View Campaign
                          </Link>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PAGINATION */}

      {totalPages > 1 && (
        <div className="max-w-7xl mx-auto px-6 py-12 flex justify-center items-center gap-3">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors font-semibold text-gray-700"
          >
            ← Previous
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-10 h-10 rounded-lg font-bold transition-all duration-300 ${
                currentPage === page
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors font-semibold text-gray-700"
          >
            Next →
          </button>
        </div>
      )}

      {/* NEWSLETTER SECTION */}

      <section className="bg-gradient-to-br from-emerald-50 to-teal-50 py-16 px-4 md:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl p-8 md:p-12 shadow-xl">
            <div className="text-center text-white mb-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">
                📬 Get Weekly Trending Campaigns in Your Inbox
              </h2>
              <p className="text-lg text-emerald-100">
                Stay updated with the latest campaigns, impact stories, and donation opportunities.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <NewsletterForm />
            </div>

            <p className="text-center text-emerald-100 text-sm mt-4">
              Updated daily • Unsubscribe anytime
            </p>
          </div>
        </div>
      </section>

      {/* BLOG PREVIEW SECTION */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Latest Insights & Guides
          </h2>
          <p className="text-lg text-gray-600">
            Learn about effective giving, charity evaluation, and impact measurement
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Link href="/blog/best-charities-to-donate-to-2026" className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
            <div className="h-48 bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
              <span className="text-6xl">💝</span>
            </div>
            <div className="p-6">
              <h3 className="font-bold text-xl text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors">
                Best Charities to Donate to in 2026
              </h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                Discover trusted charities in healthcare, education, disaster relief, and poverty reduction with practical donation tips.
              </p>
              <span className="text-emerald-600 font-semibold text-sm">
                Read more {"->"}
              </span>
            </div>
          </Link>

          <Link href="/blog/how-to-donate-safely-online" className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
            <div className="h-48 bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
              <span className="text-6xl">🔒</span>
            </div>
            <div className="p-6">
              <h3 className="font-bold text-xl text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors">
                How to Donate Safely Online
              </h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                Learn how to verify charities, avoid risky fundraising pages, and donate safely through transparent campaigns.
              </p>
              <span className="text-emerald-600 font-semibold text-sm">
                Read more {"->"}
              </span>
            </div>
          </Link>

          <Link href="/blog/top-ngos-helping-children-around-the-world" className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
            <div className="h-48 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
              <span className="text-6xl">👶</span>
            </div>
            <div className="p-6">
              <h3 className="font-bold text-xl text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors">
                Top NGOs Helping Children
              </h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                Explore leading child-focused NGOs and discover campaigns supporting education, healthcare, and nutrition for children.
              </p>
              <span className="text-emerald-600 font-semibold text-sm">
                Read more {"->"}
              </span>
            </div>
          </Link>
        </div>

        <div className="text-center mt-10">
          <Link href="/blog" className="inline-block bg-emerald-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-emerald-700 transition-colors">
            View All Articles
          </Link>
        </div>
      </section>

      {/* SEO CONTENT BLOCK */}
      <section className="bg-gradient-to-br from-gray-50 to-emerald-50 py-16 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-center">
            Why FundTracker Helps Donors Make Better Decisions
          </h2>
          
          <div className="bg-white rounded-xl shadow-lg p-8 md:p-10 space-y-6 text-gray-700 leading-relaxed">
            <p className="text-lg">
              FundTracker is the leading platform for comparing fundraising campaigns and NGO transparency across multiple platforms. Our advanced analytics engine tracks donation progress, trust ratings, and impact metrics from verified campaigns worldwide, helping donors make informed decisions about where their contributions will create the most meaningful change.
            </p>
            
            <p className="text-lg">
              Unlike traditional charity directories, FundTracker provides real-time campaign comparisons, trust scores based on verified data, and comprehensive analytics that reveal funding patterns, growth rates, and impact indicators. By analyzing thousands of campaigns across categories including healthcare, education, environmental sustainability, emergency relief, and poverty reduction, we empower donors to identify the most transparent and effective causes to support. Our platform ensures that every donation decision is backed by data, transparency, and verified impact metrics.
            </p>
          </div>
        </div>
      </section>

    </main>
  )
}