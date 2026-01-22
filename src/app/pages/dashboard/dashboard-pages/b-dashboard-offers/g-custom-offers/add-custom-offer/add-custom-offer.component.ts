import { CommonModule } from '@angular/common';
import { Component, inject, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { ToastModule } from 'primeng/toast';
import { NgxSpinnerService } from 'ngx-spinner';
import { CustomOffersService } from '../../../../../../core/services/g-custom-offers/custom-offers.service';
import { CombosService } from '../../../../../../core/services/d-combos/combos.service';
import { OnlyNumberDirective } from '../../../../../../only-number.directive';
import { FileUpload, FileUploadModule } from 'primeng/fileupload';

@Component({
  selector: 'app-add-custom-offer',
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
    ToastModule,
    OnlyNumberDirective,
    RouterLink,
    FileUploadModule,
  ],
  templateUrl: './add-custom-offer.component.html',
  styleUrl: './add-custom-offer.component.scss',
})
export class AddCustomOfferComponent {
  @ViewChild('fileUpload') fileUpload!: FileUpload;
  submitForm!: FormGroup;
  isEditing = false;
  isViewOnly = false;
  offerId: string | null = null;
  combos: any[] = [];
  loadingCombos = false;
  selectedImage: File | null = null;
  imagePreview: string | null = null;

  private fb = inject(FormBuilder);
  private customOffersService = inject(CustomOffersService);
  private combosService = inject(CombosService);
  private ngxSpinnerService = inject(NgxSpinnerService);
  private messageService = inject(MessageService);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);

  ngOnInit() {
    this.initForm();
    this.loadCombos();
    this.checkMode();
  }

  private initForm() {
    this.submitForm = this.fb.group({
      title_ar: ['', Validators.required],
      title_en: ['', Validators.required],
      percentage: ['', Validators.required],
      min_order_amount: ['', Validators.required],
      status: [true, Validators.required],
      combos: [[], Validators.required],
      description_ar: ['', Validators.required],
      description_en: ['', Validators.required],
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

  private checkMode() {
    const url = this.router.url;
    this.isViewOnly = url.includes('custom-offers-details');
    this.isEditing = url.includes('custom-offers-edit');

    if (this.isEditing || this.isViewOnly) {
      const resolvedData = this.activatedRoute.snapshot.data['customOffer'];
      if (resolvedData && resolvedData.data) {
        this.offerId = resolvedData.data.id.toString();
        this.patchForm(resolvedData.data);
      }
      if (this.isViewOnly) {
        this.submitForm.disable();
      }
    }
  }

  private patchForm(data: any) {
    this.submitForm.patchValue({
      title_ar: data.title_ar,
      title_en: data.title_en,
      percentage: data.percentage,
      min_order_amount: data.min_order_amount,
      status: data.status,
      description_ar: data.description_ar,
      description_en: data.description_en,
      combos: data.combos ? data.combos.map((c: any) => c.id) : [],
    });
    if (data.image) {
      // Handling image preview if needed.
      // Usually images come from a different base URL or we handle them locally.
    }
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
    const formData = new FormData();
    const values = this.submitForm.value;

    formData.append('title_ar', values.title_ar);
    formData.append('title_en', values.title_en);
    formData.append('description_ar', values.description_ar);
    formData.append('description_en', values.description_en);
    formData.append('percentage', values.percentage);
    formData.append('min_order_amount', values.min_order_amount);
    formData.append('status', values.status ? '1' : '0');

    values.combos.forEach((id: number) => {
      formData.append('combos[]', id.toString());
    });

    if (this.selectedImage) {
      formData.append('image', this.selectedImage);
    }

    const request =
      this.isEditing && this.offerId
        ? this.customOffersService.updateCustomOffer(this.offerId, formData)
        : this.customOffersService.addCustomOffer(formData);

    request.subscribe({
      next: () => {
        this.ngxSpinnerService.hide('actionsLoader');
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Operation successful',
        });
        this.router.navigate(['/dashboard/offers/custom-offers']);
      },
      error: () => {
        this.ngxSpinnerService.hide('actionsLoader');
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Operation failed',
        });
      },
    });
  }
}
