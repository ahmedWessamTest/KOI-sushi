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
  statusSteps = ['placed', 'confirmed', 'on the way', 'delivered'];
  searchValue: string = '';
  allBranches!: IAllBranches;
  totalRecords!: number;
  isAdmin = true;
  private ordersService = inject(OrdersService);
  private ngxSpinnerService = inject(NgxSpinnerService);
  private activatedRoute = inject(ActivatedRoute);
  messageService = inject(MessageService);

  // Date Filter Properties
  isDropdownOpen = false;
  selectedRange: any = {
    startDate: dayjs().subtract(7, 'day').toDate(),
    endDate: dayjs().toDate(),
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
    this.ordersService.getAllOrders().subscribe({
      next: (data) => {
        this.allOrders = data;
        this.filteredOrders = data.orders.filter((order) => {
          return order.status !== 'cancelled' && order.status !== 'delivered';
        });

        // Sort by order_date in descending order (latest first)
        this.filteredOrders.sort((a, b) => {
          const dateA = new Date(a.order_date).getTime();
          const dateB = new Date(b.order_date).getTime();
          return dateB - dateA; // Descending order
        });

        this.orders = [...this.filteredOrders];
        this.totalRecords = this.orders.length;
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

    if (this.selectedRange?.startDate && this.selectedRange?.endDate) {
      const startDate = dayjs(this.selectedRange.startDate).format(
        'YYYY-MM-DD'
      );
      const endDate = dayjs(this.selectedRange.endDate).format('YYYY-MM-DD');

      this.orders = this.orders.filter((order) => {
        const orderDate = dayjs(order.order_date).format('YYYY-MM-DD');
        return orderDate >= startDate && orderDate <= endDate;
      });
    } else {
      this.orders = this.filteredOrders;
    }

    // Maintain sorting by order_date in descending order after filtering
    this.orders.sort((a, b) => {
      const dateA = new Date(a.order_date).getTime();
      const dateB = new Date(b.order_date).getTime();
      return dateB - dateA; // Descending order
    });

    timer(300).subscribe(() => this.ngxSpinnerService.hide('actionsLoader'));
  }

  onDateSelected(event: any) {
    this.selectedRange = event;
    console.log(event);
    this.applyFilter();
  }

  clear(dt: Table): void {
    dt.reset();
    this.orders = [...this.filteredOrders];

    // Maintain sorting by order_date in descending order
    this.orders.sort((a, b) => {
      const dateA = new Date(a.order_date).getTime();
      const dateB = new Date(b.order_date).getTime();
      return dateB - dateA; // Descending order
    });

    this.selectedRange = {
      startDate: dayjs().subtract(7, 'day').toDate(),
      endDate: dayjs().toDate(),
    };
  }

  getStatusIndex(status: string): number {
    return this.statusSteps.indexOf(status);
  }

  getSteps(): MenuItem[] {
    return this.statusSteps.map((step) => ({ label: step }));
  }

  updateOrderStatus(order: OrderData, isStatus: boolean) {
    this.ngxSpinnerService.show('actionsLoader');
    this.messageService.clear('orderStatusMessage');
    this.ordersService
      .updateOrderStatus(order.id.toString(), order.status, isStatus)
      .subscribe({
        next: (response) => {
          timer(200).subscribe(() =>
            this.ngxSpinnerService.hide('actionsLoader')
          );
          order = response.order;
          this.messageService.add({
            severity: 'success',
            summary: 'Status Updated',
            detail: `Order status changed to "${order.status}"`,
            life: 3000,
            key: 'orderStatusMessage',
          });
          if (!isStatus) {
            this.removeOrder(response.order.id);
          }
        },
        error: (err) => {
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
    return this.allBranches.branches.data.find((e) => e.id === id)
      ?.en_branch_city;
  }
  getStatusClass(status: string): string {
    switch (status) {
      case 'placed':
        return 'bg-yellow-200 text-yellow-800'; // Light Yellow
      case 'confirmed':
        return 'bg-blue-200 text-blue-800'; // Light Blue
      case 'on the way':
        return 'bg-orange-200 text-orange-800'; // Light Orange
      case 'delivered':
        return 'bg-green-200 text-green-800'; // Light Green
      default:
        return ''; // Default (no styling)
    }
  }
  getAvailableStatusOptions(currentStatus: string) {
    const statusWithIcons = [
      { label: 'Placed', value: 'placed', icon: 'pi pi-inbox text-yellow-500' },
      {
        label: 'Confirmed',
        value: 'confirmed',
        icon: 'pi pi-check-circle text-blue-500',
      },
      {
        label: 'On The Way',
        value: 'on the way',
        icon: 'pi pi-truck text-orange-500',
      },
      {
        label: 'Delivered',
        value: 'delivered',
        icon: 'pi pi-box text-green-500',
      },
    ];

    const currentIndex = this.statusSteps.indexOf(currentStatus);

    // ✅ Disable previous steps
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
      const dateA = new Date(a.order_date).getTime();
      const dateB = new Date(b.order_date).getTime();
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
}
