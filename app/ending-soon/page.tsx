import type { Metadata } from "next"
import Link from "next/link"
import { calculateProgress, formatCompactCurrency, toSafeNumber } from "@/lib/currency"
import { getPrimaryCampaigns } from "@/lib/campaignData"
import CampaignImage from "@/components/CampaignImage"

export const metadata: Metadata = {
  title: "Ending Soon - Campaigns Needing Urgent Support | FundTracker",
  description: "Support campaigns that are ending soon. Help them reach their goals before time runs out. Browse urgent fundraising campaigns.",
  alternates: {
    canonical: "/ending-soon",
  },
  openGraph: {
    title: "Ending Soon - Campaigns Needing Urgent Support | FundTracker",
    description: "Support campaigns that are ending soon before time runs out.",
    url: "https://fundtracker.me/ending-soon",
    type: "website",
  },
}

export default async function EndingSoonPage() {
  const { campaigns } = await getPrimaryCampaigns()
  
  const now = Date.now()
  const endingSoonCampaigns = campaigns
    .map(campaign => {
      const daysActive = Math.floor((now - new Date(campaign.created_at).getTime()) / (1000 * 60 * 60 * 24))
      const daysRemaining = Math.max(0, 30 - daysActive)
      const progress = calculateProgress(campaign.amount, campaign.goal)
      
      return {
        ...campaign,
        daysActive,
        daysRemaining,
        progress,
        urgencyScore: progress < 100 && daysRemaining <= 10 ? (100 - progress) * (10 - daysRemaining + 1) : 0
      }
    })
    .filter(c => c.daysRemaining > 0 && c.daysRemaining <= 10 && c.progress < 100)
    .sort((a, b) => b.urgencyScore - a.urgencyScore)
    .slice(0, 50)

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-gray-50">
      
      {/* Hero */}
      <section className="bg-gradient-to-br from-orange-600 to-red-600 text-white py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <span className="inline-block bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-bold mb-4">
            ⏰ URGENT
          </span>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Campaigns Ending Soon
          </h1>
          <p className="text-xl text-orange-100 max-w-3xl mx-auto">
            These campaigns need your support now. Help them reach their goals before time runs out.
          </p>
          <div className="mt-8 bg-orange-800 inline-block px-6 py-3 rounded-lg">
            <p className="text-3xl font-bold">{endingSoonCampaigns.length}</p>
            <p className="text-sm text-orange-200">Campaigns need urgent support</p>
          </div>
        </div>
      </section>

      {/* Campaigns Grid */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-16">
        {endingSoonCampaigns.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl text-gray-600 mb-4">✅ No campaigns urgently ending soon</p>
            <Link href="/" className="text-emerald-600 hover:text-emerald-700 font-semibold">
              Browse all campaigns {"->"}
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {endingSoonCampaigns.map((campaign) => (
              <Link
                key={campaign.id}
                href={`/campaign/${campaign.id}`}
                className="group bg-white rounded-xl border-2 border-orange-200 overflow-hidden hover:shadow-2xl hover:border-orange-400 transition-all duration-300 transform hover:-translate-y-2"
              >
                {/* Urgency Badge */}
                <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white text-center py-2 font-bold text-sm">
                  ⏰ {campaign.daysRemaining} {campaign.daysRemaining === 1 ? 'day' : 'days'} left
                </div>

                {/* Image */}
                <div className="relative overflow-hidden h-48 bg-gradient-to-br from-orange-100 to-red-100">
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
                  <h3 className="font-bold text-xl text-gray-900 mb-3 line-clamp-2 group-hover:text-orange-600 transition-colors">
                    {campaign.title}
                  </h3>

                  {campaign.ngo_name && (
                    <p className="text-sm text-gray-600 mb-3">
                      by <span className="font-semibold">{campaign.ngo_name}</span>
                    </p>
                  )}

                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-lg text-xs font-semibold">
                      {campaign.category}
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold">
                      {campaign.platform}
                    </span>
                  </div>

                  {/* Progress */}
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700">Progress</span>
                        <span className="text-sm font-bold text-orange-600">{Math.min(campaign.progress, 100).toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(campaign.progress, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                      <div>
                        <span className="text-xs text-gray-600">Raised</span>
                        <p className="text-lg font-bold text-gray-900">{formatCompactCurrency(campaign.amount)}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-gray-600">Goal</span>
                        <p className="text-lg font-bold text-gray-900">{formatCompactCurrency(campaign.goal)}</p>
                      </div>
                    </div>

                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
                      <p className="text-xs text-orange-700 font-semibold">
                        Needs {formatCompactCurrency(toSafeNumber(campaign.goal) - toSafeNumber(campaign.amount))} more
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-orange-50 to-red-50 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Every Donation Counts
          </h2>
          <p className="text-lg text-gray-700 mb-8">
            Your support can help these campaigns reach their goals before time runs out. Even small contributions make a big difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="bg-emerald-600 text-white px-8 py-4 rounded-lg font-bold hover:bg-emerald-700 transition-colors"
            >
              Browse All Campaigns
            </Link>
            <Link
              href="/trending"
              className="border-2 border-emerald-600 text-emerald-600 px-8 py-4 rounded-lg font-bold hover:bg-emerald-50 transition-colors"
            >
              View Trending
            </Link>
          </div>
        </div>
      </section>

    </main>
  )
}
