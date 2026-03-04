import { NextResponse } from "next/server"
import type { Campaign } from "@/types/campaign"
import { calculateProgress } from "@/lib/currency"
import { getSupabaseServerClient } from "@/lib/supabaseServer"

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

function toNumber(value: unknown): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : Number.NaN
}

function computeTrendScore(campaign: Pick<Campaign, "amount" | "goal" | "created_at">): number {
  const now = Date.now()
  const createdAt = new Date(campaign.created_at).getTime()
  const daysOld = Math.max(1, (now - createdAt) / (1000 * 60 * 60 * 24))

  const progress = Math.min(calculateProgress(campaign.amount, campaign.goal), 100)
  const donationVelocity = Math.min(100, Number.isFinite(campaign.amount) ? campaign.amount / daysOld / 10000 : 0)
  const recency = Math.max(0, 100 - daysOld * 2)
  const activity = Math.min(100, Number.isFinite(campaign.amount) ? campaign.amount / 1000000 : 0)

  return progress * 0.4 + donationVelocity * 0.3 + recency * 0.2 + activity * 0.1
}

function normalizeGlobalGivingCampaign(project: GlobalGivingProject): Campaign {
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
    category: project.themeName || "General",
    description: project.summary || "",
    image:
      project.image?.big ||
      project.image?.medium ||
      project.image?.imagelink ||
      project.imageLink ||
      `https://www.globalgiving.org/pfil/${id}/pict_large.jpg`,
    created_at: createdAt,
    url: project.projectLink || undefined,
    ngo_name: project.organization?.name || project.organizationName || "Unknown NGO",
    trend_score: 0,
  }

  normalized.trend_score = computeTrendScore(normalized)
  return normalized
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

  let response: Response
  try {
    response = await fetch(
      `https://api.globalgiving.org/api/public/projectservice/featured/projects/summary?api_key=${apiKey}`,
      {
        headers: { Accept: "application/json" },
        cache: "no-store",
      }
    )
  } catch (error) {
    return {
      ok: false,
      source: "globalgiving",
      fetched: 0,
      inserted: 0,
      updated: 0,
      errors: [error instanceof Error ? error.message : "Failed to connect to GlobalGiving API"],
    }
  }

  if (!response.ok) {
    return {
      ok: false,
      source: "globalgiving",
      fetched: 0,
      inserted: 0,
      updated: 0,
      errors: [`GlobalGiving API returned ${response.status}`],
    }
  }

  const payload = await response.json()
  const projects: GlobalGivingProject[] = payload?.projects?.project || []

  const normalizedCampaigns = projects.map(normalizeGlobalGivingCampaign)
  const uniqueCampaigns = normalizedCampaigns.filter((campaign, index, arr) => {
    return arr.findIndex((item) => item.id === campaign.id) === index
  })

  const ids = uniqueCampaigns.map((campaign) => campaign.id)

  const { data: existingRows, error: existingError } = await supabaseServer
    .from("campaigns")
    .select("id")
    .in("id", ids)

  if (existingError) {
    errors.push(`Failed to read existing campaign ids: ${existingError.message}`)
  }

  const existingIdSet = new Set((existingRows || []).map((row) => row.id))
  const inserted = uniqueCampaigns.filter((campaign) => !existingIdSet.has(campaign.id)).length
  const updated = uniqueCampaigns.length - inserted

  const { error: upsertError } = await supabaseServer
    .from("campaigns")
    .upsert(uniqueCampaigns, { onConflict: "id" })

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
