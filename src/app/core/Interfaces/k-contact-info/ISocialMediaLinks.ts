export interface ISocialMediaLinks {
  success: boolean
  message: string
  data: Rows
}

export interface Rows {
  id: number
  twitter: string
  snapchat: string
  instagram: string
  whatsapp: string
  tiktok: string
  facebook: string
  linkedin: string
  email: string
  created_at: string
  updated_at: string
}
