import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable, signal } from "@angular/core";
import { WEB_SITE_BASE_URL } from "../../constants/WEB_SITE_BASE_UTL";
import { IGetAllProducts } from "../../Interfaces/d-products/IGetAllProducts";
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
    console.log(selectedStatus);
    
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
    return this.http.get<IGetProductsCategories>(`${WEB_SITE_BASE_URL}categories`,);
  }
  getProductById(productId: string) {
    return this.http.get<IGetProductById>(`${WEB_SITE_BASE_URL}products/${productId}`);
  }
  addProduct(ProductData: {}) {
    return this.http.post<IAddProducts>(`${WEB_SITE_BASE_URL}products/create`, ProductData);
  }
  updateProduct(CategoryId: string, ProductData: {}) {
    return this.http.post<IUpdateProductsResponse>(`${WEB_SITE_BASE_URL}product_update/${CategoryId}`, ProductData);
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
  updateProductChoices(ChoiceId: string, choiceBody: {}) {
    return this.http.post<IUpdateChoiceResponse>(`${WEB_SITE_BASE_URL}updatechoices/${ChoiceId}`, choiceBody);
  }
  storeProductChoices(productId: string, choiceBody: {}) {
    return this.http.post<IAddChoicesResponse>(`${WEB_SITE_BASE_URL}storechoices/${productId}`, choiceBody);
  }
  updateProductPics(piceId: string, choiceBody: {}) {
    return this.http.post<IUpdateChoiceResponse>(`${WEB_SITE_BASE_URL}updatepieces/${piceId}`, choiceBody);
  }
  storeProductPics(CategoryId: string, choiceBody: {}) {
    return this.http.post<IAddChoicesResponse>(`${WEB_SITE_BASE_URL}storepieces/${CategoryId}`, choiceBody);
  }
}
