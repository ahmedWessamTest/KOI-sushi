export interface ISuperAdminResponse {
  totalOrders: number
  totalDelivered: number
  totalCancelled: number
  totalOrdersMoney: string
  totalDeliveredMoney: string
  totalCancelledMoney: string
  branches: Branch[]
  usersTotal: number
  categoriesTotal: number
  productsTotal: number
}

export interface Branch {
  id: number
  title_ar: string
  title_en: string
  total_orders: number
  total_orders_money: string
  delivered_orders: number
  delivered_orders_money: string
  cancelled_orders: number
  cancelled_orders_money: string
}
