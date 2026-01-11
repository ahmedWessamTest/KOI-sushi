import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { WEB_SITE_BASE_URL } from "../../constants/WEB_SITE_BASE_UTL";
import { IAllCategory } from "../../Interfaces/h-category/IAllCategory";
import { IAddCategoryBody } from "../../Interfaces/h-category/IAddCategoryBody";
import { ICategoryById } from "../../Interfaces/h-category/ICategoryById";
import { IAddCategoryResponse } from "../../Interfaces/h-category/IAddCategoryResponse";
import { IUpdateCategoryResponse } from "../../Interfaces/h-category/IUpdateCategory";
import { IToggleCategory } from "../../Interfaces/h-category/IToggleCategory";

@Injectable({
  providedIn: "root",
})
export class CategoriesService {
  constructor(private http: HttpClient) { }

  getAllCategories(page: number = 1, limit: number = 5,selectedStatus?:number | null) {
    const requestBody:any = {page,limit};
    if(selectedStatus !== null && selectedStatus !== undefined) requestBody.status = Boolean(selectedStatus);
    return this.http.post<IAllCategory>(`${WEB_SITE_BASE_URL}categories`,requestBody);
  }
  getCategoryById(CategoryId: string,) {
    
    return this.http.get<ICategoryById>(`${WEB_SITE_BASE_URL}categories/${CategoryId}`);
  }
  addCategory(categoryData: FormData) {
    
    return this.http.post<IAddCategoryResponse>(`${WEB_SITE_BASE_URL}categories/create`, categoryData);
  }
  updateCategory(CategoryId: number, categoryData: FormData) {
    return this.http.post<IUpdateCategoryResponse>(`${WEB_SITE_BASE_URL}categories/${CategoryId}`, categoryData);
  }
  destroyCategory(CategoryId: string) {
    return this.http.post<IToggleCategory>(`${WEB_SITE_BASE_URL}category_destroy/${CategoryId}`, {});
  }
  enableCategory(CategoryId: string) {
    return this.http.post<IToggleCategory>(`${WEB_SITE_BASE_URL}categories/${CategoryId}/toggle`, {});
  }
}
