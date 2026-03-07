import { NextResponse } from "next/server"
import type { Campaign } from "@/types/campaign"
import { calculateProgress } from "@/lib/currency"
import { getSupabaseServerClient } from "@/lib/supabaseServer"
import { appendReferralCode } from "@/lib/referral"

type GlobalGivingProject = {
  id: string | number
  title?: string
  summary?: string
  themeName?: string
  image?: {
    big?: string
    medium?: string
    imagelink?: string
  }
  imageLink?: string
  funding?: number | string
  goal?: number | string
  organizationName?: string
  organization?: {
    name?: string
  }
  projectLink?: string
  activeDate?: string
}

type SyncResult = {
  ok: boolean
  source: string
  fetched: number
  inserted: number
  updated: number
  errors: string[]
}

type NGOUpsertRow = {
  name: string
  description: string
  website: string | null
  logo: string | null
  trust_score: number
}

const SYNC_CATEGORIES = [
  "health",
  "education",
  "environment",
  "emergency",
  "children",
  "women",
  "animals",
  "water",
  "climate",
  "poverty",
  "disaster",
  "hunger",
  "human-rights",
  "economic-development",
  "technology",
] as const

const GLOBAL_GIVING_HEADERS = { Accept: "application/json" }
const PROJECTS_PER_PAGE = 100 // GlobalGiving max per request
const MAX_PAGES_PER_CATEGORY = 5 // Fetch up to 500 projects per category

function toNumber(value: unknown): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : Number.NaN
}

function computeTrendScore(campaign: Pick<Campaign, "amount" | "goal" | "created_at">): number {
  const now = Date.now()
  const createdAt = new Date(campaign.created_at).getTime()
  const daysOld = Math.max(1, (now - createdAt) / (1000 * 60 * 60 * 24))

  const progress = Math.min(calculateProgress(campaign.amount, campaign.goal), 100)
  
  // 40% donation progress
  const donationProgress = Math.min(100, progress)
  
  // 30% growth rate (amount raised per day)
  const growthRate = Math.min(100, Number.isFinite(campaign.amount) ? (campaign.amount / daysOld) / 10000 : 0)
  
  // 20% recency (newer campaigns score higher)
  const recency = Math.max(0, 100 - daysOld * 2)
  
  // 10% engagement proxy
  const engagement = Math.min(100, Number.isFinite(campaign.amount) ? Math.sqrt(campaign.amount) / 20 : 0)

  return donationProgress * 0.4 + growthRate * 0.3 + recency * 0.2 + engagement * 0.1
}

function normalizeGlobalGivingCampaign(project: GlobalGivingProject, fallbackCategory?: string): Campaign {
  const id = String(project.id)
  const amount = toNumber(project.funding)
  const goal = toNumber(project.goal)
  const createdAt = project.activeDate && !Number.isNaN(new Date(project.activeDate).getTime())
    ? new Date(project.activeDate).toISOString()
    : new Date().toISOString()

  const normalized: Campaign = {
    id: `gg-${id}`,
    external_id: id,
    title: project.title || "Untitled Campaign",
    platform: "GlobalGiving",
    amount,
    goal,
    category: project.themeName || fallbackCategory || "General",
    description: project.summary || "",
    image:
      project.image?.big ||
      project.image?.medium ||
      project.image?.imagelink ||
      project.imageLink ||
      `https://www.globalgiving.org/pfil/${id}/pict_original.jpg` ||
      `https://www.globalgiving.org/pfil/${id}/pict_large.jpg`,
    created_at: createdAt,
    url: appendReferralCode(project.projectLink),
    ngo_name: project.organization?.name || project.organizationName || "Unknown NGO",
    trend_score: 0,
  }

  normalized.trend_score = computeTrendScore(normalized)
  return normalized
}

function buildNgoDescription(ngoName: string): string {
  return `${ngoName} runs impact campaigns listed on FundTracker.`
}

function getCandidateUrls(apiKey: string, category: string, page: number = 1): string[] {
  const encodedCategory = encodeURIComponent(category)
  const nextProjectNumber = (page - 1) * PROJECTS_PER_PAGE + 1
  
  return [
    // All active projects by theme (best for scaling)
    `https://api.globalgiving.org/api/public/projectservice/all/projects/active?api_key=${apiKey}&nextProjectNumber=${nextProjectNumber}&theme=${encodedCategory}`,
    // Theme-based search
    `https://api.globalgiving.org/api/public/projectservice/themes/${encodedCategory}/projects?api_key=${apiKey}&nextProjectNumber=${nextProjectNumber}`,
    // Search-based approach
    `https://api.globalgiving.org/api/public/projectservice/search/projects?api_key=${apiKey}&q=${encodedCategory}&nextProjectNumber=${nextProjectNumber}`,
    // Featured fallback
    `https://api.globalgiving.org/api/public/projectservice/featured/projects?api_key=${apiKey}&theme=${encodedCategory}&nextProjectNumber=${nextProjectNumber}`,
  ]
}

async function fetchProjectsForCategory(apiKey: string, category: string): Promise<GlobalGivingProject[]> {
  const allProjects: GlobalGivingProject[] = []
  
  // Fetch multiple pages for each category
  for (let page = 1; page <= MAX_PAGES_PER_CATEGORY; page++) {
    const candidates = getCandidateUrls(apiKey, category, page)
    let pageProjects: GlobalGivingProject[] = []

    for (const url of candidates) {
      try {
        const response = await fetch(url, {
          headers: GLOBAL_GIVING_HEADERS,
          cache: "no-store",
        })

        if (!response.ok) {
          continue
        }

        const payload = await response.json()
        const projects = payload?.projects?.project

        if (Array.isArray(projects) && projects.length > 0) {
          pageProjects = projects as GlobalGivingProject[]
          break // Found projects, stop trying candidate URLs
        }
      } catch {
        continue
      }
    }
    
    if (pageProjects.length === 0) {
      // No more projects for this category
      break
    }
    
    allProjects.push(...pageProjects)
    
    // If we got fewer projects than requested, we've reached the end
    if (pageProjects.length < PROJECTS_PER_PAGE) {
      break
    }
    
    // Add small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  return allProjects
}

async function runSync(): Promise<SyncResult> {
  const errors: string[] = []
  let supabaseServer

  try {
    supabaseServer = getSupabaseServerClient()
  } catch (error) {
    return {
      ok: false,
      source: "supabase",
      fetched: 0,
      inserted: 0,
      updated: 0,
      errors: [error instanceof Error ? error.message : "Failed to initialize Supabase server client"],
    }
  }

  const apiKey = process.env.GLOBALGIVING_API_KEY

  if (!apiKey) {
    return {
      ok: false,
      source: "globalgiving",
      fetched: 0,
      inserted: 0,
      updated: 0,
      errors: ["Missing GLOBALGIVING_API_KEY on server"],
    }
  }

  const allProjects: Array<GlobalGivingProject & { __fallbackCategory?: string }> = []

  for (const category of SYNC_CATEGORIES) {
    const categoryProjects = await fetchProjectsForCategory(apiKey, category)
    if (categoryProjects.length === 0) {
      errors.push(`No projects returned for category: ${category}`)
      continue
    }

    allProjects.push(
      ...categoryProjects.map((project) => ({
        ...project,
        __fallbackCategory: category,
      }))
    )
  }

  if (allProjects.length === 0) {
    try {
      const fallbackUrl = `https://api.globalgiving.org/api/public/projectservice/featured/projects/summary?api_key=${apiKey}`
      const response = await fetch(fallbackUrl, {
        headers: GLOBAL_GIVING_HEADERS,
        cache: "no-store",
      })

      if (response.ok) {
        const payload = await response.json()
        const featuredProjects: GlobalGivingProject[] = payload?.projects?.project || []
        allProjects.push(...featuredProjects.map((project) => ({ ...project, __fallbackCategory: "featured" })))
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to connect to GlobalGiving API"
      errors.push(errorMessage)
    }
  }

  if (allProjects.length === 0) {
    return {
      ok: false,
      source: "globalgiving",
      fetched: 0,
      inserted: 0,
      updated: 0,
      errors: errors.length > 0 ? errors : ["No campaigns fetched from GlobalGiving"],
    }
  }

  const normalizedCampaigns = allProjects.map((project) =>
    normalizeGlobalGivingCampaign(project, project.__fallbackCategory)
  )
  const uniqueCampaigns = normalizedCampaigns.filter((campaign, index, arr) => {
    return arr.findIndex((item) => item.external_id === campaign.external_id) === index
  })

  const externalIds = uniqueCampaigns
    .map((campaign) => campaign.external_id)
    .filter((value): value is string => Boolean(value))

  const { data: existingRows, error: existingError } = await supabaseServer
    .from("campaigns")
    .select("external_id")
    .in("external_id", externalIds)

  if (existingError) {
    errors.push(`Failed to read existing campaign external ids: ${existingError.message}`)
  }

  const existingIdSet = new Set((existingRows || []).map((row) => row.external_id))
  const inserted = uniqueCampaigns.filter((campaign) => !existingIdSet.has(campaign.external_id)).length
  const updated = uniqueCampaigns.length - inserted

  const ngoMap = new Map<string, NGOUpsertRow>()
  for (const campaign of uniqueCampaigns) {
    const ngoName = campaign.ngo_name || "Unknown NGO"
    if (!ngoMap.has(ngoName)) {
      ngoMap.set(ngoName, {
        name: ngoName,
        description: buildNgoDescription(ngoName),
        website: null,
        logo: campaign.image || null,
        trust_score: Math.max(55, Math.min(98, Math.round((campaign.trend_score || 70) + 10))),
      })
    }
  }

  const ngosToUpsert = Array.from(ngoMap.values())
  let ngoIdByName = new Map<string, number>()

  if (ngosToUpsert.length > 0) {
    const { data: ngoRows, error: ngoUpsertError } = await supabaseServer
      .from("ngos")
      .upsert(ngosToUpsert, { onConflict: "name" })
      .select("id,name")

    if (ngoUpsertError) {
      errors.push(`NGO upsert failed: ${ngoUpsertError.message}`)
    } else {
      ngoIdByName = new Map((ngoRows || []).map((row) => [row.name as string, row.id as number]))
    }
  }

  const campaignsWithNgoIds = uniqueCampaigns.map((campaign) => {
    const ngoId = ngoIdByName.get(campaign.ngo_name || "Unknown NGO")
    return {
      ...campaign,
      ngo_id: ngoId ?? null,
    }
  })

  const { error: upsertError } = await supabaseServer
    .from("campaigns")
    .upsert(campaignsWithNgoIds, { onConflict: "external_id" })

  if (upsertError) {
    errors.push(`Upsert failed: ${upsertError.message}`)
  }

  return {
    ok: errors.length === 0,
    source: "globalgiving",
    fetched: uniqueCampaigns.length,
    inserted,
    updated,
    errors,
  }
}

function authorizeRequest(request: Request): boolean {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    return true
  }

  const authHeader = request.headers.get("authorization")
  return authHeader === `Bearer ${cronSecret}`
}

export async function GET(request: Request) {
  if (!authorizeRequest(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
  }

  const result = await runSync()
  console.log("[sync-campaigns]", JSON.stringify(result))

  return NextResponse.json(result, {
    status: result.ok ? 200 : 500,
  })
}

export async function POST(request: Request) {
  return GET(request)
}
