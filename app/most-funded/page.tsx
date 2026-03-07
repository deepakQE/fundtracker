import type { Metadata } from "next"
import Link from "next/link"
import { calculateProgress, formatCompactCurrency, toSafeNumber } from "@/lib/currency"
import { getPrimaryCampaigns } from "@/lib/campaignData"
import CampaignImage from "@/components/CampaignImage"

export const metadata: Metadata = {
  title: "Most Funded Campaigns - Highest Fundraising Success | FundTracker",
  description: "Discover the most successful fundraising campaigns. See which causes have raised the most donations and learn from their success.",
  alternates: {
    canonical: "/most-funded",
  },
  openGraph: {
    title: "Most Funded Campaigns - Highest Fundraising Success | FundTracker",
    description: "Discover high-performing campaigns with the largest donation totals.",
    url: "https://fundtracker.me/most-funded",
    type: "website",
  },
}

export default async function MostFundedPage() {
  const { campaigns } = await getPrimaryCampaigns()
  
  const mostFundedCampaigns = campaigns
    .filter(c => toSafeNumber(c.amount) > 0)
    .sort((a, b) => toSafeNumber(b.amount) - toSafeNumber(a.amount))
    .slice(0, 50)

  const totalRaised = mostFundedCampaigns.reduce((sum, c) => sum + toSafeNumber(c.amount), 0)

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50 to-gray-50">
      
      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-600 to-teal-600 text-white py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <span className="inline-block bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-bold mb-4">
            💰 TOP PERFORMERS
          </span>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Most Funded Campaigns
          </h1>
          <p className="text-xl text-emerald-100 max-w-3xl mx-auto mb-8">
            Discover the campaigns that have raised the most funds. Learn from their success and support impactful causes.
          </p>
          <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="bg-emerald-700 px-6 py-4 rounded-lg">
              <p className="text-3xl font-bold">{formatCompactCurrency(totalRaised)}</p>
              <p className="text-sm text-emerald-200">Total raised by top campaigns</p>
            </div>
            <div className="bg-emerald-700 px-6 py-4 rounded-lg">
              <p className="text-3xl font-bold">{mostFundedCampaigns.length}</p>
              <p className="text-sm text-emerald-200">Successful campaigns</p>
            </div>
          </div>
        </div>
      </section>

      {/* Campaigns Grid */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {mostFundedCampaigns.map((campaign, idx) => {
            const progress = calculateProgress(campaign.amount, campaign.goal)
            const badges = [
              '🥇 #1 Highest Funded',
              '🥈 #2 Top Funded',
              '🥉 #3 Top Funded'
            ]

            return (
              <Link
                key={campaign.id}
                href={`/campaign/${campaign.id}`}
                className="group bg-white rounded-xl border-2 border-emerald-200 overflow-hidden hover:shadow-2xl hover:border-emerald-400 transition-all duration-300 transform hover:-translate-y-2"
              >
                {/* Rank Badge */}
                {idx < 3 && (
                  <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-center py-2 font-bold text-sm">
                    {badges[idx]}
                  </div>
                )}
                {idx >= 3 && (
                  <div className="bg-emerald-600 text-white text-center py-2 font-bold text-sm">
                    #{idx + 1} Most Funded
                  </div>
                )}

                {/* Image */}
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

                  {/* Progress */}
                  <div className="space-y-3">
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-4 text-center">
                      <p className="text-xs text-emerald-700 font-semibold mb-1">Total Raised</p>
                      <p className="text-3xl font-bold text-emerald-600">{formatCompactCurrency(campaign.amount)}</p>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700">Progress</span>
                        <span className="text-sm font-bold text-emerald-600">{Math.min(progress, 100).toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-emerald-500 to-teal-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                      <span className="text-xs text-gray-600">Goal</span>
                      <span className="text-lg font-bold text-gray-900">{formatCompactCurrency(campaign.goal)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Success Stories Section */}
      <section className="bg-gradient-to-br from-emerald-50 to-teal-50 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            What Makes Campaigns Successful?
          </h2>
          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <p className="text-4xl mb-3">📖</p>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Clear Story</h3>
              <p className="text-gray-700 text-sm">
                Successful campaigns tell compelling stories that connect donors emotionally to the cause.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <p className="text-4xl mb-3">📸</p>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Quality Images</h3>
              <p className="text-gray-700 text-sm">
                High-quality photos and videos help donors visualize the impact of their contribution.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <p className="text-4xl mb-3">🔄</p>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Regular Updates</h3>
              <p className="text-gray-700 text-sm">
                Frequent updates keep donors engaged and build trust through transparency.
              </p>
            </div>
          </div>
          <div className="mt-10">
            <Link
              href="/"
              className="bg-emerald-600 text-white px-8 py-4 rounded-lg font-bold hover:bg-emerald-700 transition-colors inline-block"
            >
              Start Your Campaign
            </Link>
          </div>
        </div>
      </section>

    </main>
  )
}
