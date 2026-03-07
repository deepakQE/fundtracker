import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getBlogPostBySlug, getBlogPosts } from "@/lib/blogData"
import { getSupabaseServerClient } from "@/lib/supabaseServer"

export const revalidate = 21600

export async function generateStaticParams() {
  const posts = await getBlogPosts()
  return posts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getBlogPostBySlug(slug)

  if (!post) {
    return {
      title: "Blog Post Not Found",
    }
  }

  return {
    title: post.seo_title || post.title,
    description: post.seo_description,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title: post.seo_title || post.title,
      description: post.seo_description,
      url: `https://fundtracker.me/blog/${post.slug}`,
      type: "article",
      publishedTime: post.created_at,
    },
  }
}

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getBlogPostBySlug(slug)

  if (!post) {
    notFound()
  }

  let linkedCampaigns: Array<{ id: string; title: string; ngo_name?: string }> = []
  let linkedNgos: Array<{ name: string }> = []

  try {
    const supabaseServer = getSupabaseServerClient()
    const { data: campaigns } = await supabaseServer
      .from("campaigns")
      .select("id,title,ngo_name,trend_score")
      .order("trend_score", { ascending: false })
      .limit(4)

    const { data: ngos } = await supabaseServer
      .from("ngos")
      .select("name,trust_score")
      .order("trust_score", { ascending: false })
      .limit(4)

    linkedCampaigns = campaigns || []
    linkedNgos = ngos || []
  } catch {
    linkedCampaigns = []
    linkedNgos = []
  }

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.seo_description,
    datePublished: post.created_at,
    dateModified: post.created_at,
    author: {
      "@type": "Organization",
      name: "FundTracker",
    },
    publisher: {
      "@type": "Organization",
      name: "FundTracker",
      logo: {
        "@type": "ImageObject",
        url: "https://fundtracker.me/favicon.ico",
      },
    },
    mainEntityOfPage: `https://fundtracker.me/blog/${post.slug}`,
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-6 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />

      <article className="max-w-4xl mx-auto bg-white border border-gray-100 rounded-xl p-8 shadow-sm">
        <p className="text-sm text-gray-500 mb-3">
          {new Date(post.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">{post.title}</h1>

        <div className="space-y-5 text-lg text-gray-800 leading-relaxed">
          {post.content
            .split("\n\n")
            .filter(Boolean)
            .map((paragraph, index) => (
              <p key={`${post.slug}-${index}`}>{paragraph}</p>
            ))}
        </div>

        <section className="mt-10 pt-8 border-t border-gray-100 grid md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Related Campaigns</h2>
            <ul className="space-y-2">
              {linkedCampaigns.map((campaign) => (
                <li key={campaign.id}>
                  <Link href={`/campaign/${campaign.id}`} className="text-emerald-700 hover:text-emerald-800 font-medium">
                    {campaign.title}
                  </Link>
                </li>
              ))}
              {linkedCampaigns.length === 0 && <li className="text-gray-600">No campaign links available yet.</li>}
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Trusted NGOs</h2>
            <ul className="space-y-2">
              {linkedNgos.map((ngo) => (
                <li key={ngo.name}>
                  <Link href={`/ngo/${encodeURIComponent(ngo.name)}`} className="text-emerald-700 hover:text-emerald-800 font-medium">
                    {ngo.name}
                  </Link>
                </li>
              ))}
              {linkedNgos.length === 0 && <li className="text-gray-600">No NGO links available yet.</li>}
            </ul>
          </div>
        </section>
      </article>
    </main>
  )
}
