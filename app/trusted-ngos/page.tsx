import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Trusted NGOs",
  description: "Find trusted NGOs and review their active campaigns, trust indicators, and funding history.",
}

export default function TrustedNgosPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 px-6 py-14">
      <div className="max-w-4xl mx-auto bg-white rounded-xl border border-gray-100 p-8 shadow-sm space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">Trusted NGOs</h1>
        <p className="text-gray-700 leading-7">
          FundTracker ranks NGOs based on campaign outcomes, consistency, and transparency. Visit NGO profiles to review impact metrics,
          active campaigns, and donation momentum.
        </p>
        <Link href="/ngo-rankings" className="inline-block bg-emerald-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-emerald-700 transition-colors">
          View NGO Rankings
        </Link>
      </div>
    </main>
  )
}
