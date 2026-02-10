import { CommonModule } from '@angular/common';
import { Component, inject, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { NgxSpinnerService } from 'ngx-spinner';
import { FileUpload, FileUploadModule } from 'primeng/fileupload';
import { CombosService } from '../../../../../core/services/d-combos/combos.service';
import { HalfMirrorOfferService } from '../../../../../core/services/f-half-mirror-offer/half-mirror-offer.service';
import { OnlyNumberDirective } from '../../../../../only-number.directive';
import { NgxJoditComponent } from 'ngx-jodit';

@Component({
  selector: 'app-half-mirror-offer',
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
    NgxJoditComponent,
  ],
  templateUrl: './half-mirror-offer.component.html',
  styleUrl: './half-mirror-offer.component.scss',
})
export class HalfMirrorOfferComponent {
  @ViewChild('fileUpload') fileUpload!: FileUpload;
  submitForm!: FormGroup;
  combos: any[] = [];
  loadingCombos = false;
  selectedImage: File | null = null;
  imagePreview: string | null = null;

  private fb = inject(FormBuilder);
  private halfMirrorOfferService = inject(HalfMirrorOfferService);
  private combosService = inject(CombosService);
  private ngxSpinnerService = inject(NgxSpinnerService);
  private messageService = inject(MessageService);
  private activatedRoute = inject(ActivatedRoute);

  ngOnInit() {
    this.initForm();
    this.loadCombos();

    // Load Resolver Data
    const data = this.activatedRoute.snapshot.data['halfMirrorOffer'];
    if (data && data.data) {
      this.patchForm(data.data);
    }
  }

  private initForm() {
    this.submitForm = this.fb.group({
      title_ar: ['', Validators.required],
      title_en: ['', Validators.required],
      bonus_percentage: ['', Validators.required],
      description_ar: ['', Validators.required],
      description_en: ['', Validators.required],
      status: [false, Validators.required],
      combos: [[], Validators.required],
    });
  }

  private patchForm(data: any) {
    this.submitForm.patchValue({
      title_ar: data.title_ar,
      title_en: data.title_en,
      bonus_percentage: data.bonus_percentage,
      description_ar: data.description_ar,
      description_en: data.description_en,
      status: data.status,
      combos: data.combos ? data.combos.map((c: any) => c.id || c) : [],
    });
    if (data.image) {
      this.imagePreview = data.image;
    }
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
    formData.append('bonus_percentage', values.bonus_percentage);
    formData.append('description_ar', values.description_ar);
    formData.append('description_en', values.description_en);
    formData.append('status', values.status ? '1' : '0');

    values.combos.forEach((id: any) => {
      formData.append('combos[]', id.toString());
    });

    if (this.selectedImage) {
      formData.append('image', this.selectedImage);
    }

    this.halfMirrorOfferService.updateMirrorOffer(formData).subscribe({
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
