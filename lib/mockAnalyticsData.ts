import type { AnalyticsData } from "@/types/campaign"

export function getMockWeeklyTrends(
  totalRaised: number,
  totalCampaigns: number
): AnalyticsData["weekly_trends"] {
  return [
    {
      week: "Week 1",
      amount_raised: totalRaised * 0.15,
      campaigns_launched: Math.floor(totalCampaigns * 0.2),
    },
    {
      week: "Week 2",
      amount_raised: totalRaised * 0.18,
      campaigns_launched: Math.floor(totalCampaigns * 0.22),
    },
    {
      week: "Week 3",
      amount_raised: totalRaised * 0.25,
      campaigns_launched: Math.floor(totalCampaigns * 0.25),
    },
    {
      week: "Week 4",
      amount_raised: totalRaised * 0.42,
      campaigns_launched: Math.floor(totalCampaigns * 0.33),
    },
  ]
}

export function getMockTrustScore(): number {
  return Math.min(95, 50 + Math.random() * 45)
}

export function getMockPeopleHelpedIncrement(): number {
  return Math.floor(Math.random() * 5000) + 100
}
