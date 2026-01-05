import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IHappyHour, IHappyHoursResponse, IHappyHoursDetails } from '../../Interfaces/c-happy-hours/ihappy-hours';
import { WEB_SITE_BASE_URL } from '../../constants/WEB_SITE_BASE_UTL';

@Injectable({
  providedIn: 'root'
})
export class HappyHoursService {
  constructor(private http: HttpClient) { }
  getHappyHours():Observable<IHappyHoursResponse> {
    return this.http.get<IHappyHoursResponse>(`${WEB_SITE_BASE_URL}happy-hour`);
  }
  toggleHappyHoursStatus(id:number):Observable<IHappyHoursDetails> {
    return this.http.post<IHappyHoursDetails>(`${WEB_SITE_BASE_URL}happy-hour/${id}/toggle`,{});
  }
  getHappyHoursById(id:string):Observable<IHappyHoursDetails>{
    return this.http.get<IHappyHoursDetails>(`${WEB_SITE_BASE_URL}happy-hour/${id}`);
  }
  updateHappyHoursById(data:any,id:number|null):Observable<any>{
    return this.http.post<any>(`${WEB_SITE_BASE_URL}happy-hour/${id}`,data);
  }
}
