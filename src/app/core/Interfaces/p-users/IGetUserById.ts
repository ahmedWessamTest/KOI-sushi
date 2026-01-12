export interface IGetUserById {
  status: string
  data: UserData
}

export interface UserData {
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
}

export interface IUSerAddress {
  id: number
  user_id: number
  region_id: number
  type: string
  address: string
  phone_primary: string
  phone_secondary: string
  note: string
  status: boolean
  created_at: string
  updated_at: string
  floor: any
  apartment: any
  region: Region
}
export interface Region {
  id: number
  governorate_id: number
  branch_id: number
  title_ar: string
  title_en: string
  delivery_fee: string
  status: boolean
  created_at: string
  updated_at: string
  governorate: Governorate
}
export interface Governorate {
  id: number
  title_ar: string
  title_en: string
  status: boolean
  created_at: string
  updated_at: string
}
export interface IUserOrders {
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
}
