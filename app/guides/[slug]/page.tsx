import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getGuideBySlug, guides } from "@/lib/guidesData"

export const revalidate = 21600

export function generateStaticParams() {
  return guides.map((guide) => ({ slug: guide.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const guide = getGuideBySlug(slug)

  if (!guide) {
    return {
      title: "Guide Not Found",
    }
  }

  return {
    title: `${guide.title} | FundTracker Guides`,
    description: guide.description,
    alternates: {
      canonical: `/guides/${guide.slug}`,
    },
    openGraph: {
      title: `${guide.title} | FundTracker Guides`,
      description: guide.description,
      url: `https://fundtracker.me/guides/${guide.slug}`,
      type: "article",
    },
  }
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const guide = getGuideBySlug(slug)

  if (!guide) {
    notFound()
  }

  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.description,
    mainEntityOfPage: `https://fundtracker.me/guides/${guide.slug}`,
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-6 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <article className="max-w-4xl mx-auto bg-white border border-gray-100 rounded-xl p-8 shadow-sm">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{guide.title}</h1>
        <p className="text-lg text-gray-700 mb-8">{guide.description}</p>

        <div className="space-y-4 text-gray-800 text-lg leading-relaxed">
          {guide.content.map((paragraph, index) => (
            <p key={`${guide.slug}-${index}`}>{paragraph}</p>
          ))}
        </div>

        <section className="mt-10 pt-6 border-t border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Explore Next</h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/blog" className="px-4 py-2 rounded-lg bg-emerald-100 text-emerald-800 font-medium">Read Blog</Link>
            <Link href="/ngo-rankings" className="px-4 py-2 rounded-lg bg-blue-100 text-blue-800 font-medium">Top NGOs</Link>
            <Link href="/trending" className="px-4 py-2 rounded-lg bg-orange-100 text-orange-800 font-medium">Trending Campaigns</Link>
          </div>
        </section>
      </article>
    </main>
  )
}
