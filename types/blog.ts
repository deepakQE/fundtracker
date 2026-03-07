export type BlogPost = {
  id: string
  title: string
  slug: string
  content: string
  seo_title: string
  seo_description: string
  created_at: string
}

export type GuidePage = {
  slug: string
  title: string
  description: string
  content: string[]
}
