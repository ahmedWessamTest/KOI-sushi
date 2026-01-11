import { PercentPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputSwitchModule } from 'primeng/inputswitch';
import { Table, TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ISelectOptions } from '../../../../../../core/Interfaces/core/ISelectOptions';
import { LoadingDataBannerComponent } from '../../../../../../shared/components/loading-data-banner/loading-data-banner.component';
import { NoDataFoundBannerComponent } from '../../../../../../shared/components/no-data-found-banner/no-data-found-banner.component';
import { Daum, PromoCodes } from '../res/model/promo-codes';
import { PromoCodeService } from '../res/services/promo-code.service';

@Component({
  selector: 'app-a-all-promo-code',
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
    LoadingDataBannerComponent,
    RouterLink,
    PercentPipe,
    DropdownModule,
    NoDataFoundBannerComponent,
  ],
  providers: [MessageService],
  templateUrl: './a-all-promo-code.component.html',
  styleUrl: './a-promo-code.component.scss',
})
export class AAllPromoCodeComponent {
  allPromoCode!: PromoCodes;
  PromoCode: Daum[] = [];
  filteredPromoCode: Daum[] = [];

  loading = false;

  private ngxSpinnerService = inject(NgxSpinnerService);

  private messageService = inject(MessageService);

  private promoCodeService = inject(PromoCodeService);

  // Dropdown for Status
  selectedStatus: string | null = null;
  selectStatusOptions: ISelectOptions[] = [];

  // Dropdown for Type
  selectedType: string | null = null;
  selectTypeOptions: ISelectOptions[] = [];

  onStatusFilterChange(value: string | null): void {
    console.log(value);
    
    if(value !== null) {
      this.selectedStatus = value;
    } else {
      this.selectedStatus = null;
    }
    this.loadPromoCode()
  }

  onTypeFilterChange(value: string | null): void {
    if(value !== null) {
      this.selectedType = value;
    } else {
      this.selectedType = null
    }
    this.loadPromoCode()
  }

  applyFilters(): void {
    let filtered = [...this.PromoCode];

    // Apply search term filter
    if (this.currentSearchTerm) {
      filtered = filtered.filter((promocode) => {
        return (
          promocode.id.toString().includes(this.currentSearchTerm) ||
          promocode.code.toLowerCase().includes(this.currentSearchTerm) ||
          promocode.value.toString().includes(this.currentSearchTerm) ||
          promocode.type.toLowerCase().includes(this.currentSearchTerm)
        );
      });
    }

    this.filteredPromoCode = filtered;
  }

  initDropDownFilter(): void {
    this.selectStatusOptions = [
      {
        label: 'Active',
        value: '1',
      },
      {
        label: 'Inactive',
        value: '0',
      },
    ];

    this.selectTypeOptions = [
      {
        label: 'Fixed',
        value: 'fixed',
      },
      {
        label: 'Percentage',
        value: 'percentage',
      },
    ];
  }

  ngOnInit() {
    this.initDropDownFilter();
    this.fetchData();
  }

  // get All PromoCode
  fetchData() {
    this.loading = true;
    this.promoCodeService.getAllPromoCodes().subscribe(
      (response) => {
        this.allPromoCode = response.promo_codes;
        console.log(this.allPromoCode);
        
        this.totalRecords = response.promo_codes.total;
        this.PromoCode = response.promo_codes.data.reverse();
        this.filteredPromoCode = [...this.PromoCode];
        this.loading = false;
      },
      () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load PromoCode',
        });
        this.loading = false;
      }
    );
  }

  currentSearchTerm: string = '';

  onGlobalFilter(table: Table, event: Event) {
    this.currentSearchTerm = (
      event.target as HTMLInputElement
    ).value.toLowerCase();
    this.applyFilters();
    table.filterGlobal(this.currentSearchTerm, 'contains');
  }

  onSort(event: any) {
    const { field, order } = event;
    this.filteredPromoCode.sort((a: any, b: any) => {
      let valueA = a[field];
      let valueB = b[field];

      if (order === -1) {
        return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
      } else {
        return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
      }
    });
  }

  // Toggle promocode
  togglePromoCodeStatus(promocode: Daum) {
    this.messageService.clear();
    const updatedStatus = promocode.status;
    this.promoCodeService
      .enablePromoCode(promocode.id.toString())
      .subscribe(() => {
        console.log(promocode);
        
        promocode.status = updatedStatus;
        this.messageService.add({
          severity: 'success',
          summary: 'Updated',
          detail: `Promo Code ${
            updatedStatus ? 'Enabled' : 'Disabled'
          } successfully`,
        });
      });
  }

  totalRecords: number = 0;
  rowsPerPage = 10;
  currentPage = 1;

  onPageChange(event: any) {
    this.rowsPerPage = event.rows;
    console.log(event);
    this.currentPage = (event.first / event.rows) + 1
    this.loadPromoCode();
  }

  loadPromoCode() {
    this.loading = true;
    this.ngxSpinnerService.show('actionsLoader');
    this.promoCodeService
      .getAllPromoCodes(this.currentPage, this.rowsPerPage,this.selectedType,this.selectedStatus)
      .subscribe(
        (response) => {
          this.ngxSpinnerService.hide('actionsLoader');
          this.PromoCode = response.promo_codes.data.reverse();
          this.filteredPromoCode = [...this.PromoCode];
          this.loading = false;
        },
        () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load PromoCode',
          });
          this.loading = false;
        }
      );
  }

  getPagination(): number[] {
    if (this.totalRecords === 0) return [0];

    const options = [10, 100, 500, 1000];
    const validOptions = options.filter((opt) => opt <= this.totalRecords);

    if (!validOptions.includes(this.totalRecords)) {
      validOptions.push(this.totalRecords);
    }

    return validOptions.sort((a, b) => a - b);
  }
}
