import { NgOptimizedImage } from "@angular/common";
import { Component, inject } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";
import { MessageService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { DialogModule } from "primeng/dialog";
import { DropdownChangeEvent, DropdownModule } from "primeng/dropdown";
import { InputSwitchModule } from "primeng/inputswitch";
import { Table, TableModule } from "primeng/table";
import { ToastModule } from "primeng/toast";
import { timer } from "rxjs";
import {  productsData } from "../../../../../../core/Interfaces/d-products/IGetAllProducts";
import { ProductsService } from "../../../../../../core/services/d-products/products.service";
import { LoadingDataBannerComponent } from "../../../../../../shared/components/loading-data-banner/loading-data-banner.component";
import { NoDataFoundBannerComponent } from "../../../../../../shared/components/no-data-found-banner/no-data-found-banner.component";
import { ISelectOptions } from "../../../../../../core/Interfaces/core/ISelectOptions";
import { WEB_SITE_IMG_URL } from "../../../../../../core/constants/WEB_SITE_BASE_UTL";
import { Category } from "../../../../../../core/Interfaces/d-products/IGetProductsCategories";

@Component({
  selector: "app-a-all-products",
  standalone: true,
  imports: [
    ButtonModule,
    DialogModule,
    ReactiveFormsModule,
    TableModule,
    FormsModule,
    DropdownModule,
    ToastModule,
    InputSwitchModule,
    LoadingDataBannerComponent,
    RouterLink,
    NgOptimizedImage,
    NoDataFoundBannerComponent,
  ],
  templateUrl: "./a-all-products.component.html",
  styleUrl: "./a-all-products.component.scss",
  providers: [MessageService],
})
export class AAllProductsComponent {
  products: productsData[] = [];
  allCategories!: Category[];
  selectedCategory:number[] = [];
  filteredProducts: productsData[] = [];
  categoryData!: {
    value: number;
    label: string;
  }[];
  allProducts!: any;
  readonly imgUrl = WEB_SITE_IMG_URL;
  private ngxSpinnerService = inject(NgxSpinnerService);

  private messageService = inject(MessageService);

  private productsService = inject(ProductsService);

  // Dropdown
  selectedStatus: number | null = null;
  selectedRecommendation:number | null = null
  selectOptions: ISelectOptions[] = [];
  recommendedOptions: ISelectOptions[] = [];
  onFilterCategoryChange(value: DropdownChangeEvent): void {
    if(value.value === null) {
      this.selectedCategory = [];
    } else {
      this.selectedCategory = [value.value];
    }
    this.loadProducts();
  }
  onFilterChange(value: string | null): void {
    
    if(value !== null) {
      this.selectedStatus = Number(value);
    } else {
      this.selectedStatus = null
    }
    this.loadProducts()
  }
  onRecommendedFilterChange(value: string | null): void {
    
    if(value !== null) {
      this.selectedRecommendation = Number(value);
    } else {
      this.selectedRecommendation = null
    }
    this.loadProducts()
  }

  initDropDownFilter(): void {
    this.selectOptions = [
      {
        label: "Active",
        value: "1",
      },
      {
        label: "Inactive",
        value: "0",
      },
    ];
    this.recommendedOptions = [
      {
        label: "Recommended",
        value: "1",
      },
      {
        label: "Not recommended",
        value: "0",
      },

    ]
  }

  ngOnInit() {
    this.initDropDownFilter();
    this.initCategories();
    this.fetchData();
  }

  // get all categories
  initCategories(): void {
    this.productsService.getAllProductsCategories().subscribe((response) => {
      this.allCategories = response.categories.data;
      this.categoryData = this.allCategories.map((category) => ({
        value: category.id,
        label: category.title_en,
      }));
      
    });
  }

  // get All Product
  fetchData() {
    this.productsService.getAllProducts().subscribe(
      (response: any) => {
        // response.products.data.reverse();
        this.allProducts = response.products;
        this.totalRecords = response.products.total;
        this.products = response.products.data;
        this.filteredProducts = [...this.products];
        console.log(this.filteredProducts);
        
      },
      () => {
        this.messageService.add({ severity: "error", summary: "Error", detail: "Failed to load Product" });
      }
    );
  }

  // Toggle Product
  toggleProductStatus(Product: any) {
    this.ngxSpinnerService.show("actionsLoader");
    this.messageService.clear();

    const updatedStatus = !Product.status; // Toggle between 0 and 1
      this.productsService.enableProduct(Product.id.toString()).subscribe(() => {
        this.messageService.add({
          severity: "success",
          summary: "Updated",
          detail: `Product ${updatedStatus ? "Enabled" : "Disabled"} successfully`,
        });
        timer(200).subscribe(() => this.ngxSpinnerService.hide("actionsLoader"));
        Product.status = updatedStatus;
      });
      
    
  }
  // Toggle recommended
  toggleRecommendedStatus(Product: any) {
    this.ngxSpinnerService.show("actionsLoader");
    this.messageService.clear();

    const updatedStatus = !Product.is_recommended; // Toggle between 0 and 1
      this.productsService.toggleProductRecommendation(Product.id.toString()).subscribe(() => {
        this.messageService.add({
          severity: "success",
          summary: "Updated",
          detail: `Recommended ${updatedStatus ? "Enabled" : "Disabled"} successfully`,
        });
        timer(200).subscribe(() => this.ngxSpinnerService.hide("actionsLoader"));
        Product.is_recommended = updatedStatus;
      });
      
    
  }

  totalRecords: number = 0;
  rowsPerPage = 10;
  currentPage = 1;

  onPageChange(event: any) {
    this.currentPage = event.first / event.rows + 1; // Convert to 1-based index
    this.rowsPerPage = event.rows;
    this.loadProducts();
  }

  loadProducts() {
    this.ngxSpinnerService.show("actionsLoader");
    this.productsService.getAllProducts(this.currentPage, this.rowsPerPage,"",this.selectedCategory,this.selectedStatus,this.selectedRecommendation).subscribe(
      (response: any) => {
        this.ngxSpinnerService.hide("actionsLoader");
        this.allProducts = response;
        this.totalRecords = response.products.total;
        this.products = response.products.data;
        this.filteredProducts = [...this.products];
        console.log(this.filteredProducts);
        
      },
      () => {
        this.messageService.add({ severity: "error", summary: "Error", detail: "Failed to load Product" });
      }
    );
  }

  getPagination(): number[] {
    if (this.totalRecords === 0) return [0];

    const options = [10, 100, 500, 1000];
    const validOptions = options.filter((opt) => opt <= this.totalRecords);

    if (!validOptions.includes(this.totalRecords)) {
      validOptions.push(this.totalRecords);
    }

    return validOptions.sort((a, b) => a - b);
  }

  onGlobalFilter(dt: Table, event: any) {
    // const value = event.target.value.toLowerCase();
    // this.filteredProducts = this.products.filter((product) => {
    //   return (
    //     product.id.toString().includes(value) ||
    //     product.title_en.toLowerCase().includes(value) ||
    //     product.title_ar.toLowerCase().includes(value) ||
    //     (product.status ? "active" : "inactive").includes(value)
    //   );
    // });
  }

  onSort(event: any) {
    // Handle sorting logic here
    const field = event.field;
    const order = event.order;

    // Sort the filtered products array
    this.filteredProducts.sort((a, b) => {
      let valueA: any;
      let valueB: any;

      // Handle different field types
      if (field === "id") {
        valueA = Number(a.id);
        valueB = Number(b.id);
      } else if (field === "en_food_name") {
        valueA = a.title_ar;
        valueB = b.title_ar;
      } else if (field === "ar_food_name") {
        valueA = a.title_en;
        valueB = b.title_ar;
      } 
       else {
        // Default case
        valueA = (a as any)[field];
        valueB = (b as any)[field];
      }

      if (valueA < valueB) {
        return order === -1 ? -1 : 1;
      } else if (valueA > valueB) {
        return order === -1 ? 1 : -1;
      } else {
        return 0;
      }
    });
  }
}
