import { ActiveUser } from "./activeUser"

export interface IPromoCode {
  success: boolean
  promo_code: PromoCode
}

export interface PromoCode {
  id: number
  code: string
  type: string
  value: number
  use: string
  apply: string
  min_amount: number
  expiration_date: string
  status: boolean
  created_at: string
  updated_at: string
  users: User[]
  promo_code_categories: PromoCodeCategory[]
}

export interface User {
  id: number
  name: string
  email: string
  phone: string
  login_type: string
  email_verified_at: string
  is_verified: boolean
  status: boolean
  is_active: boolean
  is_deleted: boolean
  deleted_at: any
  created_at: string
  updated_at: string
  pivot: Pivot
}

export interface Pivot {
  promo_code_id: number
  user_id: number
  used_count: number
}

export interface PromoCodeCategory {
  id: number
  promo_code_id: number
  category_id: number
  status: boolean
  created_at: string
  updated_at: string
  promo_code_category_excludes: PromoCodeCategoryExclude[]
}

export interface PromoCodeCategoryExclude {
  id: number
  promo_code_category_id: number
  product_id: number
  status: boolean
  created_at: string
  updated_at: string
}

