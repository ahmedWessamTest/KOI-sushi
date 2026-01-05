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
import { Category } from '../../../../../../core/Interfaces/d-products/IGetProductsCategories';
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
  timer,
} from 'rxjs';
import { OnlyNumberDirective } from '../../../../../../only-number.directive';
import { ActiveUser } from '../res/model/activeUser';
import { PromoCodeService } from '../res/services/promo-code.service';
import { ProductsService } from '../../../../../../core/services/d-products/products.service';
import { CategoriesService } from '../../../../../../core/services/h-category/categories.service';
import { Product } from '../../../../../../core/Interfaces/b-combo/IGetAllComboProducts';

@Component({
  selector: 'app-b-promo-code-id',
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
  ],
  templateUrl: './b-promo-code-id.component.html',
  styleUrl: './b-promo-code-id.component.scss',
  providers: [MessageService, FormsModule],
})
export class BPromoCodeIdComponent implements OnInit {
  submitForm!: FormGroup;
  isEditing = false;
  productsIsLoading = signal<boolean>(false);
  promoCodeId: string | null = null;
  allProducts = signal<Product[]>([]);
  allCategory = signal<any>([]);
  categoryIsLoading = signal<boolean>(false);
  errorMessage = signal<string>('');

  allUsers = signal<ActiveUser[]>([]);

  isLoadingUsers = signal<boolean>(false);
  allCategories = signal<Category[]>([]);
  isLoadingCategories = signal<boolean>(false);

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
    { label: 'Specific users', value: 'limited' },
  ];

  private fb = inject(FormBuilder);

  private searchSubject = new Subject<string>();
  private searchProductsSubject = new Subject<string>();
  private ProductsSearchSubject = new Subject<string>();

  private destroy$ = new Subject<void>();

  private promoCodeService = inject(PromoCodeService);

  private ngxSpinnerService = inject(NgxSpinnerService);

  private router = inject(Router);

  private messageService = inject(MessageService);

  private activatedRoute = inject(ActivatedRoute);
  private SelectedCategoriesIds = signal<number[]>([]);
  private _ProductsService = inject(ProductsService);
  private _CategoriesService = inject(CategoriesService);
  searchTerm = '';

  constructor() {
    this.initializeForm();
  }
  onProductsSearchChange(event: any) {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value.trim();
    this.searchProductsSubject.next(this.searchTerm);
  }
  ngOnInit(): void {
    this.checkEditMode(); // This must be called first to set isEditing and load initial users
    this.loadUsers();
    this.loadCategoris()
    this.setupFormListeners();
    this.fetchProducts();
  }

  initializeForm(): void {
    this.submitForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(3)]],
      use: ['unlimited', Validators.required],
      type: ['percentage', Validators.required],
      value: [0, [Validators.required, Validators.min(0)]],
      min_amount: [0, [Validators.required, Validators.min(0)]],
      apply: ['all', Validators.required],
      limit: [0],
      status: [true, Validators.required],
      users: [[]],
      products_ids: [[]],
      categories_ids: [[]],
      expiration_date: ['', [Validators.required]],
    });
  }

  setupFormListeners(): void {
    // Enable/disable limit field based on use selection
    this.submitForm.get('use')?.valueChanges.subscribe((value) => {
      const limitControl = this.submitForm.get('limited');
      if (value === 'limited') {
        limitControl?.setValidators([Validators.required, Validators.min(1)]);
      } else {
        limitControl?.clearValidators();
        limitControl?.setValue('limited');
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
    this.submitForm.get('categories_ids')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((selectedCatIds: number[]) => {
        this.SelectedCategoriesIds.set(selectedCatIds);

        // --- منطق التنظيف ---
        const currentProductIds = this.submitForm.get('products_ids')?.value as number[];

        if (currentProductIds && currentProductIds.length > 0) {
          // نقوم بفلترة المنتجات المختارة: نبقي فقط على المنتجات التي تنتمي للتصنيفات التي ما زالت مختارة
          const cleanedProductIds = this.allProducts().filter(p =>
            selectedCatIds.includes(p.category_id) && currentProductIds.includes(p.id)
          ).map(p => p.id);

          // إذا كان هناك اختلاف في الطول، يعني أننا حذفنا منتجات تابعة لتصنيف تمت إزالته
          if (cleanedProductIds.length !== currentProductIds.length) {
            this.submitForm.get('products_ids')?.setValue(cleanedProductIds, { emitEvent: false });
          }
        }

        this.fetchProducts();
      });
  }

  checkEditMode(): void {
    const response = this.activatedRoute.snapshot.data['promoCode'];
    if (response && response.promo_code) {
      this.isEditing = true;
      const promoCode = response.promo_code;
      this.promoCodeId = promoCode.id.toString();

      const expDate = promoCode.expiration_date ? new Date(promoCode.expiration_date) : '';

      const userIds = promoCode.users?.map((user: any) => user.id) || [];
      if (promoCode.users) {
        this.allUsers.set(promoCode.users);
      }

      const catIds = promoCode.promo_code_categories?.map((item: any) => item.category_id) || [];

      const prodIds = promoCode.promo_code_categories?.flatMap((catItem: any) =>
        catItem.promo_code_category_excludes?.map((excludeItem: any) => excludeItem.product_id)
      ) || [];

      this.SelectedCategoriesIds.set(catIds);

      this.submitForm.patchValue({
        code: promoCode.code,
        use: promoCode.use,
        type: promoCode.type,
        value: promoCode.value,
        min_amount: promoCode.min_amount,
        apply: promoCode.apply,
        status: promoCode.status,
        expiration_date: expDate, // التاريخ الآن سيظهر في الـ Calendar
        users: userIds,
        categories_ids: catIds, // التصنيفات ستظهر مختارة
        products_ids: prodIds   // المنتجات ستظهر مختارة
      });

      // ملاحظة: لكي تظهر أسماء المنتجات في الـ MultiSelect، يجب استدعاء الـ API الخاص بها
      this.fetchProducts();
    }
  }

  loadUsers(): void {
    if (!this.isEditing || (this.isEditing && this.allUsers().length === 0)) {
      this.searchSubject
        .pipe(
          startWith(""),
          debounceTime(500),
          distinctUntilChanged(),
          switchMap((term) => this.promoCodeService.activeUsers(term)),
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

  fetchProducts(): void {
    this.searchProductsSubject
      .pipe(
        startWith(""),
        tap(() => this.productsIsLoading.set(true)),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((term) => {
          if (this.SelectedCategoriesIds().length === 0) {
            return of({ products: { products: [] } }).pipe(
              finalize(() => this.productsIsLoading.set(false))
            );
          }
          return this._ProductsService.getAllProducts(1, 10, term, this.SelectedCategoriesIds()).pipe(
            finalize(() => this.productsIsLoading.set(false))
          );
        }),
        takeUntil(this.destroy$)
      ).subscribe({
        next: (response: any) => {
          // تحديث الـ Signal بالمنتجات الجديدة
          this.allProducts.set(response.products);
        }
      });
  }

  onCategoryChange(): void {
    this.allProducts.set([]);

    this.submitForm.get('products_ids')?.setValue([]);

    this.searchProductsSubject.next(this.searchTerm);
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
    const formValue = this.submitForm.value;

    
    const selectedProductsObjects = this.allProducts().filter(p =>
      formValue.products_ids.includes(p.id)
    );

    const categoriesPayload = formValue.categories_ids.map((catId: number) => {
      // فلترة المنتجات التي تنتمي لهذا التصنيف فقط
      const excludedForThisCat = selectedProductsObjects
        .filter(p => p.category_id === catId)
        .map(p => p.id);

      return {
        category_id: catId,
        promo_code_category_excludes: excludedForThisCat // ستكون مصفوفة فارغة إذا لم يختر منتج من هذا التصنيف
      };
    });

    // 3. تجهيز الكائن النهائي للإرسال
    const promoCodeData: any = {
      code: formValue.code,
      use: formValue.use,
      type: formValue.type,
      value: Number(formValue.value),
      min_amount: Number(formValue.min_amount),
      apply: formValue.apply,
      status: formValue.status,
      expiration_date: formValue.expiration_date instanceof Date
        ? formValue.expiration_date.toISOString().split('T')[0]
        : formValue.expiration_date,
      users: formValue.users || [],
      promo_code_categories: categoriesPayload
    };

    // 4. تنفيذ طلب الإرسال
    if (this.isEditing && this.promoCodeId) {
      this.promoCodeService.updatePromoCode(this.promoCodeId, promoCodeData).subscribe({
        next: () => this.handleSuccess('Updated successfully'),
        error: (err) => this.handleError(err)
      });
    } else {
      this.promoCodeService.addPromoCode(promoCodeData).subscribe({
        next: () => this.handleSuccess('Added successfully'),
        error: (err) => this.handleError(err)
      });
    }
  }

  // دالة مساعدة للنجاح
  private handleSuccess(msg: string) {
    this.messageService.add({ severity: 'success', summary: 'Success', detail: msg });
    this.ngxSpinnerService.hide('actionsLoader');
    this.router.navigate(['/dashboard/offers/promo-codes']);
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
    this.searchSubject.next(this.searchTerm);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  loadCategoris() {
    this._CategoriesService.getAllCategories().pipe().subscribe({
      next: (response) => {
        this.allCategory.set(response.categories.data);
        this.categoryIsLoading.set(false);
      },
      error: (error) => {
        this.categoryIsLoading.set(false);
        console.error('Error fetching categories:', error);
      },
    });
  }
  onCategorySearchChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value.trim();
    this.ProductsSearchSubject.next(this.searchTerm);
  }
}
