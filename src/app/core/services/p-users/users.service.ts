import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { WEB_SITE_BASE_URL } from "../../constants/WEB_SITE_BASE_UTL";
import { IGetAllUsers } from "../../Interfaces/p-users/IGetAllUsers";
import { IGetUserById } from "../../Interfaces/p-users/IGetUserById";
import { IUpdateUserBody } from "../../Interfaces/p-users/IUpdateUserBody";
import { IUpdateUserResponse } from "../../Interfaces/p-users/IUpdateUserResponse";

@Injectable({
  providedIn: "root",
})
export class UsersService {
  constructor(private http: HttpClient) {}

  getAllUsers(page: number = 1, perPage: number = 10) {
    return this.http.get<IGetAllUsers>(`${WEB_SITE_BASE_URL}users?page=${page}&limit=${perPage}`);
  }
  getUserAddress(id: string) {
    return this.http.get<any>(`${WEB_SITE_BASE_URL}users/${id}/addresses`);
  }
  getUserOrders(id: string) {
    return this.http.get<any>(`${WEB_SITE_BASE_URL}users/${id}/orders`);
  }

  getUserById(userId: string) {
    return this.http.get<IGetUserById>(`${WEB_SITE_BASE_URL}users/${userId}`);
  }

  toggleUserStatus(userId: string) {
    return this.http.post<IUpdateUserResponse>(`${WEB_SITE_BASE_URL}users/${userId}/toggle`,{});
  }

  enableSelectedUsers(userData: {}) {
    return this.http.post<any>(`${WEB_SITE_BASE_URL}users/toggle-multiple`, userData);
  }

  disableSelectedUsers(userData: {}) {
    return this.http.post<any>(`${WEB_SITE_BASE_URL}users/toggle-multiple`, userData);
  }
}
