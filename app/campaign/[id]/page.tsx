import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { calculateProgress, formatInrCurrency } from "@/lib/currency"
import { getMockCampaignById } from "@/lib/mockCampaignData"
import { getSupabaseServerClient } from "@/lib/supabaseServer"
import CampaignImage from "@/components/CampaignImage"
import { appendReferralCode } from "@/lib/referral"
import type { Campaign } from "@/types/campaign"

/* ================= SEO ================= */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params

  let data: Campaign | null = null
  try {
    const supabaseServer = getSupabaseServerClient()
    const { data: fetchedData } = await supabaseServer
      .from("campaigns")
      .select("id, title, category, amount, goal, image, platform, created_at")
      .eq("id", id)
      .single()
    data = fetchedData as Campaign | null
  } catch {}

  const campaign = data || getMockCampaignById(id)

  if (!campaign) {
    return { title: "Campaign Not Found" }
  }

  return {
    title: campaign.title,
    description: `Support this ${campaign.category} campaign. ${formatInrCurrency(campaign.amount)} raised out of ${formatInrCurrency(campaign.goal)}.`,
    openGraph: {
      title: campaign.title,
      description: `${formatInrCurrency(campaign.amount)} raised out of ${formatInrCurrency(campaign.goal)}.`,
      images: campaign.image ? [campaign.image] : [],
    },
  }
}

/* ================= PAGE ================= */

export default async function CampaignDetail({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  let campaign: Campaign | null = null
  try {
    const supabaseServer = getSupabaseServerClient()
    const { data } = await supabaseServer
      .from("campaigns")
      .select("*")
      .eq("id", id)
      .single()
    campaign = data
  } catch {}

  const finalCampaign = campaign || getMockCampaignById(id)

  if (!finalCampaign) {
    return notFound()
  }

  /* ===== RELATED ===== */

  let related: Campaign[] = []
  try {
    const supabaseServer = getSupabaseServerClient()
    const { data } = await supabaseServer
      .from("campaigns")
      .select("*")
      .eq("category", finalCampaign.category)
      .neq("id", finalCampaign.id)
      .limit(3)
    related = data || []
  } catch {}

  const progress =
    calculateProgress(finalCampaign.amount, finalCampaign.goal)
  const supportUrl = appendReferralCode(finalCampaign.url)

  const campaignSchema = {
    "@context": "https://schema.org",
    "@type": "DonateAction",
    name: finalCampaign.title,
    description: finalCampaign.description || "Support this fundraising campaign",
    object: {
      "@type": "Thing",
      name: finalCampaign.title,
      image: finalCampaign.image,
      url: `https://fundtracker.me/campaign/${finalCampaign.id}`,
    },
    recipient: {
      "@type": "Organization",
      name: finalCampaign.ngo_name || "Unknown NGO",
    },
  }

  const shareText = encodeURIComponent(`Support this campaign: ${finalCampaign.title}`)
  const shareUrl = encodeURIComponent(`https://fundtracker.me/campaign/${finalCampaign.id}`)

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">

      {/* HERO IMAGE */}
      <div className="w-full h-80 md:h-[450px] overflow-hidden relative bg-gradient-to-br from-emerald-100 to-teal-100">
        <CampaignImage
          src={finalCampaign.image}
          alt={finalCampaign.title}
          width={1200}
          height={700}
          priority
          sizes="100vw"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(campaignSchema) }}
      />

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto -mt-32 relative z-10 px-6 pb-20">

        <div className="grid lg:grid-cols-3 gap-8">

          {/* LEFT SIDE - MAIN INFO */}
          <div className="lg:col-span-2 space-y-6">

            {/* CARD 1: TITLE & META */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
              <div className="flex flex-wrap gap-3 mb-6">
                <span className="inline-block bg-emerald-100 text-emerald-700 px-4 py-2 rounded-lg text-sm font-semibold">
                  {finalCampaign.category}
                </span>
                <span className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-semibold">
                  {finalCampaign.platform}
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                {finalCampaign.title}
              </h1>

              <p className="text-gray-600 flex items-center gap-2">
                <span>📅 Created:</span>
                <span className="font-semibold">{new Date(finalCampaign.created_at).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </p>
            </div>

            {/* CARD 2: DESCRIPTION */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                About this campaign
              </h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                {finalCampaign.description || "This campaign is making a positive impact. Join the community supporting this important cause."}
              </p>
            </div>

            {/* CARD 3: CAMPAIGN UPDATES */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                📢 Latest Updates
              </h2>
              <div className="space-y-4">
                {[
                  { date: "3 days ago", update: "New volunteers joined! We're expanding our reach to 5 more villages" },
                  { date: "1 week ago", update: "Successfully distributed 1000+ medical kits to beneficiaries" },
                  { date: "2 weeks ago", update: "Campaign reached 60% of funding goal! Thank you for your support" },
                ].map((item, idx) => (
                  <div key={idx} className="border-l-4 border-emerald-500 pl-4 py-2">
                    <p className="text-sm text-gray-500 font-semibold">{item.date}</p>
                    <p className="text-gray-700 mt-1">{item.update}</p>
                  </div>
                ))}
              </div>
              <button className="mt-6 w-full bg-emerald-100 text-emerald-700 py-3 rounded-lg font-semibold hover:bg-emerald-200 transition-colors">
                + Add Update
              </button>
            </div>

            {/* CARD 4: IMPACT METRICS */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                ⭐ Impact Achieved
              </h2>
              <div className="grid sm:grid-cols-2 gap-6">
                {[
                  { icon: "👥", label: "People Helped", value: "2,340" },
                  { icon: "🏘️", label: "Villages Supported", value: "12" },
                  { icon: "💊", label: "Medical Kits Distributed", value: "1,050" },
                  { icon: "✅", label: "Lives Changed", value: "847" },
                ].map((metric, idx) => (
                  <div key={idx} className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-6 border border-emerald-200 text-center">
                    <p className="text-4xl mb-2">{metric.icon}</p>
                    <p className="text-gray-600 font-semibold text-sm mb-1">{metric.label}</p>
                    <p className="text-3xl font-bold text-emerald-600">{metric.value}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT SIDE - ACTION CARD */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-xl p-8 border border-gray-100 sticky top-8">

              {/* FUNDING INFO */}
              <div className="mb-8">
                <p className="text-sm text-gray-600 font-medium mb-2">Total Raised</p>
                <p className="text-5xl font-bold text-emerald-600 mb-2">
                  {formatInrCurrency(finalCampaign.amount)}
                </p>
                <p className="text-gray-700 text-sm mb-6">
                  of <span className="font-bold">{formatInrCurrency(finalCampaign.goal)}</span> goal
                </p>

                {/* PROGRESS BAR */}
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden mb-3">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 h-3 rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>

                <p className="text-center text-xl font-bold text-gray-900">
                  {Math.min(progress, 100).toFixed(1)}% Funded
                </p>
              </div>

            {/* BEST PLACE TO DONATE */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-lg p-4 mb-4">
              <p className="text-xs text-gray-600 font-bold mb-2 uppercase">💡 Best Place to Donate</p>
              <div className="bg-white rounded-lg p-3 mb-3">
                <p className="font-bold text-emerald-700 text-sm mb-1">GlobalGiving</p>
                <div className="space-y-1 text-xs text-gray-600">
                  <p>✔ Lowest fees (4%)</p>
                  <p>✔ Highest trust score (94/100)</p>
                  <p>✔ 98% success rate</p>
                </div>
              </div>
              <p className="text-xs text-gray-600 text-center">Why? Better rates & higher security for donors</p>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-2 gap-4 mb-8 pb-8 border-b border-gray-200">
              <div className="text-center">
                <p className="text-gray-600 text-sm mb-1">Status</p>
                <p className="text-lg font-bold text-gray-900">
                  {progress >= 100 ? "✓ Goal Reached" : "In Progress"}
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-600 text-sm mb-1">Days Active</p>
                <p className="text-lg font-bold text-gray-900">
                  {Math.floor((new Date().getTime() - new Date(finalCampaign.created_at).getTime()) / (1000 * 60 * 60 * 24))}d
                </p>
              </div>
            </div>

              {/* ACTIONS */}
              {supportUrl ? (
                <a
                  href={supportUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full block text-center bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 rounded-lg font-bold text-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 mb-3 shadow-lg"
                >
                  💚 Support Campaign →
                </a>
              ) : (
                <button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 rounded-lg font-bold text-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 mb-3 shadow-lg">
                  💚 Support Campaign
                </button>
              )}

              <a
                href={`https://wa.me/?text=${shareText}%20${shareUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full block text-center border-2 border-emerald-600 text-emerald-600 py-3 rounded-lg font-bold hover:bg-emerald-50 transition-colors duration-300"
              >
                📤 Share Campaign
              </a>

            </div>
          </div>

        </div>
      </div>

      {/* RELATED CAMPAIGNS */}
      {related && related.length > 0 && (
        <section className="bg-gray-50 py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
              Similar Campaigns
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {related.map((item) => {
                const relatedProgress =
                  calculateProgress(item.amount, item.goal)

                return (
                  <a
                    key={item.id}
                    href={`/campaign/${item.id}`}
                    className="group bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl hover:border-emerald-500 transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="relative overflow-hidden h-56 bg-gradient-to-br from-emerald-50 to-teal-50">
                      <CampaignImage
                        src={item.image}
                        alt={item.title}
                        width={600}
                        height={400}
                        sizes="(max-width: 1024px) 100vw, 33vw"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>

                    <div className="p-6">
                      <h3 className="font-bold text-lg text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors line-clamp-2">
                        {item.title}
                      </h3>

                      <div className="flex items-center gap-2 mb-4">
                        <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold">
                          {item.category}
                        </span>
                      </div>

                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div
                          className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full"
                          style={{ width: `${Math.min(relatedProgress, 100)}%` }}
                        />
                      </div>

                      <div className="flex justify-between items-center">
                        <p className="text-sm font-bold text-gray-900">
                          {formatInrCurrency(item.amount)}
                        </p>
                        <p className="text-xs font-semibold text-emerald-600">
                          {Math.min(relatedProgress, 100).toFixed(0)}%
                        </p>
                      </div>

                      {item.url && (
                        <div className="pt-3 mt-3 border-t border-gray-100">
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Visit Website →
                          </a>
                        </div>
                      )}
                    </div>
                  </a>
                )
              })}
            </div>
          </div>
        </section>
      )}

    </main>
  )
}