export interface IGetSubLocationsBranches {
  success: boolean
  data: ILocationData
}
export interface ILocationData {
  current_page: number
  data: ILocation[]
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
export interface Link {
  url?: string
  label: string
  page?: number
  active: boolean
}
export interface IBranch {
  id: number
  title_ar: string
  title_en: string
  address_ar: string
  address_en: string
  phone_primary: string
  phone_secondary: any
  phone_tertiary: any
  opening_time: string
  closing_time: string
  status: boolean
  created_at: string
  updated_at: string
  light_map: string
  dark_map: string
}

export interface ILocation {
  id: number
  delivery_fee:string
  title_ar: string
  title_en: string
  status: boolean
  branch_id: number
  branch: IBranch
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
export interface IGetGovernorates {
  success: boolean
  data: GovernoratesData[]
}

export interface GovernoratesData {
  id: number
  title_ar: string
  title_en: string
  status: boolean
}