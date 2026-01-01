export interface IActiveUsers {
  status: string
  data: Data
}

export interface Data {
  current_page: number
  data: ActiveUser[]
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

export interface ActiveUser {
  id: number
  name: string
  email: string
  phone: string
  login_type: string
  is_verified: boolean
  is_active: boolean
  is_deleted: boolean
  status: boolean
  created_at: string
}

export interface Link {
  url?: string
  label: string
  page?: number
  active: boolean
}

