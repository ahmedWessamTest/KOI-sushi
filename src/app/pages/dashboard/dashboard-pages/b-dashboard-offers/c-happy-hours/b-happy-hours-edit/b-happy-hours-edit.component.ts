import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { InputSwitchModule } from 'primeng/inputswitch';
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
import { HappyHoursService } from '../../../../../../core/services/c-happy-hours/happy-hours.service';
import { ToastModule } from 'primeng/toast';
import { Product } from '../../../../../../core/Interfaces/b-combo/IGetAllComboProducts';
import { MultiSelectModule } from 'primeng/multiselect';
import { ProductsService } from '../../../../../../core/services/d-products/products.service';
import { CategoriesService } from '../../../../../../core/services/h-category/categories.service';
import { HappyHour } from '../../../../../../core/Interfaces/c-happy-hours/ihappy-hours';

@Component({
  selector: 'app-d-category-add',
  standalone: true,
  imports: [
    ButtonModule,
    CardModule,
    InputSwitchModule,
    DialogModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    ToastModule,
    MultiSelectModule,
  ],
  templateUrl: './b-happy-hours-edit.component.html',
  styleUrl: './b-happy-hours-edit.component.scss',
})
export class BHappyHoursEditAddComponent {
  submitForm: FormGroup;
  allProducts = signal<Product[]>([]);
  productsIsLoading = signal<boolean>(false);
  private searchSubject = new Subject<string>();
  allCategory = signal<any>([]);
  categoryIsLoading = signal<boolean>(false);
  private SelectedCategoriesIds = signal<number[]>([]);
  searchTerm = '';
  private searchProductsSubject = new Subject<string>();
  private ProductsSearchSubject = new Subject<string>();
  isEditing = false;

  happyHoursById: number | null = null;
  private destroy$ = new Subject<void>();
  private fb = inject(FormBuilder);

  private happyHoursService = inject(HappyHoursService);

  private ngxSpinnerService = inject(NgxSpinnerService);
  private _ProductsService = inject(ProductsService);
  private _CategoriesService = inject(CategoriesService);
  private router = inject(Router);

  private messageService = inject(MessageService);

  private activatedRoute = inject(ActivatedRoute);

  constructor() {
    this.submitForm = this.fb.group(
      {
        start_time: ['', Validators.required],
        end_time: ['', Validators.required],
        products_ids: [[]],
        categories_ids: [[]],
        status: [false],
        discount_percentage: [
          '',
          [
            Validators.required,
            Validators.min(1),
            Validators.max(100),
            Validators.pattern(/^[0-9]+$/),
          ],
        ],
      },
      {
        validators: this.timeRangeValidator,
      },
    );
  }

  ngOnInit() {
    this.loadCategoris();
    this.fetchProducts();
    this.checkEditMode();
    this.setupFormListeners();
  }
  checkEditMode(): void {
    const happyHourData: HappyHour =
      this.activatedRoute.snapshot.data['happyHours'].happy_hour;

    if (happyHourData) {
      this.happyHoursById = happyHourData.id;
      this.isEditing = true;

      const catIds =
        happyHourData.happy_hour_categories?.map(
          (item: any) => item.category_id,
        ) || [];

      const prodIds =
        happyHourData.happy_hour_categories?.flatMap((catItem: any) =>
          catItem.happy_hour_category_excludes?.map(
            (excludeItem: any) => excludeItem.product_id,
          ),
        ) || [];

      this.SelectedCategoriesIds.set(catIds);

      this.submitForm.patchValue({
        status: happyHourData.status,
        start_time: happyHourData.start_time,
        end_time: happyHourData.end_time,
        discount_percentage: happyHourData.discount_percentage,
        categories_ids: catIds,
        products_ids: prodIds,
      });

      this.fetchProducts();
    }
  }
  setupFormListeners(): void {
    this.submitForm
      .get('categories_ids')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((selectedCatIds: number[]) => {
        this.SelectedCategoriesIds.set(selectedCatIds);

        // --- منطق التنظيف ---
        const currentProductIds = this.submitForm.get('products_ids')
          ?.value as number[];

        if (currentProductIds && currentProductIds.length > 0) {
          // نقوم بفلترة المنتجات المختارة: نبقي فقط على المنتجات التي تنتمي للتصنيفات التي ما زالت مختارة
          const cleanedProductIds = this.allProducts()
            .filter(
              (p) =>
                selectedCatIds.includes(p.category_id) &&
                currentProductIds.includes(p.id),
            )
            .map((p) => p.id);

          // إذا كان هناك اختلاف في الطول، يعني أننا حذفنا منتجات تابعة لتصنيف تمت إزالته
          if (cleanedProductIds.length !== currentProductIds.length) {
            this.submitForm
              .get('products_ids')
              ?.setValue(cleanedProductIds, { emitEvent: false });
          }
        }

        this.fetchProducts();
      });
  }

  saveForm() {
    this.submitForm.markAllAsTouched();
    if (this.submitForm.invalid) return;
    this.ngxSpinnerService.show('actionsLoader');
    this.messageService.clear();
    const formValue = this.submitForm.value;
    const selectedProductsObjects =
      this.allProducts().length > 0
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
        happy_hour_category_excludes: excludedForThisCat, // ستكون مصفوفة فارغة إذا لم يختر منتج من هذا التصنيف
      };
    });
    const happyHourData = {
      start_time: formValue.start_time,
      end_time: formValue.end_time,
      status: formValue.status,
      discount_percentage: formValue.discount_percentage,
      happy_hour_categories: categoriesPayload,
    };
    this.happyHoursService
      .updateHappyHoursById(happyHourData, this.happyHoursById)
      .subscribe({
        next: () => {
          this.router.navigate([
            '/dashboard/offers/happy-hours/happy-hours-index',
          ]);
          this.messageService.add({
            severity: 'success',
            summary: 'Updated',
            detail: 'Happy hours updated successfully',
          });
          timer(200).subscribe(() =>
            this.ngxSpinnerService.hide('actionsLoader'),
          );
        },
      });
  }
  timeRangeValidator(form: FormGroup) {
    const start = form.get('start_time')?.value;
    const end = form.get('end_time')?.value;

    if (!start || !end) return null;

    const startDate = new Date(`1970-01-01T${start}`);
    const endDate = new Date(`1970-01-01T${end}`);

    return startDate < endDate ? null : { timeOrderInvalid: true };
  }
  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value.trim();
    this.searchSubject.next(this.searchTerm);
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
  onCategorySearchChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value.trim();
    this.ProductsSearchSubject.next(this.searchTerm);
  }
  onProductsSearchChange(event: any) {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value.trim();
    this.searchProductsSubject.next(this.searchTerm);
  }
}
