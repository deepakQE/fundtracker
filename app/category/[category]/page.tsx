import type { Metadata } from "next"
import CategoryPageClient from "@/components/CategoryPageClient"

const CATEGORY_DEFS: Record<string, { title: string; description: string }> = {
  healthcare: {
    title: "Healthcare Campaigns",
    description: "Discover healthcare and medical fundraising campaigns with transparent progress tracking.",
  },
  education: {
    title: "Education Campaigns",
    description: "Explore education campaigns and scholarships from verified nonprofit initiatives.",
  },
  environment: {
    title: "Environment Campaigns",
    description: "Find climate, conservation, and sustainability-focused fundraising campaigns.",
  },
  emergency: {
    title: "Emergency Relief Campaigns",
    description: "Support urgent disaster relief and humanitarian response campaigns.",
  },
  water: {
    title: "Water and Sanitation Campaigns",
    description: "Track clean water and sanitation fundraising projects worldwide.",
  },
  food: {
    title: "Food Security Campaigns",
    description: "Support hunger relief, food aid, and nutrition-focused nonprofit campaigns.",
  },
}

export const revalidate = 21600

export function generateStaticParams() {
  return Object.keys(CATEGORY_DEFS).map((category) => ({ category }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>
}): Promise<Metadata> {
  const { category } = await params
  const fallbackTitle = category.charAt(0).toUpperCase() + category.slice(1)
  const definition = CATEGORY_DEFS[category]

  return {
    title: definition?.title || `${fallbackTitle} Campaigns`,
    description:
      definition?.description || `Explore ${fallbackTitle.toLowerCase()} campaigns on FundTracker.`,
    alternates: {
      canonical: `/category/${category}`,
    },
    openGraph: {
      title: definition?.title || `${fallbackTitle} Campaigns`,
      description:
        definition?.description || `Explore ${fallbackTitle.toLowerCase()} campaigns on FundTracker.`,
      url: `https://fundtracker.me/category/${category}`,
      type: "website",
    },
  }
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>
}) {
  const { category } = await params

  return <CategoryPageClient categorySlug={category} />
}
