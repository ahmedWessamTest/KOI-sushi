export interface IGetAllTutorials {
  success: boolean
  data: tutorialData[]
}

export interface tutorialData {
  id: number
  title_ar: string
  title_en: string
  description_ar: string
  description_en: string
  image: string
  status: boolean
}
