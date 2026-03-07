import { getSupabaseServerClient } from "@/lib/supabaseServer"
import type { BlogPost } from "@/types/blog"

const fallbackPosts: BlogPost[] = [
  {
    id: "fallback-1",
    title: "Best Charities to Donate to in 2026",
    slug: "best-charities-to-donate-to-2026",
    seo_title: "Best Charities to Donate to in 2026 | FundTracker",
    seo_description: "Discover trusted charities in healthcare, education, disaster relief, and poverty reduction with practical donation tips.",
    created_at: "2026-03-05T00:00:00.000Z",
    content:
      "Donating to charities is one of the most powerful ways to create meaningful impact. With thousands of nonprofit organizations around the world, choosing the right charity can be challenging.\n\nIn 2026, the most effective charities focus on transparency, measurable impact, and sustainable programs. Some of the most trusted organizations include those working in healthcare, education, disaster relief, and poverty reduction.\n\nPlatforms like FundTracker help donors discover and compare fundraising campaigns from verified organizations. By tracking donation progress, campaign transparency, and impact metrics, donors can make informed decisions about where their money will have the greatest effect.\n\nBefore donating, always verify that the organization publishes clear financial reports and demonstrates measurable outcomes.\n\nBy supporting effective charities, individuals can contribute to long-term solutions that improve lives across the world.",
  },
  {
    id: "fallback-2",
    title: "How to Donate Safely Online",
    slug: "how-to-donate-safely-online",
    seo_title: "How to Donate Safely Online | FundTracker",
    seo_description: "Learn how to verify charities, avoid risky fundraising pages, and donate safely through transparent campaigns.",
    created_at: "2026-03-04T00:00:00.000Z",
    content:
      "Online donations have become increasingly popular, but it is important to ensure that your contributions reach legitimate organizations.\n\nThe first step is verifying the charity. Trusted nonprofits provide clear information about their mission, programs, and financial transparency.\n\nAnother important factor is checking the fundraising platform. Reliable platforms show campaign progress, donation totals, and verified project details.\n\nDonors should also avoid campaigns that lack clear descriptions or contact information.\n\nFundTracker helps donors evaluate campaigns by analyzing funding progress, campaign activity, and trust signals from organizations. This makes it easier to support causes with confidence.\n\nSafe and informed giving ensures that donations create real impact in communities around the world.",
  },
  {
    id: "fallback-3",
    title: "Top NGOs Helping Children Around the World",
    slug: "top-ngos-helping-children-around-the-world",
    seo_title: "Top NGOs Helping Children Around the World | FundTracker",
    seo_description: "Explore leading child-focused NGOs and discover campaigns supporting education, healthcare, and nutrition for children.",
    created_at: "2026-03-03T00:00:00.000Z",
    content:
      "Millions of children around the world face challenges related to education, healthcare, and poverty. Non-governmental organizations play a vital role in addressing these issues.\n\nSome of the most impactful NGOs focus on improving access to education, providing medical care, and supporting vulnerable communities.\n\nOrganizations such as Save the Children, UNICEF, and ChildFund operate global programs designed to improve the lives of children in underserved regions.\n\nFundraising campaigns organized by these NGOs often support initiatives such as school construction, medical programs, and nutrition support.\n\nPlatforms like FundTracker allow donors to discover and compare child-focused campaigns, making it easier to support projects that create meaningful change.",
  },
]

export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const supabaseServer = getSupabaseServerClient()
    const { data, error } = await supabaseServer
      .from("blog_posts")
      .select("id,title,slug,content,seo_title,seo_description,created_at")
      .order("created_at", { ascending: false })

    if (error || !data || data.length === 0) {
      return fallbackPosts
    }

    return data as BlogPost[]
  } catch {
    return fallbackPosts
  }
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const fallback = fallbackPosts.find((post) => post.slug === slug)

  try {
    const supabaseServer = getSupabaseServerClient()
    const { data, error } = await supabaseServer
      .from("blog_posts")
      .select("id,title,slug,content,seo_title,seo_description,created_at")
      .eq("slug", slug)
      .single()

    if (error || !data) {
      return fallback || null
    }

    return data as BlogPost
  } catch {
    return fallback || null
  }
}
