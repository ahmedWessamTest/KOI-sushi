import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IAllCombos } from '../../Interfaces/d-combos/iall-combos';
import { WEB_SITE_BASE_URL } from '../../constants/WEB_SITE_BASE_UTL';

@Injectable({
  providedIn: 'root'
})
export class CombosService {
    constructor(private http: HttpClient) { }
    getAllCombos() {
    return this.http.get<IAllCombos>(`${WEB_SITE_BASE_URL}combos`);
  }

  enableCombo(id: string) {
    return this.http.post(`${WEB_SITE_BASE_URL}combos/${id}/toggle`,{});
  }

  disableCombo(id: string) {
    return this.http.post(`${WEB_SITE_BASE_URL}combos/${id}/toggle`,{});
  }
  addCombo(comboData: any) {
    return this.http.post(`${WEB_SITE_BASE_URL}combos/create`, comboData);
  }
  updateCombo(id: string, comboData: any) {
    return this.http.post(`${WEB_SITE_BASE_URL}combos/${id}`, comboData);
  }

  getComboById(id: string) {
    return this.http.get(`${WEB_SITE_BASE_URL}combos/${id}`);
  }
}
