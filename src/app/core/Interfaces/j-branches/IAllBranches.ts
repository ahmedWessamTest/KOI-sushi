export interface IAllBranches {
  success: boolean
  data: Branches[]
}

export interface Branches {
  id: number
  title_ar: string
  title_en: string
  status: boolean
  regions: any[]
}

export interface BranchesData {
  id: number;
  en_branch_location: string;
  ar_branch_location: string;
  en_branch_city: string;
  ar_branch_city: string;
  en_branch_address: string;
  ar_branch_address: string;
  branch_phone_1: string;
  branch_phone_2: string;
  branch_phone_3: null;
  status: number;
  created_at: string;
  updated_at: string;
}
