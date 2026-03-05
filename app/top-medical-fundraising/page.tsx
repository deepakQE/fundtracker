import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Top Medical Fundraising Campaigns",
  description: "Compare top healthcare and medical fundraising campaigns with real funding metrics.",
}

export default function TopMedicalFundraisingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 px-6 py-14">
      <div className="max-w-4xl mx-auto bg-white rounded-xl border border-gray-100 p-8 shadow-sm">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Top Medical Fundraising</h1>
        <p className="text-gray-700 leading-7">
          Explore high-impact medical campaigns across treatments, emergency healthcare, and hospital support.
          Compare trust score, growth rate, and funding progress to find where your donation can create the strongest impact.
        </p>
      </div>
    </main>
  )
}
