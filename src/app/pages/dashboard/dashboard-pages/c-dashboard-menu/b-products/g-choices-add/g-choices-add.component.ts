import { Component, inject } from '@angular/core';
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
import { timer } from 'rxjs';
import { PiecesPrice } from '../../../../../../core/Interfaces/d-products/IGetProductById';
import { IAddCategoryBody } from '../../../../../../core/Interfaces/h-category/IAddCategoryBody';
import { ProductsService } from '../../../../../../core/services/d-products/products.service';
import { DropdownModule } from 'primeng/dropdown';
import { OnlyNumberDirective } from '../../../../../../only-number.directive';
@Component({
  selector: 'app-g-choices-add',
  standalone: true,
  imports: [
    ButtonModule,
    CardModule,
    InputSwitchModule,
    DialogModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    DropdownModule,
    OnlyNumberDirective,
  ],
  templateUrl: './g-choices-add.component.html',
  styleUrl: './g-choices-add.component.scss',
  providers: [MessageService],
})
export class GChoicesAddComponent {
  submitForm: FormGroup;

  isEditing = false;

  productId: string = '';
  optionId:string = ''
  private fb = inject(FormBuilder);

  private productsService = inject(ProductsService);

  private ngxSpinnerService = inject(NgxSpinnerService);

  private router = inject(Router);

  private messageService = inject(MessageService);

  private activatedRoute = inject(ActivatedRoute);
  typeOptions = [
    { label: 'Pieces', value: 'pieces' },
    { label: 'Single', value: 'single' },
  ];

  private piceDetails!: PiecesPrice;

  constructor() {
    this.submitForm = this.fb.group({
      title_ar: ['', [Validators.required]],
      title_en: ['', [Validators.required]],
      price: [null, [Validators.required, Validators.min(0)]],
      type: ['', [Validators.required]],
      quantity: [1],
      status: [1, [Validators.required]],
    });
  }

  ngOnInit() {
    this.setupFormListeners();
    if (this.activatedRoute.snapshot.data['products']) {
      if (this.router.url.includes('edit')) {
        this.isEditing = true;
        this.piceDetails = JSON.parse(localStorage.getItem('choices')!);
        console.log(localStorage.getItem('choices'));
        this.patchEditValues()
      }
      this.productId = this.activatedRoute.snapshot.data['products'].data.id;
    }
  }
  patchEditValues():void {
    const choiceData = JSON.parse(localStorage.getItem('choices')!);
    this.optionId = choiceData.id;
    choiceData.status = Number(choiceData.status)
    choiceData
    this.submitForm.patchValue(
          choiceData
        );
  } 
  setupFormListeners(): void {
    this.submitForm.get('type')?.valueChanges.subscribe((value) => {
      const quantityControl = this.submitForm.get('quantity');
      if (value == 'pieces') {
        quantityControl?.setValidators([Validators.required, Validators.min(2)]);
      } else {
        quantityControl?.clearValidators();
        quantityControl?.setValue(1);
      }
      console.log(quantityControl?.value);
      
    });
  }
  saveForm() {
    if (this.submitForm.invalid) return;
    this.ngxSpinnerService.show('actionsLoader');
    this.messageService.clear();
    const optionData: any = this.submitForm.value;
    optionData.status = Boolean(optionData.status)
    if (this.isEditing) {
      this.productsService.updateOption(this.productId,this.optionId, optionData).subscribe(() => {
        this.router.navigate(["/dashboard/menu/products/products-choice/" + this.productId]);
        this.messageService.add({ severity: "success", summary: "Updated", detail: "Category updated successfully" });
        timer(200).subscribe(() => this.ngxSpinnerService.hide("actionsLoader"));
      });
    } else {
      this.productsService
        .addOption(this.productId, optionData)
        .subscribe(() => {
          this.router.navigate([
            '/dashboard/menu/products/products-choice/' + this.productId,
          ]);
          this.messageService.add({
            severity: 'success',
            summary: 'Added',
            detail: 'option added successfully',
          });
          timer(200).subscribe(() =>
            this.ngxSpinnerService.hide('actionsLoader')
          );
        });
    }
  }
  isInvalid(controlName: string): boolean {
  const control = this.submitForm.get(controlName);
  return !!(control && control.invalid && (control.touched || control.dirty));
}
}
