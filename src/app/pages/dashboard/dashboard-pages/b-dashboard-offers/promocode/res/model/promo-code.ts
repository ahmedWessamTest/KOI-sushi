import { ActiveUser } from "./activeUser"

export interface IPromoCode {
  success: boolean
  promo_code: PromoCode
}

export interface PromoCode {
  id?: number
  code: string
  type: string
  value: number
  use: number
  apply: number
  min_amount: number
  expiration_date: string
  status: boolean
  created_at?: string
  updated_at?: string
  users: ActiveUser[]
}

