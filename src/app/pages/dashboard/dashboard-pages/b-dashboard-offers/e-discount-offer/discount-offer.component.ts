import { CommonModule } from '@angular/common';
import { Component, inject, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { NgxSpinnerService } from 'ngx-spinner';
import { FileUpload, FileUploadModule } from 'primeng/fileupload';
import { CombosService } from '../../../../../core/services/d-combos/combos.service';
import { DiscountOfferService } from '../../../../../core/services/e-discount-offer/discount-offer.service';
import { OnlyNumberDirective } from '../../../../../only-number.directive';

@Component({
  selector: 'app-discount-offer',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    InputSwitchModule,
    MultiSelectModule,
    OnlyNumberDirective,
    FileUploadModule,
  ],
  templateUrl: './discount-offer.component.html',
  styleUrl: './discount-offer.component.scss',
})
export class DiscountOfferComponent {
  @ViewChild('fileUpload') fileUpload!: FileUpload;
  submitForm!: FormGroup;
  combos: any[] = [];
  loadingCombos = false;
  selectedImage: File | null = null;
  imagePreview: string | null = null;

  private fb = inject(FormBuilder);
  private discountOfferService = inject(DiscountOfferService);
  private combosService = inject(CombosService);
  private ngxSpinnerService = inject(NgxSpinnerService);
  private messageService = inject(MessageService);
  private activatedRoute = inject(ActivatedRoute);

  ngOnInit() {
    this.initForm();
    this.loadCombos();

    // Load Resolver Data
    const data = this.activatedRoute.snapshot.data['discountOffer'];
    if (data && data.data) {
      this.patchForm(data.data);
    }
  }

  private initForm() {
    this.submitForm = this.fb.group({
      title_ar: ['', Validators.required],
      title_en: ['', Validators.required],
      value: ['', Validators.required],
      status: [false, Validators.required],
      combos: [[], Validators.required],
    });
  }

  private patchForm(data: any) {
    this.submitForm.patchValue({
      title_ar: data.title_ar,
      title_en: data.title_en,
      value: data.percentage, // Assuming 'percentage' from response maps to 'value' in update based on user request example
      status: data.status,
      // If the GET response includes 'combos' or similar, patch it here.
      // User didn't show 'combos' in GET response, but did in POST.
      // Creating functionality to select combos.
      combos: data.combos ? data.combos.map((c: any) => c.id || c) : [],
    });
  }

  private loadCombos() {
    this.loadingCombos = true;
    this.combosService.getAllCombos().subscribe({
      next: (res) => {
        this.combos = res.data;
        this.loadingCombos = false;
      },
      error: () => (this.loadingCombos = false),
    });
  }

  onFileSelect(event: any) {
    const file = event.files[0];
    if (file) {
      this.selectedImage = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  clearImage() {
    this.selectedImage = null;
    this.imagePreview = null;
  }

  save() {
    this.submitForm.markAllAsTouched();
    if (this.submitForm.invalid) return;

    this.ngxSpinnerService.show('actionsLoader');
    const values = this.submitForm.value;
    const formData = new FormData();

    formData.append('title_ar', values.title_ar);
    formData.append('title_en', values.title_en);
    formData.append('percentage', values.value); // API expects percentage
    formData.append('status', values.status ? '1' : '0');

    values.combos.forEach((id: any) => {
      formData.append('combos[]', id.toString());
    });

    if (this.selectedImage) {
      formData.append('image', this.selectedImage);
    }

    this.discountOfferService.updateDiscountOffer(formData).subscribe({
      next: () => {
        this.ngxSpinnerService.hide('actionsLoader');
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Updated Successfully',
        });
      },
      error: () => {
        this.ngxSpinnerService.hide('actionsLoader');
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Update Failed',
        });
      },
    });
  }
}
