import { filter } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgxJoditComponent } from 'ngx-jodit';
import { NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule } from 'primeng/fileupload';
import { InputSwitchModule } from 'primeng/inputswitch';
import { timer } from 'rxjs';
import { Category } from '../../../../../../core/Interfaces/h-category/ICategoryById';
import { ProductsService } from '../../../../../../core/services/d-products/products.service';
import { HttpErrorResponse } from '@angular/common/http';
import { OnlyNumberDirective } from '../../../../../../only-number.directive';
import { WEB_SITE_IMG_URL } from '../../../../../../core/constants/WEB_SITE_BASE_UTL';
import { productsData } from '../../../../../../core/Interfaces/d-products/IGetAllProducts';
interface productImages {
  image: string;
  id: number;
  isNew: boolean;
  file?: File;
}
@Component({
  selector: 'app-h-products-edit',
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
    OnlyNumberDirective,
  ],
  templateUrl: './h-products-edit.component.html',
  styleUrl: './h-products-edit.component.scss',
  providers: [MessageService],
})
export class HProductsEditComponent {
  submitForm!: FormGroup;

  categories!: Category[];
  productId: number = 0;

  private fb = inject(FormBuilder);

  private productsService = inject(ProductsService);

  private ngxSpinnerService = inject(NgxSpinnerService);
  existingGalleryImages: productImages[]= [];
  newGalleryImages: File[] = [];
deletedImagesIds: number[] = [];
  private router = inject(Router);

  private messageService = inject(MessageService);

  private activatedRoute = inject(ActivatedRoute);

  errorMessage: string = '';

  isBaseImage = '';

  private initializeForm() {
    this.submitForm = this.fb.group({
      main_image: [''],
      images: [[]],
      price: ['', [Validators.required, Validators.min(0)]],
      category_id: ['', [Validators.required]],
      title_en: ['', [Validators.required]],
      title_ar: ['', [Validators.required]],
      description_en: [''],
      description_ar: [''],
      status: [1, [Validators.required]],
    });
  }
  removeExistingImage(image: productImages) {

  if (!image.isNew) {
    this.deletedImagesIds.push(image.id);
  }

  this.existingGalleryImages =
    this.existingGalleryImages.filter(img => img.id !== image.id);

  if (image.isNew && image.file) {
    this.newGalleryImages =
      this.newGalleryImages.filter(file => file !== image.file);
  }
}

  ngOnInit() {
    this.initializeForm();
    this.categories =
      this.activatedRoute.snapshot.data['categories'].categories.data;

    const productData: productsData =
      this.activatedRoute.snapshot.data['products']?.data;

    if (productData) {
      
      this.patchFormData(productData)
    }
  }
  patchFormData(product: productsData): void {
    this.productId = product.id;
      this.isBaseImage = product.main_image;

      if (product.images && product.images.length > 0) {
        this.existingGalleryImages = product.images.map(image => ({image:image.image,id:image.id,isNew:false}));
      }
      console.log(product);
      
    this.submitForm.patchValue({
      main_image: product.main_image,
      price: product.price,
      category_id: product.category_id,
      title_en:product.title_en,
      title_ar:product.title_ar,
      description_en:product.description_en,
      description_ar: product.description_ar,
      status:product.status
    });
    console.log(this.submitForm.value);
    
  }

  saveForm() {
    this.submitForm.markAllAsTouched();
    this.errorMessage = "";

    const fd = new FormData();
    if (this.submitForm.invalid) return;
    this.ngxSpinnerService.show("actionsLoader");
    this.messageService.clear();

    Object.keys(this.submitForm.value).forEach((key) => {
      if(key === "status") {
        const numVal = Number(this.submitForm.value[key])
        fd.append(key, numVal.toString());
      } else if (key !== "main_image" && key !== "images") {
        fd.append(key, this.submitForm.value[key]);
      }
      
    });

    if (typeof this.submitForm.get("main_image")?.value == "object") {
      fd.append("main_image", this.submitForm.get("main_image")?.value);
    } else {
      fd.delete("main_image");
    }
    const extraImages = this.submitForm.get("images")?.value.filter((image:productImages) => {
      return !this.deletedImagesIds.includes(image.id)
    });
    console.log(extraImages);
    
    this.deletedImagesIds.forEach(id => {
    fd.append('delete_images[]', id.toString());
  });
  if (this.newGalleryImages.length > 0) {
    this.newGalleryImages.forEach((file: File) => {
      fd.append("images[]", file); 
    });
  }
      this.productsService.updateProduct(this.productId?.toString(), fd).subscribe({
        next: () => {
          this.router.navigate(["/dashboard/menu/products/products-index"]);
          this.messageService.add({ severity: "success", summary: "Updated", detail: "Product updated successfully" });
          timer(200).subscribe(() => this.ngxSpinnerService.hide("actionsLoader"));
        },
        error: (error: HttpErrorResponse) => {
          this.ngxSpinnerService.hide("actionsLoader");
          // if (error.error.errors.image) {
          //   this.errorMessage = error.error.errors.image[0];
          // }
        },
      });

  }

  onFileSelect(event: any): void {
    this.isBaseImage = '';
    const files = event.files;
    if (files && files.length > 0) {
      const file = files[0];
      this.submitForm.patchValue({ main_image: file });
    }
  }

  clearImage(): void {
    this.isBaseImage =
      this.activatedRoute.snapshot.data['products'].data.main_image;
    this.submitForm.patchValue({ main_image: '' });
  }
  private tempImageId = -1;
  onMultipleFilesSelect(event: any): void {    
  const files: File[] = event.currentFiles;
  files.forEach(file => {
    this.newGalleryImages.push(file);
    // preview فقط
    this.existingGalleryImages.push({
      id: this.tempImageId--,
      image: URL.createObjectURL(file),
      isNew: true,
      file
    });
    this.submitForm.get('images')?.patchValue(this.newGalleryImages)
  });
}

}
