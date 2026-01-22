import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputSwitchModule } from 'primeng/inputswitch';
import { Table, TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { LoadingDataBannerComponent } from '../../../../../../shared/components/loading-data-banner/loading-data-banner.component';
import { RouterLink } from '@angular/router';
import { NoDataFoundBannerComponent } from '../../../../../../shared/components/no-data-found-banner/no-data-found-banner.component';
import { DropdownModule } from 'primeng/dropdown';
import { NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { ISelectOptions } from '../../../../../../core/Interfaces/core/ISelectOptions';
import { CombosService } from '../../../../../../core/services/d-combos/combos.service';
import { ICombosData } from '../../../../../../core/Interfaces/d-combos/iall-combos';
import { timer } from 'rxjs';

@Component({
  selector: 'app-d-all-combos',
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
  ],
  templateUrl: './d-all-combos.component.html',
  styleUrl: './d-all-combos.component.scss',
})
export class DAllCombosComponent {
  combos: ICombosData[] = [];
  filteredCombos: ICombosData[] = [];
  loading = false;

  private ngxSpinnerService = inject(NgxSpinnerService);
  private messageService = inject(MessageService);
  private combosService = inject(CombosService);

  // Add sorting state
  sortField: string = '';
  sortOrder: number = 1;
  globalFilterValue: string = '';

  // Dropdown
  selectOptions: any[] = [];

  initDropDownFilter(): void {
    this.selectOptions = [
      {
        label: 'Active',
        value: true,
      },
      {
        label: 'Inactive',
        value: false,
      },
    ];
  }

  ngOnInit() {
    this.initDropDownFilter();
    this.loadCombos();
  }

  // Toggle Category
  toggleComboStatus(combo: ICombosData) {
    this.ngxSpinnerService.show('actionsLoader');
    this.messageService.clear();

    const updatedStatus = !combo.status; // Toggle between 0 and 1
    if (updatedStatus) {
      this.combosService.enableCombo(combo.id.toString()).subscribe(() => {
        combo.status = updatedStatus; // Update the UI immediately
        this.messageService.add({
          severity: 'success',
          summary: 'Updated',
          detail: `Combo ${
            updatedStatus ? 'Enabled' : 'Disabled'
          } successfully`,
        });
        timer(200).subscribe(() =>
          this.ngxSpinnerService.hide('actionsLoader'),
        );
      });
    } else {
      this.combosService.disableCombo(combo.id.toString()).subscribe(() => {
        combo.status = updatedStatus; // Update the UI immediately
        this.messageService.add({
          severity: 'success',
          summary: 'Updated',
          detail: `Combo ${
            updatedStatus ? 'Enabled' : 'Disabled'
          } successfully`,
        });
        timer(200).subscribe(() =>
          this.ngxSpinnerService.hide('actionsLoader'),
        );
      });
    }
  }

  loadCombos() {
    this.loading = true;

    this.combosService.getAllCombos().subscribe({
      next: (response) => {
        this.combos = response.data;
        this.filteredCombos = [...this.combos];
        this.loading = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load Category',
        });
        this.loading = false;
      },
    });
  }

  // Add local sorting method
  onSort(event: any) {
    this.sortField = event.field;
    this.sortOrder = event.order;
    this.sortLocally();
  }

  private sortLocally() {
    this.filteredCombos.sort((a: any, b: any) => {
      let valueA = a[this.sortField];
      let valueB = b[this.sortField];

      // Handle numeric values
      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return this.sortOrder === 1 ? valueA - valueB : valueB - valueA;
      }

      // Handle string values
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return this.sortOrder === 1
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }

      // Handle boolean values
      if (typeof valueA === 'boolean' && typeof valueB === 'boolean') {
        return this.sortOrder === 1
          ? valueA === valueB
            ? 0
            : valueA
              ? 1
              : -1
          : valueA === valueB
            ? 0
            : valueA
              ? -1
              : 1;
      }

      return 0;
    });
  }

  onGlobalFilter(dt: Table, event: any) {
    this.globalFilterValue = event.target.value;
    dt.filterGlobal(this.globalFilterValue, 'contains');
    this.filterLocally();
  }

  // Status Filter
  statusFilterValue: boolean | null = null;
  onFilterChange(event: any) {
    this.statusFilterValue = event.value;
    this.filterLocally();
  }

  // ... (initDropDownFilter and ngOnInit are fine) ...

  // (Moving filterLocally to replace existing one and handle both filters)
  private filterLocally() {
    let filtered = [...this.combos];

    // Global Filter
    if (this.globalFilterValue) {
      const searchTerm = this.globalFilterValue.toLowerCase();
      filtered = filtered.filter((combo) => {
        return (
          combo.id.toString().includes(searchTerm) ||
          combo.title_en.toLowerCase().includes(searchTerm) ||
          combo.title_ar.toLowerCase().includes(searchTerm)
        );
      });
    }

    // Status Filter
    if (
      this.statusFilterValue !== null &&
      this.statusFilterValue !== undefined
    ) {
      filtered = filtered.filter(
        (combo) => combo.status === this.statusFilterValue,
      );
    }

    this.filteredCombos = filtered;
  }
}
