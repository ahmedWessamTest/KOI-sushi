import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { WEB_SITE_BASE_URL } from '../../constants/WEB_SITE_BASE_UTL';

@Injectable({
  providedIn: 'root',
})
export class DiscountOfferService {
  constructor(private http: HttpClient) {}

  getDiscountOffer() {
    return this.http.get(`${WEB_SITE_BASE_URL}discounts`);
  }

  updateDiscountOffer(data: any) {
    return this.http.post(`${WEB_SITE_BASE_URL}discounts`, data);
  }
}
