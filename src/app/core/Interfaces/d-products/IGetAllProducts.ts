export interface IGetAllProducts {
  current_page: number
  data: productsData[]
  first_page_url: string
  from: number
  last_page: number
  last_page_url: string
  links: Link[]
  next_page_url: string
  path: string
  per_page: number
  prev_page_url: any
  to: number
  total: number
}

export interface productsData {
  id: number
  category_id: number
  title_ar: string
  title_en: string
  price: string
  main_image: string
  total_orders: number
  status: boolean
}

export interface Link {
  url?: string
  label: string
  page?: number
  active: boolean
}
