import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { calculateProgress, formatInrCurrency, toSafeNumber } from "@/lib/currency"
import { getSupabaseServerClient } from "@/lib/supabaseServer"

type CampaignRow = {
  id: string
  title: string
  amount: number
  goal: number
  category: string
  created_at: string
  ngo_name?: string
  trend_score?: number
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ ngoName: string }>
}): Promise<Metadata> {
  const { ngoName } = await params
  const decodedName = decodeURIComponent(ngoName)

  return {
    title: `${decodedName} NGO Profile`,
    description: `Track ${decodedName} campaigns, trust score, and impact metrics on FundTracker.`,
    openGraph: {
      title: `${decodedName} NGO Profile`,
      description: `Active campaigns and impact metrics for ${decodedName}.`,
      type: "website",
    },
  }
}

export default async function NGOProfilePage({
  params,
}: {
  params: Promise<{ ngoName: string }>
}) {
  const { ngoName } = await params
  const decodedName = decodeURIComponent(ngoName)

  const supabaseServer = getSupabaseServerClient()
  const { data } = await supabaseServer
    .from("campaigns")
    .select("id,title,amount,goal,category,created_at,ngo_name,trend_score")
    .eq("ngo_name", decodedName)
    .order("created_at", { ascending: false })

  const campaigns = (data || []) as CampaignRow[]

  if (campaigns.length === 0) {
    return notFound()
  }

  const totalAmountRaised = campaigns.reduce((sum, campaign) => sum + toSafeNumber(campaign.amount), 0)
  const trustScore = Math.min(
    98,
    55 + Math.floor(campaigns.reduce((sum, campaign) => sum + calculateProgress(campaign.amount, campaign.goal), 0) / campaigns.length / 2)
  )

  const totalPeopleHelped = Math.floor(totalAmountRaised / 2000)
  const activeCampaigns = campaigns.filter((campaign) => calculateProgress(campaign.amount, campaign.goal) < 100)

  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: decodedName,
    url: `https://fundtracker.me/ngo/${encodeURIComponent(decodedName)}`,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: trustScore,
      bestRating: 100,
      ratingCount: campaigns.length,
    },
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50 to-gray-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <section className="bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 text-white px-6 py-14">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">{decodedName}</h1>
          <p className="text-emerald-100 text-lg">NGO Profile, trust, impact and active campaigns</p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid md:grid-cols-4 gap-4 mb-10">
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-sm text-gray-600">Trust Score</p>
            <p className="text-3xl font-bold text-emerald-600">{trustScore}/100</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-sm text-gray-600">Total Campaigns</p>
            <p className="text-3xl font-bold text-gray-900">{campaigns.length}</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-sm text-gray-600">Total Amount Raised</p>
            <p className="text-3xl font-bold text-gray-900">{formatInrCurrency(totalAmountRaised)}</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-sm text-gray-600">Impact Estimate</p>
            <p className="text-3xl font-bold text-gray-900">{totalPeopleHelped.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-5">Active Campaigns</h2>
          <div className="space-y-3">
            {activeCampaigns.map((campaign) => {
              const progress = calculateProgress(campaign.amount, campaign.goal)
              return (
                <Link
                  key={campaign.id}
                  href={`/campaign/${campaign.id}`}
                  className="block rounded-lg border border-gray-100 p-4 hover:border-emerald-400 transition-colors"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-gray-900">{campaign.title}</p>
                      <p className="text-sm text-gray-700">{campaign.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-700">{formatInrCurrency(campaign.amount)}</p>
                      <p className="text-sm font-bold text-emerald-600">{Math.min(progress, 100).toFixed(0)}%</p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>
    </main>
  )
}
