import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputSwitchModule } from 'primeng/inputswitch';
import { MultiSelectModule } from 'primeng/multiselect';
import { FileUploadModule } from "primeng/fileupload";
import {
  debounceTime,
  distinctUntilChanged,
  finalize,
  of,
  startWith,
  Subject,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';

import { OnlyNumberDirective } from '../../../../../../only-number.directive';
import { ActiveUser } from '../res/model/activeUser';
import { Product } from '../../../../../../core/Interfaces/b-combo/IGetAllComboProducts';
import { VoucherService } from '../res/services/voucher.service';
import { ProductsService } from '../../../../../../core/services/d-products/products.service';
import { CategoriesService } from '../../../../../../core/services/h-category/categories.service';

@Component({
  selector: 'app-b-voucher-id',
  standalone: true,
  imports: [
    CommonModule, ButtonModule, CardModule, InputSwitchModule, DialogModule,
    FormsModule, ReactiveFormsModule, DropdownModule, OnlyNumberDirective,
    MultiSelectModule, CalendarModule, FileUploadModule
  ],
  templateUrl: './b-voucher-id.component.html',
  styleUrl: './b-voucher-id.component.scss',
  providers: [MessageService],
})
export class BVoucherIdComponent implements OnInit, OnDestroy {
  submitForm!: FormGroup;
  isEditing = false;
  voucherId: string | null = null;
  searchTerm = '';

  // Signals
  allProducts = signal<Product[]>([]);
  allCategory = signal<any>([]);
  allUsers = signal<ActiveUser[]>([]);
  productsIsLoading = signal<boolean>(false);
  categoryIsLoading = signal<boolean>(false);
  isLoadingUsers = signal<boolean>(false);
  errorMessage = signal<string>('');
  private SelectedCategoriesIds = signal<number[]>([]);

  // Subjects
  private searchSubject = new Subject<string>();
  private searchProductsSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  // Injections
  private fb = inject(FormBuilder);
  private voucherService = inject(VoucherService);
  private _ProductsService = inject(ProductsService);
  private _CategoriesService = inject(CategoriesService);
  private ngxSpinnerService = inject(NgxSpinnerService);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private activatedRoute = inject(ActivatedRoute);

  // Options
  useOptions = [{ label: 'Multi Use', value: 'unlimited' }, { label: 'One Use', value: 'once' }];
  typeOptions = [{ label: 'Percentage', value: 'percentage' }, { label: 'Fixed Amount', value: 'fixed' }];
  applyOptions = [{ label: 'All Users', value: 'all' }, { label: 'Specific users', value: 'specific' }];

  constructor() {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.checkEditMode();
    this.loadUsers();
    this.loadCategories();
    this.setupFormListeners();
    this.fetchProducts();
  }

  initializeForm(): void {
    this.submitForm = this.fb.group({
      title_ar: ['', [Validators.required, Validators.minLength(3)]],
      title_en: ['', [Validators.required, Validators.minLength(3)]],
      use: ['unlimited', Validators.required],
      type: ['percentage', Validators.required],
      value: [0, [Validators.required, Validators.min(0)]],
      min_amount: [0, [Validators.required, Validators.min(0)]],
      apply: ['all', Validators.required],
      limit: [0],
      status: [1, Validators.required],
      users: [[]],
      products_ids: [[]],
      categories_ids: [[]],
      expiration_date: ['', [Validators.required]],
    });
  }

  setupFormListeners(): void {
    this.submitForm.get('use')?.valueChanges.subscribe((value) => {
      const limitControl = this.submitForm.get('limit');
      if (value === 'specific') {
        limitControl?.setValidators([Validators.required, Validators.min(1)]);
      } else {
        limitControl?.clearValidators();
        limitControl?.setValue(0);
      }
      limitControl?.updateValueAndValidity();
    });

    // 2. مراقبة نوع التطبيق (مستخدمين معينين)
    this.submitForm.get('apply')?.valueChanges.subscribe((value) => {
      const usersControl = this.submitForm.get('users');
      if (value === 'specific') {
        usersControl?.setValidators([Validators.required]);
      } else {
        usersControl?.clearValidators();
        usersControl?.setValue([]);
      }
      usersControl?.updateValueAndValidity();
    });

    // 3. مراقبة التصنيفات لتنظيف المنتجات المحددة
    this.submitForm.get('categories_ids')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((selectedCatIds: number[]) => {
        this.SelectedCategoriesIds.set(selectedCatIds);
        const currentProductIds = this.submitForm.get('products_ids')?.value as number[];

        if (currentProductIds?.length > 0) {
          const cleanedIds = this.allProducts().filter(p =>
            selectedCatIds.includes(p.category_id) && currentProductIds.includes(p.id)
          ).map(p => p.id);

          if (cleanedIds.length !== currentProductIds.length) {
            this.submitForm.get('products_ids')?.setValue(cleanedIds, { emitEvent: false });
          }
        }
        this.fetchProducts();
      });
  }

  fetchProducts(): void {
    this.searchProductsSubject.pipe(
      startWith(""),
      tap(() => this.productsIsLoading.set(true)),
      debounceTime(500),
      distinctUntilChanged(),
      switchMap((term) => {
        if (this.SelectedCategoriesIds().length === 0) {
          return of({ products: [] }).pipe(finalize(() => this.productsIsLoading.set(false)));
        }
        return this._ProductsService.getAllProducts(1, 10, term, this.SelectedCategoriesIds()).pipe(
          finalize(() => this.productsIsLoading.set(false))
        );
      }),
      takeUntil(this.destroy$)
    ).subscribe((response: any) => {
      // ندمج المنتجات الجديدة مع القديمة المختارة لضمان بقاء الـ Labels في حالة التعديل
      const currentProducts = this.allProducts();
      const newProducts = response.products.data || [];
      const merged = [...newProducts];
      currentProducts.forEach(p => {
        if (!merged.find(m => m.id === p.id)) merged.push(p);
      });
      this.allProducts.set(merged);
    });
  }

  checkEditMode(): void {
    const voucherData = this.activatedRoute.snapshot.data['voucher'];
    if (voucherData) {
      this.isEditing = true;
      const voucher = voucherData.voucher;
      this.voucherId = voucher.id.toString();

      if (voucher.users) this.allUsers.set(voucher.users);

      const catIds = voucher.voucher_categories?.map((item: any) => item.category_id) || [];
      const prodIds = voucher.voucher_categories?.flatMap((cat: any) =>
        cat.voucher_category_excludes?.map((ex: any) => ex.product_id)
      ) || [];

      this.SelectedCategoriesIds.set(catIds);

      this.submitForm.patchValue({
        ...voucher,
        expiration_date: voucher.expiration_date ? new Date(voucher.expiration_date) : '',
        users: voucher.users?.map((u: any) => u.id) || [],
        categories_ids: catIds,
        products_ids: prodIds,
      });

      this.fetchProducts();
    }
  }

  saveForm(): void {
    this.submitForm.markAllAsTouched();
    if (this.submitForm.invalid) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Validation failed' });
      return;
    }

    this.ngxSpinnerService.show('actionsLoader');
    const formValue = this.submitForm.value;
    const formData = new FormData();

    // 1. معالجة التاريخ والبيانات الأساسية
    const expirationDate = formValue.expiration_date instanceof Date
      ? formValue.expiration_date.toISOString().split('T')[0]
      : formValue.expiration_date;

    // 2. بناء الـ Payload الخاص بالتصنيفات والمنتجات
    const selectedProds = this.allProducts().filter(p => formValue.products_ids.includes(p.id));
    const categoriesPayload = formValue.categories_ids.map((catId: number) => ({
      category_id: catId,
      voucher_category_excludes: selectedProds.filter(p => p.category_id === catId).map(p => p.id)
    }));

    // 3. تعبئة FormData بالحقول النصية
    formData.append('title_ar', formValue.title_ar);
    formData.append('title_en', formValue.title_en);
    formData.append('use', formValue.use);
    formData.append('type', formValue.type);
    formData.append('value', String(formValue.value));
    formData.append('min_amount', String(formValue.min_amount));
    formData.append('apply', formValue.apply);
    formData.append('limit', String(formValue.limit));
    formData.append('status', String(formValue.status ? 1 : 0));
    formData.append('expiration_date', expirationDate);

    // --- التعديل المطلوب هنا للـ Users ---
    // نقوم بتحويل مصفوفة الـ IDs إلى JSON string لضمان وصولها كـ Array تحت مفتاح "users"
    if (formValue.users && formValue.users.length > 0) {
      formValue.users.forEach((userId: number) => {
        formData.append('users[]', String(userId));
      })
    }

    // إضافة التصنيفات كـ JSON أيضاً
    if (categoriesPayload.length > 0) {
      categoriesPayload.forEach((item: any, index: number) => {
        // إرسال ID التصنيف
        formData.append(`voucher_categories[${index}][category_id]`, String(item.category_id));

        // إرسال مصفوفة المنتجات المستثناة داخل هذا التصنيف
        if (item.voucher_category_excludes && item.voucher_category_excludes.length > 0) {
          item.voucher_category_excludes.forEach((productId: number, pIndex: number) => {
            formData.append(`voucher_categories[${index}][voucher_category_excludes][${pIndex}]`, String(productId));
          });
        }
      });
    }

    // 4. إرسال الطلب
    const request = (this.isEditing && this.voucherId)
      ? this.voucherService.updateVoucher(this.voucherId, formData)
      : this.voucherService.addVoucher(formData);

    request.subscribe({
      next: () => this.handleSuccess(this.isEditing ? 'Updated' : 'Added'),
      error: (err) => this.handleError(err)
    });
  }

  // الدوال المساعدة
  loadUsers(): void {
    this.searchSubject.pipe(
      startWith(""),
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(term => this.voucherService.activeUsers(term)),
      takeUntil(this.destroy$)
    ).subscribe(res => {
      this.allUsers.set(res.data.data);
    });
  }

  loadCategories(): void {
    this._CategoriesService.getAllCategories().subscribe(res => {

      this.allCategory.set(res.categories.data);
    });
  }



  onProductsSearchChange(event: any) {
    this.searchTerm = event.target.value.trim();
    this.searchProductsSubject.next(this.searchTerm);
  }

  private handleSuccess(msg: string) {
    this.messageService.add({ severity: 'success', summary: 'Success', detail: msg });
    this.ngxSpinnerService.hide('actionsLoader');
    this.router.navigate(['/dashboard/offers/vouchers']);
  }

  private handleError(error: HttpErrorResponse) {
    this.ngxSpinnerService.hide('actionsLoader');
    this.errorMessage.set(error.error?.message || 'Error occurred');
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
}