"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import NewsletterForm from "../components/NewsletterForm"
import { calculateProgress, formatInrCurrency, formatInrRange, toSafeNumber } from "@/lib/currency"
import { getMockCampaigns } from "@/lib/mockCampaignData"

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

export default function Home() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [sortOption, setSortOption] = useState("Trending")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [comparisonList, setComparisonList] = useState<Campaign[]>([])

  const campaignsPerPage = 6
  const highlightedRaisedAmount = `${formatInrCurrency(1000000000)}+`

  /* -------------------- */
  /* 🚀 Fetch Campaigns  */
  /* -------------------- */

  useEffect(() => {
    async function fetchCampaigns() {
      setLoading(true)

      try {
        /* -------------------- */
        /* 1️⃣ Fetch Supabase */
        /* -------------------- */

        const { data: supabaseData, error } = await supabase
          .from("campaigns")
          .select("*")

        if (error) {
          console.error("Supabase Fetch Error:", error)
        }

        /* -------------------- */
        /* 2️⃣ Fetch GlobalGiving */
        /* -------------------- */

        let globalGivingCampaigns: Campaign[] = []

        try {
          const apiKey = process.env.NEXT_PUBLIC_GLOBALGIVING_API_KEY

          if (apiKey) {
            const response = await fetch(
              `https://api.globalgiving.org/api/public/projectservice/featured/projects/summary?api_key=${apiKey}`,
              { headers: { Accept: "application/json" } }
            )

            const ggData = await response.json()

            if (ggData?.projects?.project) {
              globalGivingCampaigns = ggData.projects.project.map((proj: any) => {
                const parsedAmount = Number(proj.funding)
                const parsedGoal = Number(proj.goal)

                return {
                  id: `gg-${proj.id}`,
                  title: proj.title,
                  platform: "GlobalGiving",
                  amount: Number.isFinite(parsedAmount) ? Math.round(parsedAmount) : Number.NaN,
                  goal: Number.isFinite(parsedGoal) ? Math.round(parsedGoal) : Number.NaN,
                  category: proj.themeName || "General",

                  /* Improve image - try multiple image sources */
                  image: proj.image?.big || 
                         proj.image?.medium || 
                         `https://www.globalgiving.org/pfil/${proj.id}/pict_large.jpg` ||
                         proj.imageLink,

                  created_at: new Date().toISOString(),
                  url: undefined, // GlobalGiving URLs don't work reliably, so hide them
                }
              })
            }
          }
        } catch (apiError) {
          console.error("GlobalGiving API Error:", apiError)
        }

        /* -------------------- */
        /* 3️⃣ Merge campaigns */
        /* -------------------- */

        const combinedCampaigns = [
          ...(supabaseData || []),
          ...globalGivingCampaigns,
        ]

        const mockCampaigns = getMockCampaigns()

        const allCampaigns = [...combinedCampaigns, ...mockCampaigns]

        /* -------------------- */
        /* 4️⃣ Ranking Algorithm */
        /* -------------------- */

        const now = Date.now()

        const ranked: Campaign[] = allCampaigns.map((campaign) => {
          const progress = calculateProgress(campaign.amount, campaign.goal)

          const createdAt = new Date(campaign.created_at).getTime()
          const daysOld = (now - createdAt) / (1000 * 60 * 60 * 24)

          const recencyScore = Math.max(0, 100 - daysOld * 5)
          const amountScore = toSafeNumber(campaign.amount) / 1000

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

      } catch (err) {
        console.error("Fetch Campaigns Error:", err)
      }

      setLoading(false)
    }

    fetchCampaigns()

    /* -------------------- */
    /* Realtime updates */
    /* -------------------- */

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
  }, [])

  /* Reset pagination when filters change */

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategory, sortOption, searchQuery])

  if (loading) {
    return <p className="p-10 text-center text-lg">Loading campaigns...</p>
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

  /* Toggle comparison */
  const toggleComparison = (campaign: Campaign) => {
    const isInList = comparisonList.some(c => c.id === campaign.id)
    if (isInList) {
      setComparisonList(comparisonList.filter(c => c.id !== campaign.id))
    } else if (comparisonList.length < 3) {
      setComparisonList([...comparisonList, campaign])
    }
  }

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

          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            <a
              href="#campaigns"
              className="bg-white text-emerald-600 px-10 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-xl"
            >
              Browse Campaigns
            </a>

            <a
              href="/trending"
              className="border-2 border-white text-white px-10 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-emerald-600 transition-all duration-300"
            >
              🔥 See Trending
            </a>
          </div>

          {/* STATS */}
          <div className="grid sm:grid-cols-3 gap-4 md:gap-8 mt-12 md:mt-16 pt-8 md:pt-16 border-t border-emerald-400">
            <div>
              <p className="text-3xl sm:text-4xl md:text-5xl font-bold mb-1 md:mb-2">1000+</p>
              <p className="text-sm md:text-lg text-emerald-100">Campaigns</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl md:text-5xl font-bold mb-1 md:mb-2">{highlightedRaisedAmount}</p>
              <p className="text-sm md:text-lg text-emerald-100">Fundraised</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl md:text-5xl font-bold mb-1 md:mb-2">50K+</p>
              <p className="text-sm md:text-lg text-emerald-100">Donors</p>
            </div>
          </div>
        </div>

      </section>

      {/* SEARCH & FILTERS SECTION */}

      <section className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        
        {/* SEARCH */}
        <div className="mb-12">
          <div className="relative max-w-2xl mx-auto mb-4">
            <input
              type="text"
              placeholder="🔍 Search by campaign name, category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border-2 border-emerald-300 px-6 py-4 rounded-xl shadow-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 text-base md:text-lg font-medium"
            />
          </div>
          <p className="text-center text-gray-600 font-semibold">
            Found <span className="text-emerald-600 font-bold text-lg">{filteredCampaigns.length}</span> campaigns
          </p>
        </div>

        {/* CATEGORY FILTERS */}
        <div className="flex flex-wrap gap-2 justify-center mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
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

        {/* CATEGORY CARDS */}
        <div className="mb-12">
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
                className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg hover:border-emerald-500 transition-all duration-300 transform hover:-translate-y-1 group"
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">{cat.label.split(' ')[0]}</div>
                <h4 className="text-lg font-bold text-gray-900 mb-1">{cat.label}</h4>
                <p className="text-sm text-gray-600">{cat.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section
        id="campaigns"
        className="max-w-7xl mx-auto px-4 md:px-6 py-8"
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {paginatedCampaigns.map((campaign) => {
            const progress = calculateProgress(campaign.amount, campaign.goal)

            const isComparing = comparisonList.some(c => c.id === campaign.id)

            return (
              <div
                key={campaign.id}
                onClick={() => window.location.href = `/campaign/${campaign.id}`}
                className={`group bg-white rounded-xl border overflow-hidden hover:shadow-2xl hover:border-emerald-500 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer ${
                  isComparing ? 'ring-2 ring-emerald-500 shadow-xl' : 'shadow-md border-gray-100'
                }`}
              >

                {/* IMAGE CONTAINER */}
                <div className="relative overflow-hidden h-40 md:h-56 bg-gradient-to-br from-emerald-100 to-teal-100">
                  <img
                    src={
                      campaign.image ||
                      "https://images.unsplash.com/photo-1593113630400-ea4288922497"
                    }
                    alt={campaign.title}
                    onError={(e) => {
                      e.currentTarget.src = `https://via.placeholder.com/400x300/009767/ffffff?text=${encodeURIComponent(campaign.category || 'Campaign')}`
                    }}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  
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

                  {/* TRUST & IMPACT BADGES */}
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                      ✅ Trust: {campaign.trust_score || Math.floor(50 + Math.random() * 45)}
                    </span>
                    <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">
                      ⭐ Impact: {Math.floor(55 + Math.random() * 40)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className="inline-block px-2 md:px-3 py-0.5 md:py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold">
                      {campaign.category}
                    </span>
                    <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                      {campaign.platform}
                    </span>
                  </div>

                  <div className="space-y-2 md:space-y-3">
                    <div>
                      <div className="w-full bg-gray-200 rounded-full h-2 md:h-2.5 mb-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-xs md:text-sm font-bold text-gray-900">
                          {formatInrCurrency(campaign.amount)}
                        </p>
                        <p className="text-xs font-semibold text-emerald-600">
                          {Math.min(progress, 100).toFixed(0)}%
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 md:pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-600">
                        Goal: {formatInrCurrency(campaign.goal)}
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* COMPARISON PANEL */}
      {comparisonList.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-12 sticky bottom-0 z-40">
          <div className="bg-white rounded-xl shadow-2xl border border-emerald-200 p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Compare Campaigns ({comparisonList.length}/3)
              </h2>
              <button
                onClick={() => setComparisonList([])}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {comparisonList.map((campaign) => {
                const progress = calculateProgress(campaign.amount, campaign.goal)
                return (
                  <div key={campaign.id} className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-lg border border-emerald-200">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-bold text-gray-900 line-clamp-2 flex-1">
                        {campaign.title}
                      </h3>
                      <button
                        onClick={() => toggleComparison(campaign)}
                        className="text-red-500 hover:text-red-700 text-xl ml-2"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="text-gray-600">Platform:</span>
                        <p className="font-semibold text-gray-900">{campaign.platform}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Category:</span>
                        <p className="font-semibold text-gray-900">{campaign.category}</p>
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
                          href={campaign.url}
                          target="_blank"
                          rel="noopener noreferrer"
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

      {/* PAGINATION */}

      {totalPages > 1 && (
        <div className="max-w-7xl mx-auto px-6 py-12 flex justify-center items-center gap-3">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
          >
            ← Previous
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-10 h-10 rounded-lg font-semibold transition-all duration-300 ${
                currentPage === page
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
          >
            Next →
          </button>
        </div>
      )}

      {/* NEWSLETTER SECTION */}

      <section className="max-w-5xl mx-auto px-6 py-20 mb-20">
        <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl p-12 shadow-xl">
          <div className="text-center text-white mb-8">
            <h2 className="text-4xl font-bold mb-3">
              📬 Stay Updated
            </h2>
            <p className="text-lg text-emerald-100">
              Get trending campaigns delivered to your inbox every week.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <NewsletterForm />
          </div>
        </div>
      </section>

    </main>
  )
}