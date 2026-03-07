import type { Metadata } from "next"
import Link from "next/link"
import { guides } from "@/lib/guidesData"

export const metadata: Metadata = {
  title: "Donation Guides",
  description: "Practical donation guides for safe giving, NGO evaluation, and impact-focused decisions.",
  alternates: {
    canonical: "/guides",
  },
}

export default function GuidesIndexPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50 to-gray-50 px-6 py-12">
      <section className="max-w-5xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Donation Guides</h1>
        <p className="text-lg text-gray-700 mb-10">Actionable resources for better, safer, and more effective giving.</p>

        <div className="grid md:grid-cols-2 gap-5">
          {guides.map((guide) => (
            <article key={guide.slug} className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">{guide.title}</h2>
              <p className="text-gray-700 mb-4">{guide.description}</p>
              <Link href={`/guides/${guide.slug}`} className="text-emerald-700 font-semibold hover:text-emerald-800">
                Read guide {"->"}
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
