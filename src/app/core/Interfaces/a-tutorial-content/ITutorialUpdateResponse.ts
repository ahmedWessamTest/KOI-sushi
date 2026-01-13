export interface ITutorialUpdateResponse {
  success: boolean
  data: ToutrialContent
}

export interface ToutrialContent {
  id: number
  title_ar: string
  title_en: string
  description_ar: string
  description_en: string
  image: string
  status: boolean
  created_at: string
  updated_at: string
}
