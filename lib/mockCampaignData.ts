import { Campaign } from "@/types/campaign"

type MockCampaignSeed = Omit<Campaign, "created_at" | "trend_score"> & {
  daysAgo: number
}

const mockCampaignSeeds: MockCampaignSeed[] = [
  {
    id: "mock-1",
    title: "Emergency Medical Camp in Rural Village",
    platform: "Supabase",
    amount: 15000000,
    goal: 25000000,
    category: "Healthcare",
    description: "Providing medical care to underprivileged villages",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=500",
    daysAgo: 5,
  },
  {
    id: "mock-2",
    title: "Build School for Rural Children",
    platform: "Supabase",
    amount: 8000000,
    goal: 20000000,
    category: "Education",
    description: "Construct a school building in remote areas",
    image: "https://images.unsplash.com/photo-1427504494785-cdacc3ae3b7f?w=500",
    daysAgo: 10,
  },
  {
    id: "mock-3",
    title: "Plant Trees for Clean Air",
    platform: "Supabase",
    amount: 5000000,
    goal: 15000000,
    category: "Environment",
    description: "Large scale tree planting initiative",
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=500",
    daysAgo: 3,
  },
  {
    id: "mock-4",
    title: "Flood Relief Emergency Fund",
    platform: "Supabase",
    amount: 22000000,
    goal: 30000000,
    category: "Emergency",
    description: "Help families affected by recent floods",
    image: "https://images.unsplash.com/photo-1495567720989-cebdbdd97913?w=500",
    daysAgo: 1,
  },
  {
    id: "mock-5",
    title: "Clean Water Wells Project",
    platform: "Supabase",
    amount: 12000000,
    goal: 18000000,
    category: "Water",
    description: "Drill wells for pure drinking water",
    image: "https://images.unsplash.com/photo-1559027615-cd2628902d4a?w=500",
    daysAgo: 7,
  },
  {
    id: "mock-6",
    title: "Feed 1000 Families Campaign",
    platform: "Supabase",
    amount: 3000000,
    goal: 10000000,
    category: "Food",
    description: "Daily food distribution program",
    image: "https://images.unsplash.com/photo-1585393863537-d2656fd0fb2c?w=500",
    daysAgo: 4,
  },
]

export function getMockCampaigns(): Campaign[] {
  const now = Date.now()

  return mockCampaignSeeds.map((campaign) => ({
    ...campaign,
    created_at: new Date(now - campaign.daysAgo * 24 * 60 * 60 * 1000).toISOString(),
    trend_score: Math.random() * 100,
  }))
}

export function getMockCampaignById(id: string): Campaign | null {
  const normalizedId = id === "1" ? "mock-1" : id
  return getMockCampaigns().find((campaign) => campaign.id === normalizedId) || null
}
