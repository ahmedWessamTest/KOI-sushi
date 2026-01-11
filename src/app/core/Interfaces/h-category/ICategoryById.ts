export interface ICategoryById {
  success: boolean
  data: Category
}

export interface Category {
  id: number
  title_ar: string
  title_en: string
  image: string
  status: boolean
  created_at: string
  updated_at: string
}
