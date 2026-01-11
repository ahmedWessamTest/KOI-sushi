export interface IGetAllUsers {
  status: string
  data: Rows
}

export interface Rows {
  current_page: number
  data: usersData[]
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

export interface usersData {
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
 interface Link {
  url?: string
  label: string
  page?: number
  active: boolean
}