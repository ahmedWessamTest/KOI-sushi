import { GovernoratesData } from "../e-sublocations/IGetSubLocationsBranches"

export interface IBranchById {
  success: boolean
  data: Branches
}

export interface Branches {
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
  regions: Region[];
  governorate:GovernoratesData;
  disable_ar: string
  disable_en: string;
  location_url:string
}
 interface Region {
  id: number
  governorate_id: number
  branch_id: number
  title_ar: string
  title_en: string
  delivery_fee: string
  status: boolean
  created_at: string
  updated_at: string
}