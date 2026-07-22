export interface IAppVersionItem {
  id: number;
  platform: string;
  version: string;
  created_at: string;
  updated_at: string;
}

export interface IAppVersionsData {
  android: IAppVersionItem;
  ios: IAppVersionItem;
}

export interface IAppVersionsGetResponse {
  success: boolean;
  data: IAppVersionsData;
}

export interface IAppVersionsUpdatePayload {
  android_version: string;
  ios_version: string;
}

export interface IAppVersionsUpdateResponse {
  success?: boolean;
  message?: string;
  data?: any;
}
