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
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule } from 'primeng/fileupload';
import { InputSwitchModule } from 'primeng/inputswitch';
import { OnlyNumberDirective } from '../../../../../../only-number.directive';
import { Category } from '../../../../../../core/Interfaces/c-hot-boxes/IGetBoxById';
import { ProductsService } from '../../../../../../core/services/d-products/products.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { MultiSelectModule } from 'primeng/multiselect';
import { CombosService } from '../../../../../../core/services/d-combos/combos.service';

@Component({
  selector: 'app-b-add-combo',
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
    CommonModule,
    OnlyNumberDirective,
    MultiSelectModule,
  ],
  templateUrl: './b-add-combo.component.html',
  styleUrl: './b-add-combo.component.scss',
})
export class BAddComboComponent {
  submitForm!: FormGroup;

  categories!: Category[];

  isEditing = false;
  productsByRow: any[] = [];
  productId: string | null = null;

  private fb = inject(FormBuilder);

  private productsService = inject(ProductsService);
  private combosService = inject(CombosService);

  private ngxSpinnerService = inject(NgxSpinnerService);

  private router = inject(Router);

  private messageService = inject(MessageService);

  private activatedRoute = inject(ActivatedRoute);

  errorMessage: string = '';

  private initializeForm() {
    this.submitForm = this.fb.group({
      price: ['', Validators.required],
      pieces: ['', Validators.required],
      title_en: ['', Validators.required],
      title_ar: ['', Validators.required],
      combo_categories: this.fb.array(
        [],
        [Validators.required, Validators.minLength(1)],
      ),
    });
  }

  ngOnInit() {
    this.initializeForm();
    this.categories =
      this.activatedRoute.snapshot.data['categories'].categories.data;

    if (this.activatedRoute.snapshot.data['combo']) {
      this.isEditing = true;
      const combo = this.activatedRoute.snapshot.data['combo'].data;
      this.productId = combo.id; // Store ID for update

      this.submitForm.patchValue({
        price: combo.price,
        pieces: combo.pieces,
        title_en: combo.title_en,
        title_ar: combo.title_ar,
      });

      if (combo.combo_categories && combo.combo_categories.length > 0) {
        this.clearFormArray(this.comboCategoryArray);
        this.productsByRow = [];

        combo.combo_categories.forEach((cat: any, index: number) => {
          this.addPiecePrice();

          const group = this.comboCategoryArray.at(index) as FormGroup;
          group.patchValue({
            category_id: cat.category_id,
            limit: cat.limit,
            combo_category_excludes: cat.combo_category_excludes
              ? cat.combo_category_excludes.map((e: any) => e.product_id)
              : [],
          });

          this.onCategoryChange(cat.category_id, index, true);
        });
      }

      if (combo.price === null || combo.price === 0) {
        // Check if price is optional/zero
        // Logic for optional price if needed, or based on existing logic
      }
    }

    this.submitForm
      .get('piece_price_state')
      ?.valueChanges.subscribe((value) => {
        this.addPiecePrice();

        if (value === 0) {
          this.clearFormArray(this.comboCategoryArray);
          this.makePriceRequired();
        } else {
          this.makePriceOptional();
        }
        if (
          this.isEditing &&
          this.submitForm.get('piece_price_state')?.value === 0
        ) {
        }
      });

    this.submitForm.get('pieces')?.valueChanges.subscribe((pieces) => {
      this.updateAllLimitsMax(pieces);
    });
  }

  private updateAllLimitsMax(pieces: number) {
    const piecesCount = Number(pieces) || 0;
    this.comboCategoryArray.controls.forEach((control: FormGroup) => {
      const limitControl = control.get('limit');
      if (limitControl) {
        limitControl.setValidators([
          Validators.required,
          Validators.max(piecesCount),
        ]);
        limitControl.updateValueAndValidity();
      }
    });
  }

  private clearFormArray(formArray: FormArray) {
    while (formArray.length > 0) {
      formArray.removeAt(0);
    }
  }

  private makePriceOptional() {
    const priceControl = this.submitForm.get('price');
    priceControl?.clearValidators();
    priceControl?.updateValueAndValidity(); // <- update here, not the whole form
  }

  private makePriceRequired() {
    const priceControl = this.submitForm.get('price');
    priceControl?.setValidators(Validators.required);
    priceControl?.updateValueAndValidity(); // <- update here too
  }

  saveForm() {
    this.submitForm.markAllAsTouched();
    if (this.submitForm.invalid) return;

    this.ngxSpinnerService.show('actionsLoader');
    const formValue = this.submitForm.value;

    const payload = {
      ...formValue,
      combo_categories: formValue.combo_categories.map((cat: any) => ({
        category_id: cat.category_id,
        limit: Number(cat.limit),
        combo_category_excludes: cat.combo_category_excludes, // مصفوفة الـ IDs
      })),
    };

    const request =
      this.isEditing && this.productId
        ? this.combosService.updateCombo(this.productId, payload)
        : this.combosService.addCombo(payload);

    request.subscribe({
      next: () => {
        this.ngxSpinnerService.hide('actionsLoader');
        this.router.navigate(['/dashboard/menu/combos/combos-index']);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Saved Successfully',
        });
      },
      error: (err) => {
        this.ngxSpinnerService.hide('actionsLoader');
        this.errorMessage = 'Error occurred while saving';
      },
    });
  }

  // Accessors for FormArrays
  get comboCategoryArray(): any {
    return this.submitForm.get('combo_categories') as any;
  }

  // Methods to add inputs dynamically
  addPiecePrice() {
    const pieces = this.submitForm.get('pieces')?.value || '';
    const group = this.fb.group({
      category_id: [null, Validators.required],
      limit: [
        pieces,
        [Validators.required, Validators.max(Number(pieces) || 0)],
      ],
      combo_category_excludes: [[]],
    });

    this.comboCategoryArray.push(group);
    this.productsByRow.push([]);
  }
  loadingProducts = false;
  onCategoryChange(
    categoryId: number,
    index: number,
    isInitialLoad: boolean = false,
  ) {
    if (!categoryId) return;

    if (!isInitialLoad) {
      const group = this.comboCategoryArray.at(index);
      group.get('combo_category_excludes')?.setValue([]);
      this.productsByRow[index] = [];
    }

    this.ngxSpinnerService.show('loadingProducts' + index);
    // استدعاء الخدمة لجلب المنتجات بناءً على الـ categoryId
    this.loadingProducts = true;
    this.productsService
      .getAllProducts(0, 0, '', [categoryId])
      .pipe()
      .subscribe({
        next: (res: any) => {
          this.productsByRow[index] = res.products || [];
          this.ngxSpinnerService.hide('loadingProducts' + index);
          this.loadingProducts = false;
        },
        error: () => {
          this.ngxSpinnerService.hide('loadingProducts' + index);
          this.loadingProducts = false;
        },
      });
  }
  // Remove item from FormArray
  removePiecePrice(index: number) {
    this.comboCategoryArray.removeAt(index);
    this.productsByRow.splice(index, 1); // حذف مصفوفة المنتجات الخاصة بهذا الصف
  }
}
