import { CommonModule, CurrencyPipe, NgOptimizedImage } from "@angular/common";
import { Component, inject } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { TagModule } from "primeng/tag";
import {  WEB_SITE_IMG_URL } from "../../../../../../core/constants/WEB_SITE_BASE_UTL";
interface ProductData {
  id: number
  category_id: number
  title_ar: string
  title_en: string
  description_ar: string
  description_en: string
  price: string
  main_image: string
  total_orders: number
  status: boolean
  created_at: string
  updated_at: string
  has_options: boolean
  is_recommended: boolean
  images: Image[]
}

interface Image {
  id: number
  product_id: number
  image: string
  created_at: string
  updated_at: string
}
@Component({
  selector: "app-b-products-details",
  standalone: true,
  imports: [TagModule, CommonModule, CardModule, ButtonModule, RouterLink, NgOptimizedImage, CurrencyPipe],
  templateUrl: "./b-products-details.component.html",
  styleUrl: "./b-products-details.component.scss",
})
export class BProductsDetailsComponent {
  private ActivatedRoute = inject(ActivatedRoute);
  readonly imgUrl = WEB_SITE_IMG_URL;
  productData!: ProductData;

  ngOnInit(): void {
    this.productData = this.ActivatedRoute.snapshot.data["products"].data;
  }
}
