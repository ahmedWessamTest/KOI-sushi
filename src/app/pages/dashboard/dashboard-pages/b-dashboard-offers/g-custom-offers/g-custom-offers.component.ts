import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputSwitchModule } from 'primeng/inputswitch';
import { Table, TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { LoadingDataBannerComponent } from '../../../../../shared/components/loading-data-banner/loading-data-banner.component';
import { RouterLink } from '@angular/router';
import { NoDataFoundBannerComponent } from '../../../../../shared/components/no-data-found-banner/no-data-found-banner.component';
import { DropdownModule } from 'primeng/dropdown';
import { NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { CustomOffersService } from '../../../../../core/services/g-custom-offers/custom-offers.service';
import { timer } from 'rxjs';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-g-custom-offers',
  standalone: true,
  imports: [
    ButtonModule,
    TableModule,
    FormsModule,
    ToastModule,
    InputSwitchModule,
    LoadingDataBannerComponent,
    RouterLink,
    NoDataFoundBannerComponent,
    DropdownModule,
    NgOptimizedImage,
  ],
  templateUrl: './g-custom-offers.component.html',
  styleUrl: './g-custom-offers.component.scss',
})
export class CustomOffersListComponent {
  offers: any[] = [];
  filteredOffers: any[] = [];
  loading = false;

  private ngxSpinnerService = inject(NgxSpinnerService);
  private messageService = inject(MessageService);
  private customOffersService = inject(CustomOffersService);

  sortField: string = '';
  sortOrder: number = 1;
  globalFilterValue: string = '';

  selectOptions: any[] = [];
  statusFilterValue: boolean | null = null;

  ngOnInit() {
    this.initDropDownFilter();
    this.loadOffers();
  }

  initDropDownFilter(): void {
    this.selectOptions = [
      { label: 'Active', value: true },
      { label: 'Inactive', value: false },
    ];
  }

  loadOffers() {
    this.loading = true;
    this.customOffersService.getAllCustomOffers().subscribe({
      next: (response) => {
        this.offers = response.data;
        this.filteredOffers = [...this.offers];
        this.loading = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load custom offers',
        });
        this.loading = false;
      },
    });
  }

  toggleStatus(offer: any) {
    this.ngxSpinnerService.show('actionsLoader');
    this.customOffersService
      .toggleCustomOfferStatus(offer.id.toString())
      .subscribe({
        next: () => {
          offer.status = !offer.status;
          this.messageService.add({
            severity: 'success',
            summary: 'Updated',
            detail: `Status ${offer.status ? 'Enabled' : 'Disabled'} successfully`,
          });
          timer(200).subscribe(() =>
            this.ngxSpinnerService.hide('actionsLoader'),
          );
        },
        error: () => {
          this.ngxSpinnerService.hide('actionsLoader');
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to toggle status',
          });
        },
      });
  }

  onGlobalFilter(dt: Table, event: any) {
    this.globalFilterValue = event.target.value;
    dt.filterGlobal(this.globalFilterValue, 'contains');
    this.filterLocally();
  }

  onFilterChange(event: any) {
    this.statusFilterValue = event.value;
    this.filterLocally();
  }

  private filterLocally() {
    let filtered = [...this.offers];

    if (this.globalFilterValue) {
      const searchTerm = this.globalFilterValue.toLowerCase();
      filtered = filtered.filter((o) => {
        return (
          o.id.toString().includes(searchTerm) ||
          o.title_en.toLowerCase().includes(searchTerm) ||
          o.title_ar.toLowerCase().includes(searchTerm)
        );
      });
    }

    if (
      this.statusFilterValue !== null &&
      this.statusFilterValue !== undefined
    ) {
      filtered = filtered.filter((o) => o.status === this.statusFilterValue);
    }

    this.filteredOffers = filtered;
  }

  onSort(event: any) {
    this.sortField = event.field;
    this.sortOrder = event.order;
    this.sortLocally();
  }

  private sortLocally() {
    this.filteredOffers.sort((a, b) => {
      let valA = a[this.sortField];
      let valB = b[this.sortField];

      if (typeof valA === 'number' && typeof valB === 'number') {
        return this.sortOrder === 1 ? valA - valB : valB - valA;
      }

      if (typeof valA === 'string' && typeof valB === 'string') {
        return this.sortOrder === 1
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }

      return 0;
    });
  }
}
