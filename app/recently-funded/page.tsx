import type { Metadata } from "next"
import Link from "next/link"
import { calculateProgress, formatCompactCurrency, toSafeNumber } from "@/lib/currency"
import { getPrimaryCampaigns } from "@/lib/campaignData"
import CampaignImage from "@/components/CampaignImage"

export const revalidate = 21600

export const metadata: Metadata = {
  title: "Recently Funded Campaigns | FundTracker",
  description: "Discover campaigns that recently reached their funding goals and learn from successful fundraising stories.",
  alternates: {
    canonical: "/recently-funded",
  },
  openGraph: {
    title: "Recently Funded Campaigns | FundTracker",
    description: "Campaigns that recently hit their goals across trusted fundraising platforms.",
    url: "https://fundtracker.me/recently-funded",
    type: "website",
  },
}

export default async function RecentlyFundedPage() {
  const { campaigns } = await getPrimaryCampaigns()

  const recentlyFunded = campaigns
    .map((campaign) => ({
      ...campaign,
      progress: calculateProgress(campaign.amount, campaign.goal),
      createdTs: new Date(campaign.created_at).getTime(),
    }))
    .filter((campaign) => campaign.progress >= 100)
    .sort((a, b) => b.createdTs - a.createdTs)
    .slice(0, 50)

  const totalRaised = recentlyFunded.reduce((sum, campaign) => sum + toSafeNumber(campaign.amount), 0)

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50 to-gray-50">
      <section className="bg-gradient-to-br from-emerald-600 to-teal-600 text-white py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <span className="inline-block bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-bold mb-4">
            RECENT WINS
          </span>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Recently Funded Campaigns</h1>
          <p className="text-xl text-emerald-100 max-w-3xl mx-auto mb-8">
            These campaigns reached their goals recently. Use them as benchmarks for trust and momentum.
          </p>
          <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="bg-emerald-700 px-6 py-4 rounded-lg">
              <p className="text-3xl font-bold">{recentlyFunded.length}</p>
              <p className="text-sm text-emerald-200">Campaigns fully funded</p>
            </div>
            <div className="bg-emerald-700 px-6 py-4 rounded-lg">
              <p className="text-3xl font-bold">{formatCompactCurrency(totalRaised)}</p>
              <p className="text-sm text-emerald-200">Total raised</p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 md:px-6 py-16">
        {recentlyFunded.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl text-gray-600 mb-4">No recently funded campaigns yet.</p>
            <Link href="/" className="text-emerald-600 hover:text-emerald-700 font-semibold">
              Browse all campaigns
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {recentlyFunded.map((campaign) => (
              <Link
                key={campaign.id}
                href={`/campaign/${campaign.id}`}
                className="group bg-white rounded-xl border-2 border-emerald-200 overflow-hidden hover:shadow-2xl hover:border-emerald-400 transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-center py-2 font-bold text-sm">
                  Goal Reached
                </div>

                <div className="relative overflow-hidden h-48 bg-gradient-to-br from-emerald-100 to-teal-100">
                  <CampaignImage
                    src={campaign.image}
                    alt={campaign.title}
                    width={600}
                    height={400}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>

                <div className="p-6">
                  <h3 className="font-bold text-xl text-gray-900 mb-3 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                    {campaign.title}
                  </h3>

                  {campaign.ngo_name && (
                    <p className="text-sm text-gray-600 mb-3">
                      by <span className="font-semibold">{campaign.ngo_name}</span>
                    </p>
                  )}

                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold">
                      {campaign.category}
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold">
                      {campaign.platform}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-4 text-center">
                      <p className="text-xs text-emerald-700 font-semibold mb-1">Total Raised</p>
                      <p className="text-3xl font-bold text-emerald-600">{formatCompactCurrency(campaign.amount)}</p>
                    </div>
                    <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-100">
                      <span className="text-gray-600">Goal</span>
                      <span className="font-bold text-gray-900">{formatCompactCurrency(campaign.goal)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
