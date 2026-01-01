export interface IAllPromoCodes {
  success: boolean
  promo_codes: PromoCodes
}

export interface PromoCodes {
  current_page: number
  data: Daum[]
  first_page_url: string
  from: number
  last_page: number
  last_page_url: string
  links: Link[]
  next_page_url: any
  path: string
  per_page: number
  prev_page_url: any
  to: number
  total: number
}

export interface Daum {
  id: number
  code: string
  type: string
  value: number
  use: number
  apply: number
  min_amount: number
  expiration_date: string
  status: boolean
  created_at: string
  updated_at: string
}

export interface Link {
  url?: string
  label: string
  page?: number
  active: boolean
}

// export interface PromoCodes {
//   current_page: number;
//   data: Daum[];
//   first_page_url: string;
//   from: number;
//   last_page: number;
//   last_page_url: string;
//   next_page_url: any;
//   path: string;
//   per_page: string;
//   prev_page_url: any;
//   to: number;
//   total: number;
// }

// export interface Daum {
//   id: number;
//   code: string;
//   expiration_date: any;
//   percentage: number;
//   status: number;
//   counter_use: any;
//   created_at: string;
//   updated_at: string;
//   type: string;
//   use: string;
//   limit: any;
//   min_amount: number;
//   value: number;
//   apply: string;
// }
