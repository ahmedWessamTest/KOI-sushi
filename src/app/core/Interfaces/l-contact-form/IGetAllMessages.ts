export interface IGetAllMessages {
  current_page: number
  data: EmailsData[]
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

export interface EmailsData {
  id: number
  name: string
  email: string
  phone: string
  message: string
  created_at: string
  updated_at: string
}
interface Link {
  url?: string
  label: string
  page?: number
  active: boolean
}