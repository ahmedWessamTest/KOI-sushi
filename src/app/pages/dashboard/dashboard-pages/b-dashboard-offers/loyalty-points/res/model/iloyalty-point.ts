export interface ILoyaltyPoint {
  success: boolean
  loyalty_point_setting: LoyaltyPointSetting
}

export interface LoyaltyPointSetting {
  id: number
  point_value: string
  spend_cap: number
  earn_cap: number;
  spend_percentage:number
  status: boolean
  created_at: string
  updated_at: string
  loyalty_point_categories: LoyaltyPointCategory[]
}

export interface LoyaltyPointCategory {
  id: number
  category_id: number
  status: boolean
  created_at: string
  updated_at: string
  loyalty_point_category_excludes: any[]
}

