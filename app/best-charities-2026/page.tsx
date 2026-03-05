import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Best Charities 2026",
  description: "Discover top-rated charities in 2026 based on trust, impact, and campaign performance.",
}

export default function BestCharities2026Page() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 px-6 py-14">
      <div className="max-w-4xl mx-auto bg-white rounded-xl border border-gray-100 p-8 shadow-sm">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Best Charities 2026</h1>
        <p className="text-gray-700 leading-7">
          This guide highlights charities with strong trust profiles, transparent reporting, and consistent campaign performance.
          Use FundTracker analytics to compare donation efficiency, campaign momentum, and NGO reliability before donating.
        </p>
      </div>
    </main>
  )
}
