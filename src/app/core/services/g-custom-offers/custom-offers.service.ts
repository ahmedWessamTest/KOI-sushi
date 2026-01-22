import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { WEB_SITE_BASE_URL } from '../../constants/WEB_SITE_BASE_UTL';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CustomOffersService {
  constructor(private http: HttpClient) {}

  getAllCustomOffers(): Observable<any> {
    return this.http.get(`${WEB_SITE_BASE_URL}custom-offers`);
  }

  getCustomOfferById(id: string): Observable<any> {
    return this.http.get(`${WEB_SITE_BASE_URL}custom-offers/${id}`);
  }

  addCustomOffer(data: FormData): Observable<any> {
    return this.http.post(`${WEB_SITE_BASE_URL}custom-offers`, data);
  }

  updateCustomOffer(id: string, data: FormData): Observable<any> {
    return this.http.post(`${WEB_SITE_BASE_URL}custom-offers/${id}`, data);
  }

  toggleCustomOfferStatus(id: string): Observable<any> {
    return this.http.post(`${WEB_SITE_BASE_URL}custom-offers/${id}/toggle`, {});
  }
}
