import { supabase } from "@/lib/supabase"
import { getMockCampaigns } from "@/lib/mockCampaignData"
import type { Campaign } from "@/types/campaign"

export type CampaignSource = "supabase" | "mock"

export async function getPrimaryCampaigns(): Promise<{
  campaigns: Campaign[]
  source: CampaignSource
}> {
  const { data, error } = await supabase
    .from("campaigns")
    .select("*")

  if (error || !data || data.length === 0) {
    return {
      campaigns: getMockCampaigns(),
      source: "mock",
    }
  }

  return {
    campaigns: data as Campaign[],
    source: "supabase",
  }
}
