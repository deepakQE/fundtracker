import type { Metadata } from "next"
import Link from "next/link"
import { getBlogPosts } from "@/lib/blogData"

export const revalidate = 21600

export const metadata: Metadata = {
  title: "FundTracker Blog",
  description: "Donation guides, charity research, and NGO transparency insights to help donors make informed decisions.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "FundTracker Blog",
    description: "Donation guides and NGO insights.",
    url: "https://fundtracker.me/blog",
    type: "website",
  },
}

export default async function BlogIndexPage() {
  const posts = await getBlogPosts()

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50 to-gray-50 px-6 py-12">
      <section className="max-w-5xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">FundTracker Blog</h1>
        <p className="text-lg text-gray-700 mb-10">Insights, donation safety guides, and NGO-focused explainers.</p>

        <div className="space-y-5">
          {posts.map((post) => (
            <article key={post.id} className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-sm text-gray-500 mb-2">
                {new Date(post.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                <Link href={`/blog/${post.slug}`} className="hover:text-emerald-700 transition-colors">
                  {post.title}
                </Link>
              </h2>
              <p className="text-gray-700 line-clamp-3">{post.seo_description || post.content}</p>
              <div className="mt-4">
                <Link href={`/blog/${post.slug}`} className="text-emerald-700 font-semibold hover:text-emerald-800">
                  Read article {"->"}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
