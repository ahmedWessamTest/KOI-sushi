import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputSwitchModule } from 'primeng/inputswitch';
import { MultiSelectModule } from 'primeng/multiselect';
import {
  debounceTime,
  distinctUntilChanged,
  Subject,
  switchMap,
  takeUntil,
  timer,
} from 'rxjs';
import { OnlyNumberDirective } from '../../../../../../only-number.directive';
import { ActiveUser } from '../res/model/activeUser';
import { IAddVoucher } from '../res/model/reqVoucher';
import { VoucherService } from '../res/services/voucher.service';
import { FileUploadModule } from "primeng/fileupload";

@Component({
  selector: 'app-b-add-voucher',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    InputSwitchModule,
    DialogModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownModule,
    OnlyNumberDirective,
    MultiSelectModule,
    CalendarModule,
    FileUploadModule
],
  templateUrl: './b-voucher-id.component.html',
  styleUrl: './b-voucher-id.component.scss',
  providers: [MessageService, FormsModule],
})
export class BVoucherIdComponent implements OnInit {
  submitForm!: FormGroup;

  isEditing = false;

  voucherId: string | null = null;

  errorMessage = signal<string>('');

  allUsers = signal<ActiveUser[]>([]);

  isLoadingUsers = signal<boolean>(false);

  useOptions = [
    { label: 'Multi Use', value: 'unlimited' },
    { label: 'One Use', value: 'once' },
  ];

  typeOptions = [
    { label: 'Percentage', value: 'percentage' },
    { label: 'Fixed Amount', value: 'fixed' },
  ];

  applyOptions = [
    { label: 'All Users', value: 'unlimited' },
    { label: 'Specific  users', value: 'limited' },
  ];

  private fb = inject(FormBuilder);

  private searchSubject = new Subject<string>();

  private destroy$ = new Subject<void>();

  private voucherService = inject(VoucherService);

  private ngxSpinnerService = inject(NgxSpinnerService);

  private router = inject(Router);

  private messageService = inject(MessageService);

  private activatedRoute = inject(ActivatedRoute);

  private toastrService = inject(ToastrService);

  searchTerm = '';

  constructor() {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.checkEditMode(); // This must be called first to set isEditing and load initial users
    this.loadUsers();
    this.setupFormListeners();
  }

  initializeForm(): void {
    this.submitForm = this.fb.group({
      title_ar: ['', [Validators.required, Validators.minLength(3)]],
      title_en: ['', [Validators.required, Validators.minLength(3)]],
      use: ['unlimited', Validators.required],
      type: ['percentage', Validators.required],
      value: [0, [Validators.required]],
      min_amount: [0, [Validators.required]],
      apply: ['all', Validators.required],
      limit: [0],
      status: [1, Validators.required],
      users: [[]],
      expiration_date: ['', [Validators.required]],
      image: ["", Validators.required],
    });
  }

  setupFormListeners(): void {
    // Enable/disable limit field based on use selection
    this.submitForm.get('use')?.valueChanges.subscribe((value) => {
      const limitControl = this.submitForm.get('limit');
      if (value === 'limited') {
        limitControl?.setValidators([Validators.required, Validators.min(1)]);
      } else {
        limitControl?.clearValidators();
        limitControl?.setValue(0);
      }
      limitControl?.updateValueAndValidity();
    });

    this.submitForm.get('apply')?.valueChanges.subscribe((value) => {
      const usersControl = this.submitForm.get('users');
      if (value === 'limited') {
        usersControl?.setValidators([Validators.required]);
      } else {
        usersControl?.clearValidators();
        usersControl?.setValue([]);
      }
      usersControl?.updateValueAndValidity();
    });
  }
  checkEditMode(): void {
    const voucherData = this.activatedRoute.snapshot.data['voucher'];
    if (voucherData) {
      this.isEditing = true;
      const voucher = voucherData.voucher;
      this.voucherId = voucher.id.toString();

      // Extract user IDs from the voucher's users array
      const userIds = voucher.users?.map((user: ActiveUser) => user.id) || [];

      // Set initial users in allUsers signal if we have users from the resolver
      if (voucher.users && voucher.users.length > 0) {
        this.allUsers.set(voucher.users);
      }

      // Create a copy of voucher data and set the users field to just the IDs
      const voucherFormData = { ...voucher, users: userIds };
      this.submitForm.patchValue(voucherFormData);
    }
  }

  loadUsers(): void {
    if (!this.isEditing || (this.isEditing && this.allUsers().length === 0)) {
      this.searchSubject
        .pipe(
          debounceTime(500),
          distinctUntilChanged(),
          switchMap((term) => this.voucherService.activeUsers(term)),
          takeUntil(this.destroy$)
        )
        .subscribe((response) => {
          // If we're in edit mode, we need to preserve the existing selected users
          if (this.isEditing) {
            const existingUsers = this.allUsers();
            // Merge existing users with new search results, avoiding duplicates
            const mergedUsers = [...existingUsers];
            response.data.data.forEach((user: ActiveUser) => {
              if (
                !mergedUsers.some(
                  (existing: ActiveUser) => existing.id === user.id
                )
              ) {
                mergedUsers.push(user);
              }
            });
            this.allUsers.set(mergedUsers);
          } else {
            this.allUsers.set(response.data.data);
          }
          this.isLoadingUsers.set(false);
        });
    }
  }

  saveForm(): void {
  this.submitForm.markAllAsTouched();
  if (this.submitForm.invalid) {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Please fill all required fields correctly',
    });
    return;
  }

  this.ngxSpinnerService.show('actionsLoader');
  this.messageService.clear();
  this.errorMessage.set('');

  const formValue = this.submitForm.value;

  // 1. إنشاء الـ FormData
  const formData = new FormData();

  // 2. معالجة التاريخ
  const expirationDate =
    formValue.expiration_date instanceof Date
      ? formValue.expiration_date.toISOString().split('T')[0]
      : formValue.expiration_date;

  // 3. إضافة الحقول العادية للـ FormData
  formData.append('title_ar', formValue.title_ar);
  formData.append('title_en', formValue.title_en);
  formData.append('use', formValue.use);
  formData.append('type', formValue.type);
  formData.append('value', String(formValue.value));
  formData.append('min_amount', String(formValue.min_amount));
  formData.append('apply', formValue.apply);
  formData.append('limit', String(formValue.limit));
  formData.append('status', String(formValue.status));
  formData.append('expiration_date', expirationDate);

  // 4. إضافة المصفوفات (Users)
  // الـ Backend غالباً بيحتاج المصفوفة تتبعت بالشكل ده users[]
  if (formValue.users && formValue.users.length > 0) {
    formValue.users.forEach((userId: number) => {
      formData.append('users[]', String(userId));
    });
  }

  // 5. إضافة الصورة (تأكد أن formValue.image هو كائن File)
  if (formValue.image) {
    formData.append('image', formValue.image);
  }

  // 6. التعامل مع الـ Update (في الـ Laravel أحياناً بنحتاج _method عشان الـ PUT يشتغل مع الـ FormData)
  if (this.isEditing && this.voucherId) {
    // formData.append('_method', 'PUT'); // فك الكومنت ده لو السيرفر عندك Laravel وبيطلب كده
    this.voucherService.updateVoucher(this.voucherId, formData).subscribe({
      next: () => this.handleSuccess('Updated successfully'),
      error: (error) => this.handleError(error)
    });
  } else {
    this.voucherService.addVoucher(formData).subscribe({
      next: () => this.handleSuccess('Added successfully'),
      error: (error) => this.handleError(error)
    });
  }
}

// دالة مساعدة لتقليل تكرار الكود
private handleSuccess(detail: string): void {
  this.router.navigate(['/dashboard/offers/vouchers']);
  this.messageService.add({ severity: 'success', summary: 'Success', detail });
  this.ngxSpinnerService.hide('actionsLoader');
}

  handleError(error: HttpErrorResponse): void {
    let errorMsg = 'An error occurred';
    if (error.error?.errors) {
      const firstError = Object.values(error.error.errors)[0];
      errorMsg = Array.isArray(firstError) ? firstError[0] : firstError;
    } else if (error.error?.message) {
      errorMsg = error.error.message;
    }
    this.errorMessage.set(errorMsg);
    timer(200).subscribe(() => this.ngxSpinnerService.hide('actionsLoader'));
  }

  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value.trim();
    console.log(this.searchTerm);
    this.searchSubject.next(this.searchTerm);
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  onFileSelect(event: any): void {
    const files = event.files;
    if (files && files.length > 0) {
      const file = files[0];
      this.submitForm.patchValue({ image: file });
    }
  }
  clearImage(): void {
    this.submitForm.patchValue({ image: "" });
  }
}
