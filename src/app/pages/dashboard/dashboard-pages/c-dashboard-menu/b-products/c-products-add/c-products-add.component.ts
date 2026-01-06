import { CommonModule } from "@angular/common";
import { HttpErrorResponse } from "@angular/common/http";
import { Component, inject, ViewChild } from "@angular/core";
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { NgxJoditComponent } from "ngx-jodit";
import { NgxSpinnerService } from "ngx-spinner";
import { MessageService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { DialogModule } from "primeng/dialog";
import { DropdownModule } from "primeng/dropdown";
import { FileUpload, FileUploadModule } from "primeng/fileupload";
import { InputSwitchModule } from "primeng/inputswitch";
import { timer } from "rxjs";
import { Category } from "../../../../../../core/Interfaces/h-category/ICategoryById";
import { ProductsService } from "../../../../../../core/services/d-products/products.service";
import { OnlyNumberDirective } from "../../../../../../only-number.directive";

@Component({
  selector: "app-c-products-add",
  standalone: true,
  imports: [
    ButtonModule,
    FileUploadModule,
    CardModule,
    InputSwitchModule,
    DialogModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    DropdownModule,
    NgxJoditComponent,
    CommonModule,
    OnlyNumberDirective
],
  templateUrl: "./c-products-add.component.html",
  styleUrl: "./c-products-add.component.scss",
  providers: [MessageService],
})
export class CProductsAddComponent {
  submitForm!: FormGroup;
  @ViewChild('multiFileUpload') multiFileUploadComponent!: FileUpload;
  categories!: Category[];
  openGalleryBrowser() {
  this.multiFileUploadComponent.choose();
}
  isEditing = false;

  productId: string | null = null;

  private fb = inject(FormBuilder);

  private productsService = inject(ProductsService);

  private ngxSpinnerService = inject(NgxSpinnerService);

  private router = inject(Router);

  private messageService = inject(MessageService);

  private activatedRoute = inject(ActivatedRoute);

  errorMessage: string = "";

  private initializeForm() {
    this.submitForm = this.fb.group({
      main_image: [""],
      images: [[]],
      price: ["", Validators.required,Validators.min(0)],
      category_id: ["", Validators.required],
      title_en: ["", Validators.required],
      title_ar: ["", Validators.required],
      description_en: [""],
      description_ar: [""],
      status: [1, Validators.required],
    });
  }

  ngOnInit() {
    this.initializeForm();
    this.categories = this.activatedRoute.snapshot.data["categories"].categories.data;
    console.log(this.categories);
    
    if (this.activatedRoute.snapshot.data["products"]) {
      this.isEditing = true;
      this.productId = this.activatedRoute.snapshot.data["products"].product.id;
      const product = this.activatedRoute.snapshot.data["products"];
      this.submitForm.patchValue(product.product);

      this.makeImageOptional();

      if (product.product.price === null) {
        this.makePriceOptional();
        this.submitForm.updateValueAndValidity(); // consider adding this
      }
    }
  }

  private makeImageOptional() {
    this.submitForm.get("main_image")?.clearValidators();
    this.submitForm.updateValueAndValidity();
  }
  private makePriceOptional() {
    const priceControl = this.submitForm.get("price");
    priceControl?.clearValidators();
    priceControl?.updateValueAndValidity(); // <- update here, not the whole form
  }

  saveForm() {
    this.submitForm.markAllAsTouched();
    this.errorMessage = "";

    const fd = new FormData();
    if (this.submitForm.invalid) return;
    this.ngxSpinnerService.show("actionsLoader");
    this.messageService.clear();

    Object.keys(this.submitForm.value).forEach((key) => {
      if (key !== "main_image" && key !== "images") {
        fd.append(key, this.submitForm.value[key]);
      }
    });

    if (typeof this.submitForm.get("main_image")?.value == "object") {
      fd.append("main_image", this.submitForm.get("main_image")?.value);
    } else {
      fd.delete("main_image");
    }
    const extraImages = this.submitForm.get("images")?.value;
  if (Array.isArray(extraImages)) {
    extraImages.forEach((file: File) => {
      fd.append("images[]", file); // نستخدم images[] ليفهم السيرفر أنها مصفوفة
    });
  }
    if (this.isEditing && this.productId) {
      this.productsService.updateProduct(this.productId, fd).subscribe({
        next: () => {
          this.router.navigate(["/dashboard/menu/products/products-index"]);
          this.messageService.add({ severity: "success", summary: "Updated", detail: "Product updated successfully" });
          timer(200).subscribe(() => this.ngxSpinnerService.hide("actionsLoader"));
        },
        error: (error: HttpErrorResponse) => {
          this.ngxSpinnerService.hide("actionsLoader");
          if (error.error.errors.image) {
            this.errorMessage = error.error.errors.image[0];
          }
        },
      });
    } else {
      this.productsService.addProduct(fd).subscribe({
        next: (response) => {
          this.router.navigate(["/dashboard/menu/products/products-index"]);
          this.messageService.add({ severity: "success", summary: "Added", detail: "Product added successfully" });
          timer(200).subscribe(() => this.ngxSpinnerService.hide("actionsLoader"));
        },
        error: (error: HttpErrorResponse) => {
          this.ngxSpinnerService.hide("actionsLoader");
          if (error.error.errors.image) {
            this.errorMessage = error.error.errors.image[0];
          }
        },
      });
    }
  }

  onFileSelect(event: any): void {
    const files = event.files;
    if (files && files.length > 0) {
      const file = files[0];
      console.log(file);
      
      this.submitForm.patchValue({ main_image: file });
    }
  }

  clearImage(): void {
    this.submitForm.patchValue({ main_image: "" });
  }
  onMultipleFilesSelect(event: any): void {
  const files = event.currentFiles; 
  this.submitForm.patchValue({ images: files });
}
}
