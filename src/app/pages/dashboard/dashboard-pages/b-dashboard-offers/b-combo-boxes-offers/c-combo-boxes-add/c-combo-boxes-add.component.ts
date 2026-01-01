import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";
import { MessageService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { DialogModule } from "primeng/dialog";
import { DropdownModule } from "primeng/dropdown";
import { FileUploadModule } from "primeng/fileupload";
import { InputSwitchModule } from "primeng/inputswitch";
import { timer } from "rxjs";
import { Category } from "../../../../../../core/Interfaces/h-category/ICategoryById";
import { ProductsService } from "../../../../../../core/services/d-products/products.service";
import { ComboService } from "../../../../../../core/services/b-combo/combo.service";
import { OnlyNumberDirective } from "../../../../../../only-number.directive";

@Component({
  selector: "app-c-combo-boxes-add",
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
  ],
  templateUrl: "./c-combo-boxes-add.component.html",
  styleUrl: "./c-combo-boxes-add.component.scss",
  providers: [MessageService],
})
export class CComboBoxesAddComponent {
  submitForm!: FormGroup;

  categories!: Category[];

  isEditing = false;

  productId: string | null = null;

  private fb = inject(FormBuilder);

  private comboService = inject(ComboService);

  private ngxSpinnerService = inject(NgxSpinnerService);

  private router = inject(Router);

  private messageService = inject(MessageService);

  private activatedRoute = inject(ActivatedRoute);

  isUnlimited: boolean[] = []; // Track unlimited state

  private initializeForm() {
    this.submitForm = this.fb.group({
      limit_object: this.fb.array([
        this.fb.group({
          category_id: [5, Validators.required],
          limit_count: [100, Validators.required],
        }),
      ]),
      en_name: ["", Validators.required],
      ar_name: ["", Validators.required],
      pieces: [null, Validators.required],
      prices: [null, Validators.required],
      status: [1, Validators.required],
    });

    this.isUnlimited = [false]; // Initialize tracking
    this.addPiecePrice();
  }

  ngOnInit() {
    this.initializeForm();
    this.categories = this.activatedRoute.snapshot.data["category"].categories.filter(
      (response: Category) => response.id !== 25
    );

    if (this.activatedRoute.snapshot.data["comboOffers"]) {
      this.isEditing = true;
      this.productId = this.activatedRoute.snapshot.data["comboOffers"].combo.id;
      const product = this.activatedRoute.snapshot.data["comboOffers"];

      this.submitForm.patchValue(product.combo);

      // Patch piece_price_array properly
      this.patchPiecePriceArray(product.combo.limits || []);
    }

    // Ensure at least one limit_object exists
    if (this.limit_object.length === 0) {
      this.addPiecePrice();
    }

    // Listen for value changes to prevent removal of all limit_object items
    this.submitForm.get("limit_object")?.valueChanges.subscribe((value) => {
      if (value.length === 0) {
        this.addPiecePrice();
      }
    });
  }

  saveForm() {
    this.submitForm.markAllAsTouched();
    const fd = new FormData();

    if (this.submitForm.invalid) return;
    this.ngxSpinnerService.show("actionsLoader");
    this.messageService.clear();

    Object.keys(this.submitForm.value).forEach((key) => {
      if (key !== "limit_object") {
        fd.append(key, this.submitForm.value[key]);
      } else if (key === "limit_object") {
        fd.append(key, JSON.stringify(this.submitForm.value[key])); // Convert to JSON string
      }
    });

    if (this.isEditing && this.productId) {
      this.comboService.updateComboOffer(this.productId, fd).subscribe(() => {
        this.router.navigate(["/dashboard/offers/combo/combo-index"]);
        this.messageService.add({ severity: "success", summary: "Updated", detail: "Combo updated successfully" });
        timer(200).subscribe(() => this.ngxSpinnerService.hide("actionsLoader"));
      });
    } else {
      this.comboService.addComboOffer(fd).subscribe(() => {
        this.router.navigate(["/dashboard/offers/combo/combo-index"]);
        this.messageService.add({ severity: "success", summary: "Added", detail: "Combo added successfully" });
        timer(200).subscribe(() => this.ngxSpinnerService.hide("actionsLoader"));
      });
    }
  }

  // Accessors for FormArrays
  get limit_object(): any {
    return this.submitForm.get("limit_object") as any;
  }

  // Methods to add inputs dynamically
  addPiecePrice() {
    this.limit_object.push(
      this.fb.group({
        category_id: [null, Validators.required],
        limit_count: [null, Validators.required],
      })
    );
  }

  // Patch the piece price array dynamically
  private patchPiecePriceArray(piecePrices: any[]) {
    this.limit_object.clear();
    piecePrices.forEach((item) => {
      this.limit_object.push(
        this.fb.group({
          category_id: [item.category_id, Validators.required],
          limit_count: [item.limit_count, Validators.required],
        })
      );
    });
  }

  // Remove item from FormArray
  removePiecePrice(index: number) {
    this.limit_object.removeAt(index);
  }

  setUnlimited(index: number) {
    this.limit_object.at(index).patchValue({ limit_count: 100 });
  }

  enableLimit(index: number) {
    this.limit_object.at(index).patchValue({ limit_count: null }); // Reset to let the user input a limit
  }
}
