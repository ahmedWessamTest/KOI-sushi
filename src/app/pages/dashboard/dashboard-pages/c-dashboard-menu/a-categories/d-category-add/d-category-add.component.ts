import { Component, inject } from "@angular/core";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";
import { MessageService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { DialogModule } from "primeng/dialog";
import { InputSwitchModule } from "primeng/inputswitch";
import { timer } from "rxjs";
import { IAddCategoryBody } from "../../../../../../core/Interfaces/h-category/IAddCategoryBody";
import { CategoriesService } from "../../../../../../core/services/h-category/categories.service";
import { FileUploadModule } from "primeng/fileupload";
import { ICategoryById } from "../../../../../../core/Interfaces/h-category/ICategoryById";

@Component({
  selector: "app-d-category-add",
  standalone: true,
  imports: [ButtonModule, CardModule, InputSwitchModule, DialogModule, FormsModule, ReactiveFormsModule, RouterLink, FileUploadModule],
  templateUrl: "./d-category-add.component.html",
  styleUrl: "./d-category-add.component.scss",
  providers: [MessageService],
})
export class DCategoryAddComponent {
  submitForm: FormGroup;

  isEditing = false;

  categoryId: number | null = null;
  isBaseImage: string | null = null
  private fb = inject(FormBuilder);

  private categoriesService = inject(CategoriesService);

  private ngxSpinnerService = inject(NgxSpinnerService);

  private router = inject(Router);

  private messageService = inject(MessageService);

  private activatedRoute = inject(ActivatedRoute);

  constructor() {
    this.submitForm = this.fb.group({
      title_en: ["", Validators.required],
      title_ar: ["", Validators.required],
      status: [1, Validators.required],
      image:['']
    });
  }

  ngOnInit() {
    this.patchFormValue();
  }
  patchFormValue() {
    const categoryData:ICategoryById = this.activatedRoute.snapshot.data["category"]
    if (categoryData) {
      this.isEditing = true;    
      const patchesData:any =   structuredClone(categoryData.data);
      patchesData.status = Number(patchesData.status);
      patchesData.image = null;
      this.submitForm.patchValue(patchesData);
      console.log(this.submitForm.value);
      console.log(categoryData.data.image);
      
      if(categoryData.data.image) {
        this.isBaseImage = categoryData.data.image;
      }
      this.categoryId = categoryData.data.id;
    }
  }
  clearImage(): void {
    const categoryData:ICategoryById = this.activatedRoute.snapshot.data["category"];
    if(categoryData.data.image) {
        this.isBaseImage = categoryData.data.image;
      }
    this.submitForm.patchValue({ image: "" });
  }
  onFileSelect(event: any): void {
    this.isBaseImage = '';
    const files = event.files;
    if (files && files.length > 0) {
      const file = files[0];      
      this.submitForm.patchValue({ image: file });
    }
  }
  private buildFormData(): FormData {
  const formData = new FormData();

  Object.entries(this.submitForm.value).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      formData.append(key, value as any);
    }
  });

  return formData;
}

  saveForm() {
    this.submitForm.markAllAsTouched();
    if (this.submitForm.invalid) return;
    this.ngxSpinnerService.show("actionsLoader");
    this.messageService.clear();
    const formData = this.buildFormData();
    if (this.isEditing && this.categoryId) {
      this.categoriesService.updateCategory(this.categoryId, formData).subscribe(() => {
        this.router.navigate(["/dashboard/menu/categories"]);
        this.messageService.add({ severity: "success", summary: "Updated", detail: "Category updated successfully" });
        timer(200).subscribe(() => this.ngxSpinnerService.hide("actionsLoader"));
      });
    } else {
      this.categoriesService.addCategory(formData).subscribe(() => {
        this.router.navigate(["/dashboard/menu/categories"]);
        this.messageService.add({ severity: "success", summary: "Added", detail: "Category added successfully" });
        timer(200).subscribe(() => this.ngxSpinnerService.hide("actionsLoader"));
      });
    }
  }
}
