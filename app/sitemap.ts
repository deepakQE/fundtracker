import { supabase } from "@/lib/supabase"

export default async function sitemap() {
  const { data } = await supabase
    .from("campaigns")
    .select("id")

  const baseUrl = "https://fundtracker-laal.vercel.app // change after deploy

  const campaignUrls =
    data?.map((c) => ({
      url: `${baseUrl}/campaign/${c.id}`,
      lastModified: new Date(),
    })) ?? []

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
    },
    ...campaignUrls,
  ]
}