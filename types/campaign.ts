export interface Campaign {
  id: string
  external_id?: string
  title: string
  platform: string
  amount: number
  goal: number
  category: string
  image?: string
  description?: string
  created_at: string
  url?: string
  trust_score?: number
  trend_score?: number
  impact_score?: number
  impact_metrics?: {
    people_helped?: number
    villages_supported?: number
    items_distributed?: number
    lives_changed?: number
    custom_metric?: string
  }
  ngo_name?: string
  ngo_id?: number | null
  verified_ngo?: boolean
  donor_reviews_count?: number
  platform_fees?: number
  success_rate?: number
}

export interface NGOProfile {
  id: string
  name: string
  total_donations: number
  campaign_count: number
  trust_score: number
  verified: boolean
  total_impact: string
  top_category: string
  platforms: string[]
  logo?: string
}

export interface PlatformStats {
  name: string
  fees: number
  trust_score: number
  avg_success_rate: number
  total_campaigns: number
  total_raised: number
}

export interface AnalyticsData {
  total_raised: number
  total_campaigns: number
  average_funding_rate: number
  top_category: string
  trending_campaign: Campaign
  platform_stats: PlatformStats[]
  weekly_trends: Array<{
    week: string
    amount_raised: number
    campaigns_launched: number
  }>
}