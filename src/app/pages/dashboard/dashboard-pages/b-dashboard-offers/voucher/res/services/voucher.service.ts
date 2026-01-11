import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IActiveUsers } from '../model/activeUser';
import { IAddVoucher } from '../model/reqVoucher';
import { IVoucher } from '../model/voucher';
import { IVouchers } from '../model/vouchers';
import { WEB_SITE_BASE_URL } from '../../../../../../../core/constants/WEB_SITE_BASE_UTL';

@Injectable({
  providedIn: 'root',
})
export class VoucherService {
  http = inject(HttpClient);


  getAllVouchers(page: number = 1, limit: number = 10,selectedType?:string | null,selectedStatus?:string | null): Observable<IVouchers> {
    console.log(selectedType);
    console.log(selectedStatus);
    
    
    const requestBody:any = {page,limit};
    if(selectedType) requestBody.type = selectedType
    if(selectedStatus !== null && selectedStatus !== undefined) requestBody.status = Boolean(Number(selectedStatus))
    return this.http.post<IVouchers>(
      `${WEB_SITE_BASE_URL}voucher`,requestBody
    );
  }

  getSingleVoucher(id: string): Observable<IVoucher> {
    return this.http.get<IVoucher>(`${WEB_SITE_BASE_URL}voucher/${id}`);
  }

  enableVoucher(id: string): Observable<{ message: string; status: number }> {
    return this.http.post<{ message: string; status: number }>(
      `${WEB_SITE_BASE_URL}voucher/${id}/toggle`,
      {}
    );
  }

  updateVoucher(id: string, voucherData: any): Observable<any> {
    return this.http.post<any>(
      `${WEB_SITE_BASE_URL}voucher/${id}`,
      voucherData
    );
  }

  addVoucher(voucherData: FormData): Observable<any> {
    return this.http.post<any>(`${WEB_SITE_BASE_URL}voucher`, voucherData);
  }

  activeUsers(search: string = ''): Observable<IActiveUsers> {
    return this.http.get<IActiveUsers>(
      `${WEB_SITE_BASE_URL}users?search=${search}`
    );
  }
}
