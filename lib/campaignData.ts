"use server"

import { getMockCampaigns } from "@/lib/mockCampaignData"
import { getSupabaseServerClient } from "@/lib/supabaseServer"
import type { Campaign } from "@/types/campaign"
import { unstable_cache } from 'next/cache'

export type CampaignSource = "supabase" | "mock"

const getCampaignsFromDb = unstable_cache(
  async (): Promise<{
    campaigns: Campaign[]
    source: CampaignSource
  }> => {
    try {
      const supabaseServer = getSupabaseServerClient()
      const { data, error } = await supabaseServer
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
    } catch {
      return {
        campaigns: getMockCampaigns(),
        source: "mock",
      }
    }
  },
  ['campaigns-list'],
  {
    revalidate: 21600, // Cache for 6 hours
    tags: ['campaigns']
  }
)

export async function getPrimaryCampaigns(): Promise<{
  campaigns: Campaign[]
  source: CampaignSource
}> {
  return getCampaignsFromDb()
}
