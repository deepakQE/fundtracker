import { supabase } from "@/lib/supabase"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

/* -------------------- */
/* 🧠 Dynamic SEO Setup */
/* -------------------- */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params

  const { data } = await supabase
    .from("campaigns")
    .select("title, category, amount, goal")
    .eq("id", id)
    .single()

  if (!data) {
    return {
      title: "Campaign Not Found",
    }
  }

  return {
    title: `${data.title}`,
    description: `Support this ${data.category} campaign. ₹${data.amount} raised out of ₹${data.goal}.`,
  }
}

/* -------------------- */
/* 📄 Campaign Page     */
/* -------------------- */

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

  const progress =
    campaign.goal > 0
      ? (campaign.amount / campaign.goal) * 100
      : 0

  return (
    <main className="min-h-screen p-10 bg-gray-50">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-lg">

        <h1 className="text-3xl font-bold mb-4">
          {campaign.title}
        </h1>

        <p className="text-gray-600 mb-2">
          Platform: {campaign.platform}
        </p>

        <p className="text-gray-600 mb-2">
          Category: {campaign.category}
        </p>

        <p className="text-gray-400 text-sm mb-6">
          Created: {new Date(campaign.created_at).toLocaleDateString()}
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
          <div
            className="bg-green-500 h-4 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="mb-2 font-medium">
          ₹ {campaign.amount} raised of ₹ {campaign.goal}
        </p>

        <p className="text-sm text-gray-500">
          {progress.toFixed(1)}% funded
        </p>

      </div>
    </main>
  )
}