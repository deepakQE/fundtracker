import { supabase } from "@/lib/supabase"

export default async function Home() {
  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("*")

  return (
    <main className="min-h-screen bg-gray-50 p-10">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <h1 className="text-5xl font-bold mb-4">
          FundTracker 🚀
        </h1>
        <p className="text-gray-600 text-lg">
          Discover and analyze trending fundraising campaigns
        </p>
      </section>

      {/* Campaign Grid */}
      <section className="grid md:grid-cols-3 gap-8">
        {campaigns?.map((campaign) => {
          const progress =
            (campaign.amount / campaign.goal) * 100

          return (
            <div
              key={campaign.id}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition"
            >
              <h2 className="text-xl font-semibold mb-2">
                {campaign.title}
              </h2>

              <p className="text-sm text-gray-500 mb-4">
                Platform: {campaign.platform}
              </p>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div
                  className="bg-green-500 h-3 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <p className="text-sm font-medium">
                ₹ {campaign.amount} raised of ₹ {campaign.goal}
              </p>

              <p className="text-xs text-gray-400 mt-2">
                {progress.toFixed(1)}% funded
              </p>
            </div>
          )
        })}
      </section>
    </main>
  )
}