export interface IAllCategory {
  success: boolean;
  categories: Categories;
}

export interface Categories {
  current_page: number;
  data: categoryData[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  next_page_url: string;
  path: string;
  per_page: number;
  prev_page_url: null;
  to: number;
  total: number;
}

export interface categoryData {
  id: number;
  title_ar: string;
  title_en: string;
  state: number;
  created_at: string;
  updated_at: string;
}
