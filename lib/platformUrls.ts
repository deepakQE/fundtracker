/**
 * Platform URL generation utility
 * Generates support URLs for various fundraising platforms
 */

export interface PlatformInfo {
  name: string
  trustScore: number
  fees: number
  url?: string
  icon: string
  description: string
}

export const PLATFORM_CONFIG: { [key: string]: Omit<PlatformInfo, 'url'> } = {
  "GlobalGiving": {
    name: "GlobalGiving",
    trustScore: 94,
    fees: 4,
    icon: "🌍",
    description: "Lowest fees (4%) • Highest trust score (94/100) • 98% success rate"
  },
  "GoFundMe": {
    name: "GoFundMe",
    trustScore: 92,
    fees: 5,
    icon: "🚀",
    description: "Platform for various campaigns • 92 trust score • Fast fundraising"
  },
  "JustGiving": {
    name: "JustGiving",
    trustScore: 91,
    fees: 5,
    icon: "💪",
    description: "Charity fundraising • 91 trust score • Strong donor base"
  },
  "GiveWell": {
    name: "GiveWell",
    trustScore: 96,
    fees: 3,
    icon: "✅",
    description: "Highest trust (96%) • Lowest fees (3%) • Verified charities"
  },
  "Ketto": {
    name: "Ketto",
    trustScore: 90,
    fees: 6,
    icon: "🎯",
    description: "India's leading platform • ₹1500Cr+ raised • 90 trust score"
  },
  "Milaap": {
    name: "Milaap",
    trustScore: 92,
    fees: 0,
    icon: "💝",
    description: "0% platform fee • India focused • 92 trust score • 40% success"
  },
  "GiveIndia": {
    name: "GiveIndia",
    trustScore: 95,
    fees: 5,
    icon: "🇮🇳",
    description: "80G tax benefits • NGO focused • 95 trust score"
  },
  "Supabase": {
    name: "Supabase",
    trustScore: 85,
    fees: 2.5,
    icon: "⚡",
    description: "Local platform • 85 trust score • Quick processing"
  },
}

/**
 * Generate a platform support URL based on campaign details
 * @param platform - The fundraising platform name
 * @param campaignId - The campaign ID (from database or URL)
 * @param existingUrl - Any existing URL from the campaign data
 * @returns The support URL or undefined
 */
export function generatePlatformUrl(
  platform: string | undefined,
  campaignId: string | undefined,
  existingUrl?: string
): string | undefined {
  // If we have an existing URL, use it
  if (existingUrl) {
    return existingUrl
  }

  if (!platform || !campaignId) {
    return undefined
  }

  const normalizedPlatform = platform.toLowerCase().trim()

  // Platform-specific URL patterns
  switch (normalizedPlatform) {
    case "globalgiving":
      // GlobalGiving uses project IDs - try to extract from campaign ID
      return `https://www.globalgiving.org/projects/${campaignId}/`

    case "gofundme":
      return `https://www.gofundme.com/search?q=${encodeURIComponent(campaignId)}`

    case "justgiving":
      return `https://www.justgiving.com/search?q=${encodeURIComponent(campaignId)}`

    case "ketto":
      return `https://www.ketto.org/campaigns/${campaignId}`

    case "milaap":
      return `https://www.milaap.org/${campaignId}`

    case "giveindia":
      return `https://www.giveindia.org/campaigns/${campaignId}`

    case "givewell":
      return `https://www.givewell.org/recommendations`

    case "supabase":
    default:
      // Fallback - no specific URL pattern
      return undefined
  }
}

/**
 * Get the best platform recommendation based on a list of campaigns
 * Returns the platform with the highest trust score
 */
export function getBestPlatform(platforms: string[]): string {
  let bestPlatform = "GlobalGiving"
  let bestScore = 0

  platforms.forEach((platform) => {
    const config = PLATFORM_CONFIG[platform]
    if (config && config.trustScore > bestScore) {
      bestScore = config.trustScore
      bestPlatform = platform
    }
  })

  return bestPlatform
}

/**
 * Get platform info with trust score and fees
 */
export function getPlatformInfo(platformName: string): PlatformInfo | null {
  const config = PLATFORM_CONFIG[platformName]
  if (!config) {
    return null
  }

  return {
    ...config,
    url: generatePlatformUrl(platformName, undefined)
  }
}

/**
 * Get all available platforms sorted by trust score
 */
export function getAllPlatformsSorted(): PlatformInfo[] {
  return Object.entries(PLATFORM_CONFIG)
    .map(([, config]) => ({
      ...config,
      url: undefined
    }))
    .sort((a, b) => b.trustScore - a.trustScore)
}
