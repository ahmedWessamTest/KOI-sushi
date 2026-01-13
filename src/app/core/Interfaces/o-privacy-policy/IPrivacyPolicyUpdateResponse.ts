export interface IPrivacyPolicyUpdateResponse {
  success: boolean
  privacy_policy: PrivacyPolicy
}

export interface PrivacyPolicy {
  id: number
  title_ar: string
  title_en: string
  description_ar: string
  description_en: string
  created_at: string
  updated_at: string
}
