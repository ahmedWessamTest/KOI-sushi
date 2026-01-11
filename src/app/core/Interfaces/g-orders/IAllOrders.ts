export interface IAllOrders {
  success: boolean
  orders: Orders
}

export interface Orders {
  current_page: number
  data: OrderData[]
  first_page_url: string
  from: any
  last_page: number
  last_page_url: string
  links: Link[]
  next_page_url: any
  path: string
  per_page: number
  prev_page_url: any
  to: any
  total: number
}
export interface Link {
  url?: string
  label: string
  page?: number
  active: boolean
}
export interface OrderData {
   id: number
  user_id: number
  branch_id: number
  address_id: number
  sub_total_price: string
  delivery_fee: string
  tax: string
  total_price: string
  status: string
  payment_method: string
  created_at: string
  updated_at: string
  user: User
  branch: Branch
  address: Address
}

export interface User {
  id: number
  name: string
  email: string
  phone: string
}
export interface Branch {
  id: number
  title_ar: string
  title_en: string
}

export interface Address {
  id: number
  type: string
  address: string
  phone_primary: string
}