import { Component, ElementRef, Inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

import { DashboardLayoutService } from '../../../core/services/core/dashboard-layout.service';
import { DashboardMenuItemsComponent } from '../dashboard-menu-items/dashboard-menu-items.component';
import { DialogModule } from "primeng/dialog";
import { ToastModule } from "primeng/toast";

@Component({
  selector: 'app-dashboard-side-bar',
  standalone: true,
  imports: [ConfirmDialogModule, DashboardMenuItemsComponent, DialogModule, ToastModule],
  templateUrl: './dashboard-side-bar.component.html',
  styleUrl: './dashboard-side-bar.component.scss',
  providers: [ConfirmationService],
})
export class DashboardSideBarComponent {
  model: any[] = [];
  isAdmin = false;
  constructor(
    public layoutService: DashboardLayoutService,
    public el: ElementRef,
    private _Router: Router,
    private _ConfirmationService: ConfirmationService,
  ) {}
  showModal = signal<boolean>(false);
  ngOnInit(): void {
      if (JSON.parse(localStorage.getItem('user')!).role === 'super-admin')
        this.isAdmin = true;
    
    // this.getLoyaltyPointsStatus();
    this.initSideBar();
  }

  initSideBar(): void {
    if (this.isAdmin) {
      this.model = [
        {
          label: 'Home',
          items: [
            {
              label: 'Dashboard',
              icon: 'pi pi-fw pi-chart-bar',
              routerLink: ['/dashboard'],
            },
          ],
        },
        {
          label: 'Offers',
          items: [

            {
              label: 'Promo Codes',
              icon: 'pi pi-fw pi-qrcode',
              routerLink: ['/dashboard/offers/promo-codes'],
            },
            {
              label: 'Vouchers',
              icon: 'pi pi-fw pi-ticket',
              routerLink: ['/dashboard/offers/vouchers'],
            },
            // {
            //   label: 'Loyalty Points',
            //   icon: 'pi pi-trophy',
            //   command: () => {this.handleLoyaltyPoints()},
            //   type:"switch",
            //   isActiveLoyaltyPoints:this.loyaltyPointsStatus
            // },
            {
              label: 'Loyalty Points',
              icon: 'pi pi-trophy',
              routerLink: ['/dashboard/offers/loyalty-points'],
            },
            {
              label: 'Happy Hours',
              icon: 'pi pi-stopwatch',
              routerLink: ['/dashboard/offers/happy-hours'],
            },
          ],
        },
        {
          label: 'Menu',
          items: [
            {
              label: 'Categories',
              icon: 'pi pi-fw pi-list',
              routerLink: ['/dashboard/menu/categories'],
            },
            {
              label: 'Products',
              icon: 'pi pi-fw pi-th-large',
              routerLink: ['/dashboard/menu/products'],
            },
          ],
        },
        {
          label: 'Orders',
          items: [
            {
              label: 'Order Management',
              icon: 'pi pi-fw pi-truck',
              routerLink: ['/dashboard/orders/orders'],
            },
            {
              label: 'Order History',
              icon: 'pi pi-fw pi-history',
              routerLink: ['/dashboard/orders/history'],
            },
          ],
        },
        {
          label: 'Users',
          items: [
            {
              label: 'Manage Users',
              icon: 'pi pi-fw pi-users',
              routerLink: ['/dashboard/users'],
            },
          ],
        },
        {
          label: 'Pages',
          items: [
            {
              label: 'Tutorial',
              icon: 'pi pi-fw pi-list-check',
              routerLink: ['/dashboard/pages/tutorial'],
            },
            {
              label: 'About Us',
              icon: 'pi pi-fw pi-info-circle',
              routerLink: ['/dashboard/pages/about-us'],
            },
            {
              label: 'Privacy Policy',
              icon: 'pi pi-fw pi-lock',
              routerLink: ['/dashboard/pages/privacy-policy'],
            },
          ],
        },
        {
          label: 'Areas',
          items: [
            {
              label: 'Manage Locations',
              icon: 'pi pi-fw pi-map-marker',
              routerLink: ['/dashboard/sub-locations'],
            },
          ],
        },
        {
          label: 'Notifications',
          items: [
            {
              label: 'Send Notifications',
              icon: 'pi pi-fw pi-mobile',
              routerLink: ['/dashboard/notifications'],
            },
          ],
        },
        // {
        //   label: 'Contact Us',
        //   items: [
        //     {
        //       label: 'Manage Branches',
        //       icon: 'pi pi-fw pi-home',
        //       routerLink: ['/dashboard/contact-us/branches'],
        //     },
        //     {
        //       label: 'Social Media',
        //       icon: 'pi pi-fw pi-share-alt',
        //       routerLink: ['/dashboard/contact-us/social-links'],
        //     },
        //     {
        //       label: 'Inbox',
        //       icon: 'pi pi-fw pi-envelope',
        //       routerLink: ['/dashboard/contact-us/messages'],
        //     },
        //   ],
        // },
        {
          label: 'Settings',
          items: [
            {
              label: 'Dashboard Settings',
              icon: 'pi pi-fw pi-cog',
            },
            {
              label: 'Logout',
              icon: 'pi pi-fw pi-sign-out',
              command: () => this.logout(),
            },
          ],
        },
      ];
    } else {
      this.model = [
        // {
        //   label: 'Home',
        //   items: [
        //     {
        //       label: 'Dashboard',
        //       icon: 'pi pi-fw pi-chart-bar',
        //       routerLink: ['/dashboard'],
        //     },
        //   ],
        // },
        // {
        //   label: 'Orders',
        //   items: [
        //     {
        //       label: 'Track Orders',
        //       icon: 'pi pi-fw pi-truck',
        //       routerLink: ['/dashboard/orders/orders'],
        //     },
        //     {
        //       label: 'Order History',
        //       icon: 'pi pi-fw pi-history',
        //       routerLink: ['/dashboard/orders/history'],
        //     },
        //   ],
        // },
        // {
        //   label: 'Notifications',
        //   items: [
        //     {
        //       label: 'Send Notifications',
        //       icon: 'pi pi-fw pi-mobile',
        //       routerLink: ['/dashboard/notifications'],
        //     },
        //   ],
        // },
        {
          label: 'Settings',
          items: [
            {
              label: 'Dashboard Settings',
              icon: 'pi pi-fw pi-cog',
            },
            {
              label: 'Logout',
              icon: 'pi pi-fw pi-sign-out',
              command: () => this.logout(),
            },
          ],
        },
      ];
    }
  }

  logout(): void {
    this._ConfirmationService.confirm({
      message: 'Are you sure you want to log out?',
      header: 'Logout Confirmation',
      icon: 'pi pi-exclamation-triangle',
      rejectLabel: 'No',
      acceptLabel: 'Yes',
      closeOnEscape: true,
      acceptButtonStyleClass: 'p-button-danger mx-2',

      accept: () => {
        localStorage.removeItem('user');
        this._Router.navigate(['/login']);
      },
      reject: () => {},
    });
  }

}
