import {
  CommonModule,
  CurrencyPipe,
  JsonPipe,
  PercentPipe,
} from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { timer } from 'rxjs';
import {
  Address,
  IOrderById,
  Item,
  Orderdetail,
  Promo,
} from '../../../../../core/Interfaces/g-orders/IOrderById';
import { OrdersService } from '../../../../../core/services/g-orders/orders.service';
import { LoadingDataBannerComponent } from '../../../../../shared/components/loading-data-banner/loading-data-banner.component';
import { User } from './../../../../../core/Interfaces/g-orders/IAllOrders';

export interface GroupedComboItem {
  product_name: string;
  option_name?: string;
  quantity: number;
}

export interface GroupedCombo {
  combo_group_id: string | number;
  combo_offer_id: number;
  title_en: string;
  pieces: number;
  price: number;
  offer_title?: string;
  items: GroupedComboItem[];
}

export interface CartDisplayGroup {
  isCombo: boolean;
  combo_group_id?: string | number;
  combo_title?: string;
  offer_title?: string;
  pieces?: number;
  combo_price?: number;
  original_items_total?: number;
  combo_savings?: number;
  items: Item[];
}

@Component({
  selector: 'app-c-orders-details',
  standalone: true,
  imports: [
    DropdownModule,
    FormsModule,
    LoadingDataBannerComponent,
    CommonModule,
    CurrencyPipe,
    TableModule,
    PercentPipe,
    CardModule,
    ButtonModule,
    BadgeModule,
  ],
  templateUrl: './c-orders-details.component.html',
  styleUrl: './c-orders-details.component.scss',

  providers: [MessageService],
})
export class COrdersDetailsComponent {
  order!: IOrderById;
  isHaveCombo = false;
  groupedCombos: GroupedCombo[] = [];
  cartDisplayGroups: CartDisplayGroup[] = [];
  totalComboSavings = 0;
  userDetails: User[] = [];
  userAddress: Address[] = [];
  userPromoCode: Promo[] = [];
  userOrders: Item[] = [];
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(() => {
      this.fetchData();
    });

    this.getCounters();
  }
  userPhones: string = '';
  fetchData(): void {
    this.order = this.activatedRoute.snapshot.data['orderDetails'];
    console.log(this.order);

    this.processComboGroups();
    this.processCartDisplay();
    this.isHaveCombo = this.groupedCombos.length > 0;

    const userPhone = this.order.order.user?.phone;
    const addressPhone = this.order.order.user?.phone;

    if (userPhone && addressPhone) {
      this.userPhones =
        userPhone === addressPhone
          ? userPhone
          : `${userPhone} - ${addressPhone}`;
    } else {
      this.userPhones = userPhone || addressPhone || '';
    }
    this.userPromoCode = [];
    this.userDetails = [];
    this.userAddress = [];
    console.log(this.order.order.user);

    this.userDetails.push(this.order.order.user);
    this.userAddress.push(this.order.order.address);
    if (this.order.order.promo_code) {
      this.userPromoCode.push(this.order.order.promo_code);
    }
    this.userOrders = this.order.order.items;
  }

  processComboGroups(): void {
    this.groupedCombos = [];
    if (!this.order?.order?.items) return;

    const comboMap = new Map<string | number, GroupedCombo>();

    this.order.order.items.forEach((item) => {
      if (item.combo_offer) {
        const groupKey = item.combo_group_id || item.combo_offer_id || item.id;

        if (!comboMap.has(groupKey)) {
          const comboDetail = item.combo_offer.combo;
          const offerable = item.combo_offer.offerable;

          comboMap.set(groupKey, {
            combo_group_id: groupKey,
            combo_offer_id: item.combo_offer_id,
            title_en: comboDetail?.title_en || 'Combo',
            pieces: comboDetail?.pieces || 0,
            price: 0,
            offer_title: offerable?.title_en || offerable?.title_ar || '',
            items: [],
          });
        }

        const group = comboMap.get(groupKey)!;

        const itemPrice = parseFloat(item.price || '0');
        if (itemPrice > 0) {
          group.price = itemPrice;
        }

        group.items.push({
          product_name: item.product?.title_en || '',
          option_name: item.product_option?.title_en || '',
          quantity: item.quantity || 1,
        });
      }
    });

    this.groupedCombos = Array.from(comboMap.values());
  }

  processCartDisplay(): void {
    this.cartDisplayGroups = [];
    this.totalComboSavings = 0;
    if (!this.order?.order?.items) return;

    const comboMap = new Map<string | number, CartDisplayGroup>();
    const nonComboItems: Item[] = [];

    this.order.order.items.forEach((item) => {
      if (item.combo_offer) {
        const groupKey = item.combo_group_id || item.combo_offer_id || item.id;

        if (!comboMap.has(groupKey)) {
          const comboDetail = item.combo_offer.combo;
          const offerable = item.combo_offer.offerable;

          comboMap.set(groupKey, {
            isCombo: true,
            combo_group_id: groupKey,
            combo_title: comboDetail?.title_en || 'Combo',
            pieces: comboDetail?.pieces || 0,
            combo_price: 0,
            original_items_total: 0,
            combo_savings: 0,
            offer_title: offerable?.title_en || offerable?.title_ar || '',
            items: [],
          });
        }

        const group = comboMap.get(groupKey)!;
        group.items.push(item);

        const itemPrice = parseFloat(item.price || '0');
        if (itemPrice > 0) {
          group.combo_price = itemPrice;
        }

        const optionPrice = parseFloat(
          item.product_option?.price || item.product?.price || '0'
        );
        const qty = item.quantity || 1;
        group.original_items_total =
          (group.original_items_total || 0) + optionPrice * qty;
      } else {
        nonComboItems.push(item);
      }
    });

    comboMap.forEach((group) => {
      const comboPrice = group.combo_price || 0;
      const originalTotal = group.original_items_total || 0;
      if (originalTotal > comboPrice) {
        group.combo_savings = originalTotal - comboPrice;
      } else {
        group.combo_savings = 0;
      }
      this.totalComboSavings += group.combo_savings;
      this.cartDisplayGroups.push(group);
    });

    if (nonComboItems.length > 0) {
      this.cartDisplayGroups.push({
        isCombo: false,
        items: nonComboItems,
      });
    }
  }

  backToOrders(): void {
    if (this.router.url.includes('history')) {
      this.router.navigate(['/dashboard/orders/history']);
    } else {
      this.router.navigate(['/dashboard/orders/']);
    }
  }

  getTotalPrice(orderdetails: Orderdetail): number {
    return Number(orderdetails.total_price);
  }

  printOrderReceipt() {
    const receiptContent = document.getElementById('receipt-section');

    // Extract values from order object
    const order = this.order.order; // Assuming order is available in the component
    const subtotal = order.sub_total_price;
    const totalPrice = order.total_price;
    // const serviceCharge = order.service_value;
    const delivery = order.delivery_fee;
    const happy = order.happy_hours_discount;
    const ziDiscount = order.loyalty_points_discount;
    const orderNote = order.note;

    const vat = order.tax; // Extracted from total

    if (receiptContent) {
      const printWindow = window.open(
        '',
        'ZiSushiReceipt',
        'width=800,height=900',
      );

      const happyValue = this.convertStringToNumber(happy);

      // Build the happy hours row only if value is not zero
      const comboSavingsRow =
        this.totalComboSavings > 0
          ? `<tr>
              <td>Combo Offers Savings:</td>
              <td style="color: #15803d; font-weight: bold;">-${this.totalComboSavings} EGP</td>
            </tr>`
          : '';

      const printedReceiptRows = {
        comboRow: comboSavingsRow,
        happyRow:
          happyValue !== 0
            ? `<tr>
              <td>Happy hours:</td>
              <td>${happyValue} EGP</td>
            </tr>`
            : '',
        ziDiscountRow: ziDiscount
          ? `
    <tr>
      <td>Zi Points:</td>
      <td>${ziDiscount} EGP</td>
    </tr>
  `
          : '',
      };

      printWindow?.document.write(`
        <html>
        <head>
          <title>KOI Sushi - Order Receipt</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; padding: 0; }
            h2 { text-align: center; background-color: #f0f0f0; padding: 10px; margin-top: 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f4f4f4; }
            .total { text-align: right; font-weight: bold; margin-top: 10px; }
            tr.bg-amber-100, tr.bg-amber-100\\/90 { background-color: #fef3c7 !important; font-weight: bold; }
            tr.bg-amber-50, tr.bg-amber-50\\/50 { background-color: #fffdf5 !important; }
            @media print {
              body { margin: 10px; }
              .p-button-outlined { display: none; } /* Hide buttons in print */
              #not-show-print { display: none !important; } /* Hide the not-show-print div when printing */
              @page { margin: 0.5cm; }
              @page :footer { display: none; }
              @page :header { display: none; }
            }
            /* Hide URL at the bottom of the page */
            body::after {
              content: "";
              display: block;
              height: 0;
              visibility: hidden;
            }
          </style>
        </head>
        <body>
          ${receiptContent.innerHTML}
          <h2>Receipt</h2>
          <table>
            <tr>
              <td>Subtotal:</td>
              <td>${subtotal} EGP</td>
            </tr>
            
            <tr>
              <td>VAT:</td>
              <td>${vat}</td>
            </tr>
            <tr>
              <td>Delivery:</td>
              <td>${delivery}</td>
            </tr>
            ${Object.values(printedReceiptRows).filter(Boolean).join('')}
            <tr>
              <td><strong>Total:</strong></td>
              <td><strong>${totalPrice} EGP</strong></td>
            </tr>
          </table>
          <p class="total">Printed on: ${new Date().toLocaleString()}</p>
          <script>
            // Hide the about:blank text by setting the document title
            document.title = "KOI Sushi - Order Receipt";
            // Remove any footer text that might appear
            window.onbeforeprint = function() {
              // Force focus to ensure the browser treats this as the active window
              window.focus();
            };
          </script>
        </body>
        </html>
      `);

      printWindow?.document.close();
      printWindow?.focus();
      printWindow?.print();
      printWindow?.close();
    }
  }

  statusSteps = [
    'requested',
    'preparing',
    'out_for_delivery',
    'delivered',
    'canceled',
  ];
  private ordersService = inject(OrdersService);
  messageService = inject(MessageService);
  private ngxSpinnerService = inject(NgxSpinnerService);
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
      case 'canceled':
        return 'bg-red-200 text-green-800'; // Light Green
      case 'failed':
        return 'bg-red-200 text-green-800'; // Light Green
      default:
        return ''; // Default (no styling)
    }
  }
  getAvailableStatusOptions(currentStatus: string) {
    const statusWithIcons = [
      {
        label: 'Placed',
        value: 'requested',
        icon: 'pi pi-inbox text-yellow-500',
      },
      {
        label: 'Preparing',
        value: 'preparing',
        icon: 'pi pi-check-circle text-blue-500',
      },
      {
        label: 'Out For Delivery',
        value: 'out_for_delivery',
        icon: 'pi pi-truck text-orange-500',
      },
      {
        label: 'Delivered',
        value: 'delivered',
        icon: 'pi pi-box text-green-500',
      },
      {
        label: 'Cancele',
        value: 'canceled',
        icon: 'pi pi-times text-red-500',
      },
      {
        label: 'Failed',
        value: 'failed',
        icon: 'pi pi-times-circle text-red-500',
      },
    ];

    const currentIndex = statusWithIcons.findIndex(
      (status) => status.value === currentStatus,
    );

    return statusWithIcons.map((status, index) => ({
      ...status,
      disabled: index < currentIndex,
    }));
  }

  updateOrderStatus(order: any, isStatus: boolean) {
    this.ngxSpinnerService.show('actionsLoader');
    this.messageService.clear('orderStatusMessage');
    this.ordersService
      .updateOrderStatus(order.id.toString(), order.status, isStatus)
      .subscribe({
        next: (response) => {
          timer(200).subscribe(() =>
            this.ngxSpinnerService.hide('actionsLoader'),
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
          }
        },
        error: (err) => {
          timer(200).subscribe(() =>
            this.ngxSpinnerService.hide('actionsLoader'),
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

  counter: number[] = [];

  getCounters() {
    const length = this.userOrders.length;
    this.counter = Array.from({ length }, (_, i) => i);
    console.log(this.counter);
  }

  convertStringToNumber(value: string): number {
    return Number(value);
  }
}
