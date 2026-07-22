export interface IOrderById {
  success: boolean;
  order: Orderdetail;
}

export interface Orderdetail {
  id: number;
  user_id: number;
  branch_id: number;
  address_id: number;
  promo_code_id: any;
  promo_code_discount: string;
  voucher_id: any;
  voucher_discount: string;
  loyalty_applied_points: number;
  loyalty_earned_points: number;
  loyalty_points_discount: number;
  happy_hours_discount: string;
  sub_total_price: string;
  delivery_fee: string;
  tax: string;
  tax_type?: string;
  tax_percentage: string;
  total_price: string;
  delivery_time_minutes: number;
  payment_method: string;
  payment_status?: string;
  payment_reference?: any;
  is_notified?: number;
  note: string;
  status: string;
  confirmed_by: any;
  created_at: string;
  updated_at: string;
  user: User;
  branch: Branch;
  address: Address;
  items: Item[];
  promo_code: any;
  voucher: any;
}

export interface Branch {
  title_en: string;
  id: number;
}

export interface Address {
  id: number;
  user_id: number;
  region_id: number;
  type: string;
  address: string;
  phone_primary: string;
  phone_secondary: string | null;
  note: string | null;
  status: boolean;
  created_at: string;
  updated_at: string;
  floor: string;
  apartment: string;
  region: Region;
}

export interface Category {
  id: number;
  title_en: string;
}

export interface Product {
  id: number;
  title_en: string;
  main_image: string;
  category_id?: number;
  has_options: boolean;
  is_recommended: boolean;
  price?: string;
  category?: Category;
}

export interface Region {
  id: number;
  title_en: string;
  delivery_fee: string;
  governorate_id?: number;
  governorate: Governorate;
}

export interface Governorate {
  id: number;
  title_en: string;
}

export interface ComboOfferable {
  id: number;
  title_ar: string;
  title_en: string;
  description_ar: string;
  description_en: string;
  bonus_percentage?: number;
  percentage?: string;
  image?: string;
  status?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ComboDetail {
  id: number;
  title_en: string;
  pieces: number;
  price: string;
}

export interface ComboOffer {
  id: number;
  offerable_type: string;
  offerable_id: number;
  combo_id: number;
  created_at?: string;
  updated_at?: string;
  combo?: ComboDetail;
  offerable?: ComboOfferable;
}

export interface Item {
  id: number;
  order_id: number;
  product_id: number;
  product_option_id: any;
  combo_offer_id: any;
  combo_group_id: any;
  price: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  product: Product;
  product_option: any;
  combo_offer: ComboOffer | null;
}

export interface Order {
  id: number;
  user_id: number;
  branch_id: number;
  address_id: number;
  address: Address;
  address_information: null;
  location_id: null;
  location_title: null;
  sub_location_id: number;
  promo_code_value: number;
  taxes_money: number;
  sub_location_title: string;
  total_price: number;
  taxes_value: number;
  delivry_value: number;
  zi_points_discount: string;
  happy_hours_discount: string;
  zi_applied_points: number;
  service_value: number;
  service_money: number;
  sub_total: number;
  confirmed_by_user: number;
  status: string;
  combo_id: number;
  combo_value: number;
  combo_name: null;
  promo_code_id: number;
  order_date: string;
  order_time: null;
  created_at: string;
  updated_at: string;
  date: string;
  time: string;
  user: User;
  sublocationinfo: Sublocationinfo;
  addressinfo: Addressinfo;
  promo: Promo;
  note_text?: string;
}

export interface Promo {
  id: number;
  code: string;
  percentage: number;
  status: number;
  counter_use: number;
  created_at: string;
  updated_at: string;
}

export interface Addressinfo {
  id: number;
  user_id: number;
  location_id: number;
  sub_location_id: number;
  phone: null;
  address_type: null;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface Sublocationinfo {
  id: number;
  en_sub_location: string;
  ar_sub_location: string;
  location_id: number;
  price: number;
  branch_id: number;
  status: number;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
}
