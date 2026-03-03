export interface Campaign {
  id: string
  title: string
  platform: string
  amount: number
  goal: number
  category: string
  image?: string
  description?: string
  created_at: string
}