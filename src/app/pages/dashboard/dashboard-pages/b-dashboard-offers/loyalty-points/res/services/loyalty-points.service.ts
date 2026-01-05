import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { WEB_SITE_BASE_URL } from '../../../../../../../core/constants/WEB_SITE_BASE_UTL';
import { Observable } from 'rxjs';
import { ILoyaltyPoint } from '../model/iloyalty-point';

@Injectable({
  providedIn: 'root'
})
export class LoyaltyPointsService {
 private readonly http = inject(HttpClient);
 getLoyaltyPointsData():Observable<ILoyaltyPoint> {
  return this.http.get<ILoyaltyPoint>(`${WEB_SITE_BASE_URL}loyalty-point-setting`)
 }

   updateLoyaltyPoints(data:any):Observable<any> {
    return this.http.post(`${WEB_SITE_BASE_URL}loyalty-point-setting/update`,data);
   }
}
