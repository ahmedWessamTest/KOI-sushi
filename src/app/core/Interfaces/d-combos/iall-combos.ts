export interface IAllCombos {
  success: boolean
  data: ICombosData[]
}

export interface ICombosData {
  id: number;
  status: boolean;
  title_ar: string;
  title_en: string;
  pieces: number;
  price: string;
  products: Product[];
  combo_categories: ComboCategory[];
}

 interface Product {
  id: number
  category_id: number
  title_ar: string
  title_en: string
  description_ar: string
  description_en: string
  price: string
  main_image: string
  total_orders: number
  status: boolean
  created_at: string
  updated_at: string
  has_options: boolean
  is_recommended: boolean
  pivot: Pivot
}

 interface Pivot {
  combo_id: number
  product_id: number
}

 interface ComboCategory {
  id: number
  combo_id: number
  category_id: number
  limit: any
  status: boolean
  created_at: string
  updated_at: string
  combo_category_excludes: ComboCategoryExclude[]
}

 interface ComboCategoryExclude {
  id: number
  combo_category_id: number
  product_id: number
  status: boolean
  created_at: string
  updated_at: string
}
