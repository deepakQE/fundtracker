import { supabase } from "@/lib/supabase"

export default async function Home() {
  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("*")

  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold mb-6">FundTracker 🚀</h1>

      <div className="grid gap-6">
        {campaigns?.map((campaign) => (
          <div
            key={campaign.id}
            className="p-6 border rounded-xl shadow"
          >
            <h2 className="text-xl font-semibold">
              {campaign.title}
            </h2>
            <p>
              ₹ {campaign.amount} raised of ₹ {campaign.goal}
            </p>
            <p className="text-sm text-gray-500">
              Platform: {campaign.platform}
            </p>
          </div>
        ))}
      </div>
    </main>
  )
}