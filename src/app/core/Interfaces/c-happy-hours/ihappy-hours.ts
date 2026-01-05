export interface IHappyHoursResponse {
  success: boolean
  happy_hours: IHappyHour[]
}

export interface IHappyHour {
  id: number
  day: string
  start_time: string
  end_time: string
  discount_percentage: number
  status: boolean
  created_at: string
  updated_at: string
}
export interface IHappyHoursDetails {
  success: boolean
  happy_hour: HappyHour
}

export interface HappyHour {
  id: number
  day: string
  start_time: string
  end_time: string
  discount_percentage: number
  status: boolean
  created_at: string
  updated_at: string
  happy_hour_categories: HappyHourCategory[]
}

export interface HappyHourCategory {
  id: number
  happy_hour_id: number
  category_id: number
  status: boolean
  created_at: string
  updated_at: string
  happy_hour_category_excludes: any[]
}
