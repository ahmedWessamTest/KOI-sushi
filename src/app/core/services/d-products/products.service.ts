import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable, signal } from "@angular/core";
import { WEB_SITE_BASE_URL } from "../../constants/WEB_SITE_BASE_UTL";
import { IGetAllProducts, productsData } from "../../Interfaces/d-products/IGetAllProducts";
import { IGetProductsCategories } from "../../Interfaces/d-products/IGetProductsCategories";
import { IGetProductById } from "../../Interfaces/d-products/IGetProductById";
import { IAddProducts } from "../../Interfaces/d-products/IAddProductsResponse";
import { IUpdateProductsResponse } from "../../Interfaces/d-products/IUpdateProductsResponse";
import { IToggleProduct } from "../../Interfaces/d-products/IToggleProduct";
import { IUpdateChoiceResponse } from "../../Interfaces/d-products/IUpdateChoiceResponse";
import { IAddChoicesResponse } from "../../Interfaces/d-products/IAddChoicesResponse";

@Injectable({
  providedIn: "root",
})
export class ProductsService {
  constructor(private http: HttpClient) { }

  categoryId = signal(0);

  getAllProducts(page: number = 1, perPage: number = 10, search?: string, category_ids?: number[],selectedStatus?:number | null,selectedRecommendation?:number | null):Observable<IGetAllProducts> {    
    const requestBody:any = {};
    if(page) requestBody.page = page;
    if(perPage) requestBody.limit = perPage;
    if(search) requestBody.search = search
    if(Array.isArray(category_ids) && category_ids.length > 0) requestBody.category_ids = category_ids;    
    if(selectedStatus !== null && selectedStatus !== undefined) requestBody.status = Boolean(selectedStatus);
    if(selectedRecommendation !== null && selectedRecommendation !== undefined) requestBody.is_recommendation = Boolean(selectedRecommendation);
    return this.http.post<IGetAllProducts>(`${WEB_SITE_BASE_URL}products`, requestBody);
  }
  getAllProductsCategories() {
    return this.http.post<IGetProductsCategories>(`${WEB_SITE_BASE_URL}categories`,{all:true});
  }
  getProductById(productId: string):Observable<productsData> {
    return this.http.get<productsData>(`${WEB_SITE_BASE_URL}products/${productId}`);
  }
  getOptions(productId:string,page:number = 1, limit:number = 10,selectedStatus?:number | null):Observable<any> {
    const requestBody:any = {page,limit};
    if(selectedStatus !== null && selectedStatus !== undefined) requestBody.status = Boolean(selectedStatus);
    return this.http.post<any>(`${WEB_SITE_BASE_URL}products/${productId}/options`,requestBody);
  }
  addProduct(ProductData: {}) {
    return this.http.post<IAddProducts>(`${WEB_SITE_BASE_URL}products/create`, ProductData);
  }
  updateProduct(productId: string, ProductData: {}) {
    return this.http.post<IUpdateProductsResponse>(`${WEB_SITE_BASE_URL}products/${productId}`, ProductData);
  }
  destroyProduct(CategoryId: string) {
    return this.http.post<IToggleProduct>(`${WEB_SITE_BASE_URL}product_destroy/${CategoryId}`, {});
  }
  enableProduct(productId: string) {
    return this.http.post<IToggleProduct>(`${WEB_SITE_BASE_URL}products/${productId}/toggle`, {});
  }
  toggleProductRecommendation(productId: string) {
    return this.http.post<IToggleProduct>(`${WEB_SITE_BASE_URL}products/${productId}/recommendations`, {});
  }
  toggleOptionStatus(productId: number,optionId:number) {
    return this.http.post<any>(`${WEB_SITE_BASE_URL}products/${productId}/options/${optionId}/toggle`, {});
  }
  addOption(productId: string,data: any) {
    return this.http.post<any>(`${WEB_SITE_BASE_URL}products/${productId}/options/create`, data);
  }
  updateOption(productId: string,optionId:string,data: any) {
    return this.http.post<any>(`${WEB_SITE_BASE_URL}products/${productId}/options/${optionId}`, data);
  }

 
}
