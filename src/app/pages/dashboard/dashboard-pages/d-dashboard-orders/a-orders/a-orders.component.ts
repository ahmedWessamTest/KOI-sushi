import { CommonModule } from '@angular/common';
import { Component, effect, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import dayjs, { Dayjs } from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { NgxSpinnerService } from 'ngx-spinner';
import { MenuItem, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { Table, TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { timer } from 'rxjs';
import { ISelectOptions } from '../../../../../core/Interfaces/core/ISelectOptions';
import {
  IAllOrders,
  OrderData,
} from '../../../../../core/Interfaces/g-orders/IAllOrders';
import { IAllBranches } from '../../../../../core/Interfaces/j-branches/IAllBranches';
import { OrdersService } from '../../../../../core/services/g-orders/orders.service';
import { LoadingDataBannerComponent } from '../../../../../shared/components/loading-data-banner/loading-data-banner.component';
import { NoDataFoundBannerComponent } from '../../../../../shared/components/no-data-found-banner/no-data-found-banner.component';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

@Component({
  selector: 'app-a-orders',
  standalone: true,
  imports: [
    FormsModule,
    ButtonModule,
    RouterLink,
    DropdownModule,
    ToastModule,
    LoadingDataBannerComponent,
    TableModule,
    CommonModule,
    NoDataFoundBannerComponent,
    NgxDaterangepickerMd,
  ],
  templateUrl: './a-orders.component.html',
  styleUrl: './a-orders.component.scss',
  providers: [MessageService],
})
export class AOrdersComponent implements OnInit {
  orders: OrderData[] = [];
  filteredOrders: OrderData[] = [];
  allOrders!: IAllOrders;
  statusSteps = ['requested', 'preparing', 'out_for_delivery', 'delivered'];
  searchValue: string = '';
  allBranches!: IAllBranches;
  totalRecords!: number;
  isAdmin = true;
  private ordersService = inject(OrdersService);
  private ngxSpinnerService = inject(NgxSpinnerService);
  private activatedRoute = inject(ActivatedRoute);
  messageService = inject(MessageService);
  rowsPerPage = 10;
  currentPage = 1;
  // Date Filter Properties
  isDropdownOpen = false;
  selectedRange: any = {
    startDate: null,
    endDate: null,
  };

  datePresets: any = {
    Today: [dayjs().format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')],
    Yesterday: [
      dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
      dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
    ],
    'Last 7 Days': [
      dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
      dayjs().format('YYYY-MM-DD'),
    ],
    'Last 30 Days': [
      dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
      dayjs().format('YYYY-MM-DD'),
    ],
    'This Month': [
      dayjs().startOf('month').format('YYYY-MM-DD'),
      dayjs().endOf('month').format('YYYY-MM-DD'),
    ],
    'Last Month': [
      dayjs().subtract(1, 'month').startOf('month').format('YYYY-MM-DD'),
      dayjs().subtract(1, 'month').endOf('month').format('YYYY-MM-DD'),
    ],
    'Custom Range': null,
  };

  selected!: { start: Dayjs; end: Dayjs };

  constructor() {
    effect(() => {
      this.ordersService.currentOrdersCount();
      this.loadOrders();
    });
  }

  ngOnInit(): void {
    this.initDropDownFilter();
    this.allBranches = this.activatedRoute.snapshot.data['branches'];
    this.loadOrders();
  }

  loadOrders() {
    this.ordersService.getAllOrders(this.currentPage,this.rowsPerPage,this.selectedRange.startDate,this.selectedRange.endDate).subscribe({
      next: (data) => {
        this.allOrders = data
        this.filteredOrders = this.allOrders.orders.data
        console.log(this.filteredOrders);
        
        // Sort by order_date in descending order (latest first)
        

        this.orders = [...this.filteredOrders];
        console.log(this.orders);
        
        this.totalRecords = this.allOrders.orders.total;
        console.log(this.totalRecords);
        
      },
      error: (err) => console.error('Failed to load orders', err),
    });
  }

  // Date Filter Methods
  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  applyFilter() {
    this.orders = [...this.filteredOrders];
    this.isDropdownOpen = false;
    this.ngxSpinnerService.show('actionsLoader');
    this.loadOrders()
    timer(300).subscribe(() => this.ngxSpinnerService.hide('actionsLoader'));
  }

  onDateSelected(event: any) {
    this.selectedRange = event;
    console.log(event);
    this.applyFilter();
  }

  clear(dt: Table): void {
    dt.reset();
    this.selectedRange = {
      startDate: null,
      endDate: null,
    };
    this.loadOrders()
  }

  getStatusIndex(status: string): number {
    return this.statusSteps.indexOf(status);
  }

  getSteps(): MenuItem[] {
    return this.statusSteps.map((step) => ({ label: step }));
  }

  updateOrderStatus(order: OrderData, isStatus: boolean) {
  const previousStatus = order.status; // 🔴 احفظ الحالة القديمة

  this.ngxSpinnerService.show('actionsLoader');
  this.messageService.clear('orderStatusMessage');

  this.ordersService
    .updateOrderStatus(order.id.toString(), order.status, isStatus)
    .subscribe({
      next: (response) => {
        timer(200).subscribe(() =>
          this.ngxSpinnerService.hide('actionsLoader')
        );

        const newStatus = response.order.status;

        if (newStatus === 'delivered') {
          this.removeOrder(response.order.id);
        } else {
          order.status = newStatus;
        }

        this.messageService.add({
          severity: 'success',
          summary: 'Status Updated',
          detail: `Order status changed to "${newStatus}"`,
          life: 3000,
          key: 'orderStatusMessage',
        });

        if (!isStatus) {
          this.removeOrder(response.order.id);
        }
      },

      error: (err) => {
        // 🔁 rollback
        order.status = previousStatus;

        timer(200).subscribe(() =>
          this.ngxSpinnerService.hide('actionsLoader')
        );

        console.error('Error updating status', err);

        this.messageService.add({
          severity: 'error',
          summary: 'Update Failed',
          detail: 'Could not update order status.',
          life: 3000,
          key: 'orderStatusMessage',
        });
      },
    });
}


  removeOrder(orderId: number) {
    this.orders = this.orders.filter((order) => order.id !== orderId);
  }

  findBranches(id: number): string | undefined {
    return this.allBranches.data.find((e) => e.id === id)
      ?.title_en;
  }
  getStatusClass(status: string): string {
    switch (status) {
      case 'requested':
        return 'bg-yellow-200 text-yellow-800'; // Light Yellow
      case 'preparing':
        return 'bg-blue-200 text-blue-800'; // Light Blue
      case 'out_for_delivery':
        return 'bg-orange-200 text-orange-800'; // Light Orange
      case 'delivered':
        return 'bg-green-200 text-green-800'; // Light Green
      default:
        return ''; // Default (no styling)
    }
  }
  getAvailableStatusOptions(currentStatus: string) {
  const statusWithIcons = [
    { label: 'Placed', value: 'requested', icon: 'pi pi-inbox text-yellow-500' },
    { label: 'Preparing', value: 'preparing', icon: 'pi pi-check-circle text-blue-500' },
    { label: 'On The Way', value: 'out_for_delivery', icon: 'pi pi-truck text-orange-500' },
    { label: 'Delivered', value: 'delivered', icon: 'pi pi-box text-green-500' },
  ];

  const currentIndex = statusWithIcons.findIndex(
    status => status.value === currentStatus
  );

  return statusWithIcons.map((status, index) => ({
    ...status,
    disabled: index < currentIndex,
  }));
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

  // Dropdown
  selectedStatus: string = '';
  selectOptions: ISelectOptions[] = [];
  onFilterChange(value: string): void {
    if (value) {
      // Filter the blogs based on the selected category
      this.orders = this.filteredOrders.filter((ele) => {
        return ele.status.toString().includes(value);
      });
    } else {
      // Reset to original data if no category is selected
      this.orders = [...this.filteredOrders];
    }

    // Maintain sorting by order_date in descending order after filtering
    this.orders.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateB - dateA; // Descending order
    });
  }

  initDropDownFilter(): void {
    this.selectOptions = [
      {
        label: 'placed',
        value: '1',
      },
      {
        label: 'confirmed',
        value: '0',
      },
      {
        label: 'on the way',
        value: '0',
      },
    ];
  }
  onPageChange(event: any) {
    this.rowsPerPage = event.rows;
    console.log(event);
    this.currentPage = (event.first / event.rows) + 1
    this.loadOrders();
  }
   onSort(event: any) {
    const { field, order } = event;
    
    this.filteredOrders.sort((a: any, b: any) => {
      let valueA = a[field];
      let valueB = b[field];
      if(field === 'user') {
        valueA = valueA?.name;
        valueB = valueB?.name;
      }
      if(field === 'address') {
        valueA = valueA?.address;
        valueB = valueB?.address;
      }

      if (order === -1) {
        return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
      } else {
        return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
      }
    });
  }
  currentSearchTerm: string = '';
  applyFilters(): void {
    let filtered = [...this.orders];

    // Apply search term filter
    if (this.currentSearchTerm) {
      filtered = filtered.filter((order) => {
        return (
          order.id.toString().includes(this.currentSearchTerm) ||
          order.user?.name.toLowerCase().includes(this.currentSearchTerm) ||
          order.total_price.toString().includes(this.currentSearchTerm) 
        );
      });
    }

    this.filteredOrders = filtered;
  }
  onGlobalFilter(table: Table, event: Event) {

    this.currentSearchTerm = (
      event.target as HTMLInputElement
    ).value.toLowerCase();
    console.log(this.currentSearchTerm);
    this.applyFilters()
    table.filterGlobal(this.currentSearchTerm, 'contains');
  }
}
