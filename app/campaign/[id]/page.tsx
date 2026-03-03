import { supabase } from "@/lib/supabase"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

/* ================= SEO ================= */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params

  const { data } = await supabase
    .from("campaigns")
    .select("title, category, amount, goal, image")
    .eq("id", id)
    .single()

  if (!data) {
    return { title: "Campaign Not Found" }
  }

  return {
    title: data.title,
    description: `Support this ${data.category} campaign. ₹${data.amount} raised out of ₹${data.goal}.`,
    openGraph: {
      title: data.title,
      description: `₹${data.amount} raised out of ₹${data.goal}.`,
      images: data.image ? [data.image] : [],
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

  const { data: campaign, error } = await supabase
    .from("campaigns")
    .select("*")
    .eq("id", id)
    .single()

  if (!campaign || error) {
    return notFound()
  }

  /* ===== RELATED ===== */

  const { data: related } = await supabase
    .from("campaigns")
    .select("*")
    .eq("category", campaign.category)
    .neq("id", campaign.id)
    .limit(3)

  const progress =
    campaign.goal > 0
      ? (campaign.amount / campaign.goal) * 100
      : 0

  return (
    <main className="min-h-screen bg-gray-50 pb-20">

      {/* HERO IMAGE */}
      <div className="w-full h-[420px] overflow-hidden">
        <img
          src={
            campaign.image ||
            "https://images.pexels.com/photos/6646918/pexels-photo-6646918.jpeg"
          }
          alt={campaign.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* MAIN GRID */}
      <div className="max-w-6xl mx-auto -mt-20 relative z-10 px-6">

        <div className="grid md:grid-cols-3 gap-8">

          {/* LEFT SIDE */}
          <div className="md:col-span-2 bg-white p-8 rounded-2xl shadow-lg">

            <h1 className="text-4xl font-bold mb-4">
              {campaign.title}
            </h1>

            <div className="flex gap-3 mb-6">
              <span className="bg-emerald-100 text-emerald-700 px-4 py-1 rounded-full text-sm font-medium">
                {campaign.category}
              </span>

              <span className="bg-gray-200 text-gray-700 px-4 py-1 rounded-full text-sm font-medium">
                {campaign.platform}
              </span>
            </div>

            <p className="text-gray-500 text-sm mb-6">
              Created: {new Date(campaign.created_at).toLocaleDateString()}
            </p>

            <h2 className="text-xl font-semibold mb-3">
              About this campaign
            </h2>

            <p className="text-gray-700 leading-relaxed">
              {campaign.description || "No description provided yet."}
            </p>

          </div>

          {/* RIGHT ACTION CARD */}
          <div className="bg-white p-8 rounded-2xl shadow-lg h-fit">

            <p className="text-2xl font-bold mb-1">
              ₹ {campaign.amount}
            </p>

            <p className="text-gray-500 text-sm mb-4">
              raised of ₹ {campaign.goal}
            </p>

            <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
              <div
                className="bg-emerald-600 h-3 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>

            <p className="text-sm text-gray-600 mb-6">
              {progress.toFixed(1)}% funded
            </p>

            <button className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition mb-3">
              Support Campaign
            </button>

            <button
              onClick={() =>
                navigator.share
                  ? navigator.share({
                      title: campaign.title,
                      url: "",
                    })
                  : alert("Sharing not supported on this device")
              }
              className="w-full border border-gray-300 py-3 rounded-lg hover:bg-gray-100 transition"
            >
              Share Campaign
            </button>

          </div>

        </div>
      </div>

      {/* RELATED CAMPAIGNS */}
      {related && related.length > 0 && (
        <div className="max-w-6xl mx-auto mt-20 px-6">
          <h2 className="text-3xl font-bold mb-8 text-center">
            Related Campaigns
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {related.map((item) => {
              const relatedProgress =
                item.goal > 0
                  ? (item.amount / item.goal) * 100
                  : 0

              return (
                <a
                  key={item.id}
                  href={`/campaign/${item.id}`}
                  className="bg-white rounded-2xl shadow hover:shadow-xl transition overflow-hidden"
                >
                  <img
                    src={
                      item.image ||
                      "https://images.pexels.com/photos/6646918/pexels-photo-6646918.jpeg"
                    }
                    alt={item.title}
                    className="w-full h-44 object-cover"
                  />

                  <div className="p-6">
                    <h3 className="font-semibold mb-3">
                      {item.title}
                    </h3>

                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div
                        className="bg-emerald-600 h-2 rounded-full"
                        style={{ width: `${relatedProgress}%` }}
                      />
                    </div>

                    <p className="text-xs text-gray-500">
                      {relatedProgress.toFixed(0)}% funded
                    </p>
                  </div>
                </a>
              )
            })}
          </div>
        </div>
      )}

    </main>
  )
}