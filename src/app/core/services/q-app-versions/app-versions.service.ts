import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { WEB_SITE_BASE_URL } from '../../constants/WEB_SITE_BASE_UTL';
import {
  IAppVersionsGetResponse,
  IAppVersionsUpdatePayload,
  IAppVersionsUpdateResponse,
} from '../../Interfaces/q-app-versions/IAppVersions';

@Injectable({
  providedIn: 'root',
})
export class AppVersionsService {
  constructor(private http: HttpClient) {}

  getAppVersions() {
    return this.http.get<IAppVersionsGetResponse>(`${WEB_SITE_BASE_URL}app-versions`);
  }

  updateAppVersions(versionsData: IAppVersionsUpdatePayload) {
    return this.http.post<IAppVersionsUpdateResponse>(
      `${WEB_SITE_BASE_URL}app-versions/update`,
      versionsData
    );
  }
}
