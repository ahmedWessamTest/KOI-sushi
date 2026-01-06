import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { WEB_SITE_BASE_URL } from "../../constants/WEB_SITE_BASE_UTL";
import { User } from "../../Interfaces/p-users/IUpdateUserResponse";
import { ISuperAdminResponse } from "./../../Interfaces/m-home/IHomeStatics";
import dayjs from "dayjs";

@Injectable({
  providedIn: "root",
})
export class HomeService {
  http = inject(HttpClient);


  getHomeStatics(first_date?: string, second_date?: string, single_date?: string,branch_id?:number): Observable<ISuperAdminResponse> {
    console.log("from service",branch_id);
    
    let userData = {} as User;
      userData = JSON.parse(localStorage.getItem("user")!);
    

    // Define the request body dynamically
    let requestBody: any = {};
    if (first_date && second_date) {
      requestBody = {
        first_date: dayjs(first_date).format("YYYY-MM-DD"),
        second_date: dayjs(second_date).format("YYYY-MM-DD"),
      };
    } else if (single_date) {
      requestBody = { single_date: dayjs(single_date).format("YYYY-MM-DD")};
    }
    if(branch_id ) {
      requestBody.branch_id = branch_id;
    }
    // Determine the endpoint
    const endpoint = `${WEB_SITE_BASE_URL}analytics`    
    return this.http.post<ISuperAdminResponse>(endpoint, requestBody);
  }
}
