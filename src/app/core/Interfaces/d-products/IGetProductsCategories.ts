export interface IGetProductsCategories {
  success: boolean
  categories: Categories
}

export interface Categories {
  current_page: number
  data: Category[]
  first_page_url: string
  from: number
  last_page: number
  last_page_url: string
  links: Link[]
  next_page_url: any
  path: string
  per_page: number
  prev_page_url: any
  to: number
  total: number
}

export interface Category {
  id: number
  title_ar: string
  title_en: string
  image: string
  status: boolean
}

export interface Link {
  url?: string
  label: string
  page?: number
  active: boolean
}

