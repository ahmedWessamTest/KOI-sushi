import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputSwitchModule } from 'primeng/inputswitch';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { timer } from 'rxjs';
import {
  Choice,
  IGetProductById,
} from '../../../../../../core/Interfaces/d-products/IGetProductById';
import { ProductsService } from '../../../../../../core/services/d-products/products.service';
import { LoadingDataBannerComponent } from '../../../../../../shared/components/loading-data-banner/loading-data-banner.component';
import { NoDataFoundBannerComponent } from '../../../../../../shared/components/no-data-found-banner/no-data-found-banner.component';

@Component({
  selector: 'app-e-products-choices',
  standalone: true,
  imports: [
    ButtonModule,
    DialogModule,
    ReactiveFormsModule,
    TableModule,
    FormsModule,
    DropdownModule,
    ToastModule,
    InputSwitchModule,
    RouterLink,
    NoDataFoundBannerComponent,
    LoadingDataBannerComponent,
  ],
  templateUrl: './e-products-choices.component.html',
  styleUrl: './e-products-choices.component.scss',
  providers: [MessageService],
})
export class EProductsChoicesComponent {
  options!: Choice[];

  product!: { title_en: string; id: number };

  private activatedRoute = inject(ActivatedRoute);

  private route = inject(Router);

  loading = false;

  private ngxSpinnerService = inject(NgxSpinnerService);

  private messageService = inject(MessageService);

  private productsService = inject(ProductsService);

  ngOnInit(): void {
    this.loadChoices();
  }

  loadChoices(): void {
    this.activatedRoute.paramMap.subscribe((params) => {
      this.productsService.getOptions(params.get('id')!).subscribe({
        next: (response) => {
          this.product = response.product;
          this.options = response.productOptions.data;
        },
      });
    });
  }

  // Toggle Product
  toggleProductStatus(option: Choice) {
    this.ngxSpinnerService.show('actionsLoader');
    this.messageService.clear();
    console.log(option);

    const updatedStatus = option.status ? 0 : 1; // Toggle between 0 and 1
    this.productsService
      .toggleOptionStatus(this.product.id, option.id)
      .subscribe(() => {
        option.status = Boolean(updatedStatus); // Update the UI immediately
        this.messageService.add({
          severity: 'success',
          summary: 'Updated',
          detail: `Product ${updatedStatus ? 'Enabled' : 'Disabled'} successfully`,
        });
        timer(200).subscribe(() =>
          this.ngxSpinnerService.hide('actionsLoader'),
        );
      });
  }

  editPicePrice(picePrice: any) {
    localStorage.setItem('choices', JSON.stringify(picePrice));
    this.route.navigate([
      `/dashboard/menu/products/products-choice-edit/${this.product.id}`,
    ]);
  }
}
