export interface ICurrentOrdered {
  success: boolean
  orders: NewOrders[]
}

export interface NewOrders {
  id: number
  user_id: number
  branch_id: number
  address_id: number
  promo_code_id?: number
  promo_code_discount: string
  voucher_id?: number
  voucher_discount: string
  loyalty_applied_points: number
  loyalty_earned_points: number
  loyalty_points_discount: number
  happy_hours_discount: string
  sub_total_price: string
  delivery_fee: string
  tax: string
  total_price: string
  delivery_time_minutes: number
  payment_method: string
  note?: string
  status: string
  is_notified: number
  confirmed_by?: number
  created_at: string
  updated_at: string
  user?: User
  branch?: Branch
}
interface Branch {
  id: number
  title_ar: string
  title_en: string
}
export interface User {
 id: number
  name: string
}
