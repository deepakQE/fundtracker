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

const SYNC_CATEGORIES = [
  "health",
  "education",
  "environment",
  "emergency",
  "children",
  "women",
  "animals",
  "water",
] as const

const GLOBAL_GIVING_HEADERS = { Accept: "application/json" }

function toNumber(value: unknown): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : Number.NaN
}

function computeTrendScore(campaign: Pick<Campaign, "amount" | "goal" | "created_at">): number {
  const now = Date.now()
  const createdAt = new Date(campaign.created_at).getTime()
  const daysOld = Math.max(1, (now - createdAt) / (1000 * 60 * 60 * 24))

  const progress = Math.min(calculateProgress(campaign.amount, campaign.goal), 100)
  
  // 40% funding speed (progress per day)
  const fundingSpeed = Math.min(100, (progress / daysOld) * 10)
  
  // 30% growth rate (amount raised per day)
  const growthRate = Math.min(100, Number.isFinite(campaign.amount) ? (campaign.amount / daysOld) / 10000 : 0)
  
  // 20% recency (newer campaigns score higher)
  const recency = Math.max(0, 100 - daysOld * 2)
  
  // 10% activity (total engagement)
  const activity = Math.min(100, Number.isFinite(campaign.amount) ? campaign.amount / 1000000 : 0)

  return fundingSpeed * 0.4 + growthRate * 0.3 + recency * 0.2 + activity * 0.1
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

function getCandidateUrls(apiKey: string, category: string): string[] {
  const encodedCategory = encodeURIComponent(category)
  return [
    `https://api.globalgiving.org/api/public/projectservice/themes/${encodedCategory}/projects/summary?api_key=${apiKey}`,
    `https://api.globalgiving.org/api/public/projectservice/search/projects/summary?api_key=${apiKey}&q=${encodedCategory}`,
    `https://api.globalgiving.org/api/public/projectservice/featured/projects/summary?api_key=${apiKey}&theme=${encodedCategory}`,
  ]
}

async function fetchProjectsForCategory(apiKey: string, category: string): Promise<GlobalGivingProject[]> {
  const candidates = getCandidateUrls(apiKey, category)

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
        return projects as GlobalGivingProject[]
      }
    } catch {
      continue
    }
  }

  return []
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

  const { error: upsertError } = await supabaseServer
    .from("campaigns")
    .upsert(uniqueCampaigns, { onConflict: "external_id" })

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
