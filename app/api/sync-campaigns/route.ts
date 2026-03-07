import { NextResponse } from "next/server"
import type { Campaign } from "@/types/campaign"
import { getSupabaseServerClient } from "@/lib/supabaseServer"
import { appendReferralCode } from "@/lib/referral"
import { calculateProgress } from "@/lib/currency"

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

const GLOBAL_GIVING_HEADERS = { Accept: "application/json" }
const PROJECTS_PER_PAGE = 100
const MAX_PAGES_PER_SYNC = 5

function toNumber(value: unknown): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function computeTrendScore(campaign: Pick<Campaign, "amount" | "goal" | "created_at">): number {
  const now = Date.now()
  const createdAt = new Date(campaign.created_at).getTime()
  const daysOld = Math.max(1, (now - createdAt) / (1000 * 60 * 60 * 24))

  const progress = Math.min(calculateProgress(campaign.amount, campaign.goal), 100)
  const donationProgress = Math.min(100, progress)
  const growthRate = Math.min(100, Number.isFinite(campaign.amount) ? (campaign.amount / daysOld) / 10000 : 0)
  const recency = Math.max(0, 100 - daysOld * 2)
  const engagement = Math.min(100, Number.isFinite(campaign.amount) ? Math.sqrt(campaign.amount) / 20 : 0)

  return donationProgress * 0.4 + growthRate * 0.3 + recency * 0.2 + engagement * 0.1
}

function normalizeGlobalGivingCampaign(project: GlobalGivingProject): Campaign {
  const id = String(project.id)
  const funding = toNumber(project.funding)
  const goal = toNumber(project.goal)
  const createdAt = project.activeDate && !Number.isNaN(new Date(project.activeDate).getTime())
    ? new Date(project.activeDate).toISOString()
    : new Date().toISOString()

  const image_url =
    project.image?.big ||
    project.image?.medium ||
    project.image?.imagelink ||
    project.imageLink ||
    null

  const normalized: Campaign = {
    id: `gg-${id}`,
    external_id: id,
    title: project.title || "Untitled Campaign",
    description: project.summary || "",
    goal,
    amount: funding,
    image: image_url || undefined,
    url: appendReferralCode(project.projectLink),
    platform: "GlobalGiving",
    ngo_name: project.organization?.name || project.organizationName || "Unknown NGO",
    category: project.themeName || "General",
    created_at: createdAt,
    trend_score: 0,
  }

  normalized.trend_score = computeTrendScore(normalized)
  return normalized
}

function buildNgoDescription(ngoName: string): string {
  return `${ngoName} runs impact campaigns listed on FundTracker.`
}

async function fetchProjectsPage(apiKey: string, page: number): Promise<GlobalGivingProject[]> {
  const url = `https://api.globalgiving.org/api/public/projectservice/all/projects/active?api_key=${apiKey}&pageNumber=${page}&projectsPerPage=${PROJECTS_PER_PAGE}`
  const response = await fetch(url, {
    headers: GLOBAL_GIVING_HEADERS,
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(`GlobalGiving API page ${page} failed: ${response.status}`)
  }

  const payload = await response.json()
  const projects = payload?.projects?.project
  return Array.isArray(projects) ? (projects as GlobalGivingProject[]) : []
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

  const allProjects: GlobalGivingProject[] = []

  for (let page = 1; page <= MAX_PAGES_PER_SYNC; page++) {
    try {
      const pageProjects = await fetchProjectsPage(apiKey, page)
      if (pageProjects.length === 0) {
        break
      }

      allProjects.push(...pageProjects)

      if (pageProjects.length < PROJECTS_PER_PAGE) {
        break
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Unknown error fetching page ${page}`
      errors.push(errorMessage)
      break
    }

    // Rate limiting between page requests
    await new Promise((r) => setTimeout(r, 500))
  }

  if (allProjects.length === 0) {
    // Fallback keeps cron more resilient if active endpoint is temporarily empty.
    try {
      const fallbackUrl = `https://api.globalgiving.org/api/public/projectservice/featured/projects/summary?api_key=${apiKey}`
      const response = await fetch(fallbackUrl, {
        headers: GLOBAL_GIVING_HEADERS,
        cache: "no-store",
      })

      if (response.ok) {
        const payload = await response.json()
        const fallbackProjects = payload?.projects?.project
        if (Array.isArray(fallbackProjects)) {
          allProjects.push(...(fallbackProjects as GlobalGivingProject[]))
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch fallback featured projects"
      errors.push(errorMessage)
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
  }

  const normalizedCampaigns = allProjects.map((project) => normalizeGlobalGivingCampaign(project))
  const uniqueCampaigns = normalizedCampaigns.filter((campaign, index, arr) => {
    return arr.findIndex((item) => item.external_id === campaign.external_id) === index
  })

  const campaignIds = uniqueCampaigns.map((campaign) => campaign.id)

  const { data: existingRows, error: existingError } = await supabaseServer
    .from("campaigns")
    .select("id")
    .in("id", campaignIds)

  if (existingError) {
    errors.push(`Failed to read existing campaign ids: ${existingError.message}`)
  }

  const existingIdSet = new Set((existingRows || []).map((row) => row.id as string))
  const inserted = uniqueCampaigns.filter((campaign) => !existingIdSet.has(campaign.id)).length
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
    .upsert(campaignsWithNgoIds, { onConflict: "id" })

  if (upsertError) {
    errors.push(`Upsert failed: ${upsertError.message}`)
  }

  console.log({
    fetched: uniqueCampaigns.length,
    inserted,
    updated,
  })

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
