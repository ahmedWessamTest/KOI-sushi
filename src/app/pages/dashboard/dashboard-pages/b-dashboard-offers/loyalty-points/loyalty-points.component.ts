import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { ButtonModule, Button } from 'primeng/button';
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
import {
  Category,
  Product,
} from '../../../../../core/Interfaces/b-combo/IGetAllComboProducts';
import { LoyaltyPointsService } from './res/services/loyalty-points.service';
import { ProductsService } from '../../../../../core/services/d-products/products.service';
import { CategoriesService } from '../../../../../core/services/h-category/categories.service';
import { OnlyNumberDirective } from '../../../../../only-number.directive';
import { LoyaltyPointSetting } from './res/model/iloyalty-point';

@Component({
  selector: 'app-loyalty-points',
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
  templateUrl: './loyalty-points.component.html',
  styleUrl: './loyalty-points.component.scss',
})
export class LoyaltyPointsComponent implements OnInit, OnDestroy {
  submitForm!: FormGroup;
  productsIsLoading = signal<boolean>(false);
  promoCodeId: string | null = null;
  allProducts = signal<Product[]>([]);
  allCategory = signal<any>([]);
  categoryIsLoading = signal<boolean>(false);
  errorMessage = signal<string>('');

  allCategories = signal<Category[]>([]);
  isLoadingCategories = signal<boolean>(false);
  private fb = inject(FormBuilder);

  private searchSubject = new Subject<string>();
  private searchProductsSubject = new Subject<string>();
  private ProductsSearchSubject = new Subject<string>();

  private destroy$ = new Subject<void>();

  private loyaltyPointsService = inject(LoyaltyPointsService);

  private ngxSpinnerService = inject(NgxSpinnerService);

  private messageService = inject(MessageService);

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
    this.loadLoyaltyData();
    this.loadCategoris();
    this.setupFormListeners();
    this.fetchProducts();
  }

  initializeForm(): void {
    this.submitForm = this.fb.group({
      point_value: [0, [Validators.required, Validators.min(0)]],
      spend_cap: [0, [Validators.required, Validators.min(0)]],
      earn_cap: [0, [Validators.required, Validators.min(0)]],
      spend_percentage: [
        0,
        [Validators.required, Validators.min(0), Validators.max(100)],
      ],
      status: [true, Validators.required],
      products_ids: [[]],
      categories_ids: [[]],
    });
  }

  setupFormListeners(): void {
    this.submitForm
      .get('categories_ids')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((selectedCatIds: number[]) => {
        console.log(selectedCatIds);

        this.SelectedCategoriesIds.set(selectedCatIds);

        const currentProductIds = this.submitForm.get('products_ids')
          ?.value as number[];

        if (currentProductIds && currentProductIds.length > 0) {
          const cleanedProductIds = this.allProducts()
            .filter(
              (p) =>
                selectedCatIds.includes(p.category_id) &&
                currentProductIds.includes(p.id),
            )
            .map((p) => p.id);

          if (cleanedProductIds.length !== currentProductIds.length) {
            this.submitForm
              .get('products_ids')
              ?.setValue(cleanedProductIds, { emitEvent: false });
          }
        }
        if (this.SelectedCategoriesIds().length > 0) {
          this.fetchProducts();
        } else {
          this.allProducts.set([]);
        }
      });
  }

  patchForm(loyaltySettings: LoyaltyPointSetting): void {
    const catIds =
      loyaltySettings.loyalty_point_categories?.map(
        (item: any) => item.category_id,
      ) || [];

    const prodIds =
      loyaltySettings.loyalty_point_categories?.flatMap((catItem: any) =>
        catItem.loyalty_point_category_excludes?.map(
          (excludeItem: any) => excludeItem.product_id,
        ),
      ) || [];

    this.SelectedCategoriesIds.set(catIds);

    this.submitForm.patchValue({
      point_value: loyaltySettings.point_value,
      spend_cap: loyaltySettings.spend_cap,
      earn_cap: loyaltySettings.earn_cap,
      spend_percentage: loyaltySettings.spend_percentage,
      status: loyaltySettings.status,
      categories_ids: catIds,
      products_ids: prodIds,
    });
    this.fetchProducts();
  }

  fetchProducts(): void {
    this.searchProductsSubject
      .pipe(
        startWith(''),
        tap(() => this.productsIsLoading.set(true)),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((term) => {
          if (this.SelectedCategoriesIds().length === 0) {
            return of({ products: [] }).pipe(
              finalize(() => this.productsIsLoading.set(false)),
            );
          }
          return this._ProductsService
            .getAllProducts(0, 0, term, this.SelectedCategoriesIds())
            .pipe(finalize(() => this.productsIsLoading.set(false)));
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (response: any) => {
          console.log(response);

          // تحديث الـ Signal بالمنتجات الجديدة
          this.allProducts.set(response.products);
        },
        error: (error) => {
          console.error(error);
          this.allProducts.set([]);
        },
      });
  }

  onCategoryChange(): void {
    this.allProducts.set([]);

    this.submitForm.get('products_ids')?.setValue([]);

    this.searchProductsSubject.next(this.searchTerm);
  }
  loadLoyaltyData() {
    this.loyaltyPointsService.getLoyaltyPointsData().subscribe({
      next: (res) => {
        this.patchForm(res.loyalty_point_setting);
      },
      error: (err) => {
        console.error('error when get loyalty data:', err);
        this.handleError(err);
      },
    });
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
    console.log(this.allProducts());

    const selectedProductsObjects =
      this.allProducts()?.length > 0
        ? this.allProducts().filter((p) =>
            formValue.products_ids.includes(p.id),
          )
        : [];

    const categoriesPayload = formValue.categories_ids.map((catId: number) => {
      const excludedForThisCat = selectedProductsObjects
        .filter((p) => p.category_id === catId)
        .map((p) => p.id);

      return {
        category_id: catId,
        loyalty_point_category_excludes: excludedForThisCat,
      };
    });

    // 3. تجهيز الكائن النهائي للإرسال
    const promoCodeData: any = {
      point_value: Number(formValue.point_value),
      spend_cap: Number(formValue.spend_cap),
      earn_cap: Number(formValue.earn_cap),
      spend_percentage: Number(formValue.spend_percentage),
      status: formValue.status ? 1 : 0,
      loyalty_point_categories: categoriesPayload,
    };
    this.loyaltyPointsService.updateLoyaltyPoints(promoCodeData).subscribe({
      next: () => this.handleSuccess('Updated successfully'),
      error: (err) => this.handleError(err),
    });
  }

  // دالة مساعدة للنجاح
  private handleSuccess(msg: string) {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: msg,
    });
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
    this.searchSubject.next(this.searchTerm);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  loadCategoris() {
    this._CategoriesService
      .getAllCategories()
      .pipe()
      .subscribe({
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
