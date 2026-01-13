import { Location } from './../../../../../core/Interfaces/e-sublocations/IGetSubLocationById';
import { Component, inject } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";
import { MessageService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { DialogModule } from "primeng/dialog";
import { DropdownModule } from "primeng/dropdown";
import { InputSwitchModule } from "primeng/inputswitch";
import { TableModule } from "primeng/table";
import { ToastModule } from "primeng/toast";
import { timer } from "rxjs";
import { ISubLocationData } from "../../../../../core/Interfaces/e-sublocations/IGetAllSubLocations";
import { SubLocationsService } from "../../../../../core/services/e-sublocations/sub-locations.service";
import { CurrencyPipe } from "@angular/common";
import {  ILocation } from "../../../../../core/Interfaces/e-sublocations/IGetSubLocationsBranches";
import { LoadingDataBannerComponent } from "../../../../../shared/components/loading-data-banner/loading-data-banner.component";
import { NoDataFoundBannerComponent } from "../../../../../shared/components/no-data-found-banner/no-data-found-banner.component";
import { InputTextModule } from "primeng/inputtext";
import { ISelectOptions } from "../../../../../core/Interfaces/core/ISelectOptions";

@Component({
  selector: "app-a-sub-locations-all",
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
    CurrencyPipe,
    LoadingDataBannerComponent,
    NoDataFoundBannerComponent,
    InputTextModule,
  ],
  templateUrl: "./a-sub-locations-all.component.html",
  styleUrl: "./a-sub-locations-all.component.scss",
  providers: [MessageService],
})
export class ASubLocationsAllComponent {
  filteredLocations: ILocation[] = [];
  Locations: ILocation[] = [];

  private ngxSpinnerService = inject(NgxSpinnerService);
  private subLocationsService = inject(SubLocationsService);
  private messageService = inject(MessageService);

  totalRecords: number = 0;
  rowsPerPage = 10;
  currentPage = 1;

  // Dropdown
  selectedStatus: string = "";
  selectOptions: ISelectOptions[] = [];
 onFilterChange(value: string): void {
  if (value === '' || value === null || value === undefined) {
    this.filteredLocations = [...this.Locations];
    return;
  }

  const statusToFilter = value === '1';

  this.filteredLocations = this.Locations.filter((ele) => {
    return ele.status === statusToFilter;
  });
}

  initDropDownFilter(): void {
    this.selectOptions = [
      {
        label: "Active",
        value: "1",
      },
      {
        label: "Inactive",
        value: "0",
      },
    ];
  }

  ngOnInit() {
    this.initDropDownFilter();
    this.fetchLocations();
  }

  fetchLocations() {
    this.subLocationsService.getAllLocations().subscribe(
      (response) => {
        this.totalRecords = response.data.total;
        this.Locations = response.data.data;
        this.filteredLocations = [...this.Locations];
      },
      () => {
        this.messageService.add({ severity: "error", summary: "Error", detail: "Failed to load SubLocations" });
      }
    );
  }

 



  toggleSubLocationStatus(location: ILocation) {
    this.ngxSpinnerService.show("actionsLoader");
    this.messageService.clear();
    const updatedStatus:boolean = !location.status;
    console.log(updatedStatus);
    
      this.subLocationsService.toggleLocation(location.id.toString()).subscribe(() => {
        location.status = updatedStatus;
        this.messageService.add({
          severity: "success",
          summary: "Updated",
          detail: `Branch ${updatedStatus ? "Enabled" : "Disabled"} successfully`,
        });
        timer(200).subscribe(() => this.ngxSpinnerService.hide("actionsLoader"));
      });
    
  }

  onPageChange(event: any) {
    this.currentPage = event.first / event.rows + 1;
    this.rowsPerPage = event.rows;
    this.loadProducts(this.currentPage, this.rowsPerPage);
  }

  loadProducts(page: number, perPage: number) {
    this.ngxSpinnerService.show("actionsLoader");

    this.subLocationsService.getAllLocations(page, perPage).subscribe(
      (response) => {
        this.ngxSpinnerService.hide("actionsLoader");
        this.Locations = response.data.data
        this.filteredLocations = [...this.Locations];
      },
      () => {
        this.messageService.add({ severity: "error", summary: "Error", detail: "Failed to load SubLocations" });
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

  // Sorting method
  onSort(event: any) {
    const { field, order } = event;
    this.filteredLocations.sort((a: any, b: any) => {
      let valueA = a[field];
      let valueB = b[field];

      if (typeof valueA === "number" && typeof valueB === "number") {
        return order === -1 ? valueA - valueB : valueB - valueA;
      }

      valueA = valueA?.toString().toLowerCase() || "";
      valueB = valueB?.toString().toLowerCase() || "";
      return order === -1 ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
    });
  }

  // Global filter method
  onGlobalFilter(table: any, event: Event) {
    const searchValue = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredLocations = this.Locations.filter((location) => {
      return (
        location.id.toString().includes(searchValue) ||
        location.title_en.toLowerCase().includes(searchValue) ||
        location.title_ar.toLowerCase().includes(searchValue) ||
        location.delivery_fee.includes(searchValue) 
      );
    });
    table.filterGlobal(searchValue, "contains");
  }
}
