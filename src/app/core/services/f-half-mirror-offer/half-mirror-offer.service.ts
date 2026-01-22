import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { WEB_SITE_BASE_URL } from '../../constants/WEB_SITE_BASE_UTL';

@Injectable({
  providedIn: 'root',
})
export class HalfMirrorOfferService {
  constructor(private http: HttpClient) {}

  getMirrorOffer() {
    return this.http.get(`${WEB_SITE_BASE_URL}mirror-offer`);
  }

  updateMirrorOffer(data: any) {
    return this.http.post(`${WEB_SITE_BASE_URL}mirror-offer`, data);
  }
}
