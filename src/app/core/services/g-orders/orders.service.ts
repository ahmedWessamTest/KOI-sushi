import { HttpClient } from "@angular/common/http";
import { Injectable, signal } from "@angular/core";
import { WEB_SITE_BASE_URL } from "../../constants/WEB_SITE_BASE_UTL";
import { IAllOrders } from "../../Interfaces/g-orders/IAllOrders";
import { IOrderById } from "../../Interfaces/g-orders/IOrderById";
import { ICurrentOrdered } from "../../Interfaces/g-orders/ICurrentOrdered";
import { IUpdateOrderStatus } from "../../Interfaces/g-orders/IUpdateOrderStatus";
import dayjs from "dayjs";

@Injectable({
  providedIn: "root",
})
export class OrdersService {
  currentOrdersCount = signal(0);

  constructor(private http: HttpClient) {}


  orderStatus = ["placed", "confirmed", "on the way", "delivered", "cancelled"];

  getAllOrders(page: number = 1, limit: number = 10,date_from?:string,date_to?:string) {
    let requestBody: any = {limit,page};
        if (date_from && date_to) {
          requestBody = {...requestBody,
            date_from: dayjs(date_from).format("YYYY-MM-DD"),
            date_to: dayjs(date_to).format("YYYY-MM-DD"),
          };
        }
    return this.http.post<IAllOrders>(`${WEB_SITE_BASE_URL}orders`, requestBody);
  }
  getCurrentOrders(userId: string = "all") {
      if (JSON.parse(localStorage.getItem("user")!).branch_id) {
        userId = JSON.parse(localStorage.getItem("user")!).branch_id;
      }
    if (userId !== "all") {
      return this.http.get<ICurrentOrdered>(`${WEB_SITE_BASE_URL}checkavail/${userId}`);
    } else {
      return this.http.get<ICurrentOrdered>(`${WEB_SITE_BASE_URL}checkavail/${userId}`);
    }
  }
  getOrderById(orderId: string) {
    return this.http.get<IOrderById>(`${WEB_SITE_BASE_URL}orders/${orderId}`);
  }

  updateOrderStatus(orderId: string, orderStatus: string, isStatus: boolean) {
    return this.http.post<IUpdateOrderStatus>(`${WEB_SITE_BASE_URL}orders/${orderId}/status`, {
      status: isStatus ? orderStatus : "canceled",
    });
  }

  getNewOrders() {
    return this.http.get(`${WEB_SITE_BASE_URL}checkavail/1`);
  }
}
