import { MetadataRoute } from "next"
import { getSupabaseServerClient } from "@/lib/supabaseServer"
import { guides } from "@/lib/guidesData"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://fundtracker.me"
  let campaignRows: Array<{ id: string }> = []
  let blogRows: Array<{ slug: string; created_at: string }> = []
  let ngoRows: Array<{ name: string }> = []

  try {
    const supabaseServer = getSupabaseServerClient()

    const { data: campaigns } = await supabaseServer
      .from("campaigns")
      .select("id")

    const { data: blogs } = await supabaseServer
      .from("blog_posts")
      .select("slug,created_at")

    const { data: ngos } = await supabaseServer
      .from("ngos")
      .select("name")

    campaignRows = campaigns || []
    blogRows = (blogs as Array<{ slug: string; created_at: string }>) || []
    ngoRows = ngos || []
  } catch {
    campaignRows = []
    blogRows = []
    ngoRows = []
  }

  const campaignUrls =
    campaignRows.map((c) => ({
      url: `${baseUrl}/campaign/${c.id}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.7,
    })) ?? []

  const blogUrls =
    blogRows.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.created_at ? new Date(post.created_at) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })) ?? []

  const ngoUrls =
    ngoRows.map((ngo) => ({
      url: `${baseUrl}/ngo/${encodeURIComponent(ngo.name)}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })) ?? []

  const categorySlugs = ["healthcare", "education", "environment", "emergency", "water", "food"]
  const categoryUrls = categorySlugs.map((slug) => ({
    url: `${baseUrl}/category/${slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.8,
  }))

  const guideUrls = guides.map((guide) => ({
    url: `${baseUrl}/guides/${guide.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },

    {
      url: `${baseUrl}/trending`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },

    {
      url: `${baseUrl}/analytics`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },

    {
      url: `${baseUrl}/compare`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/most-funded`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/ending-soon`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/recently-funded`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },

    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/guides`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...blogUrls,
    ...guideUrls,
    ...categoryUrls,
    ...ngoUrls,
    ...campaignUrls,
  ]
}