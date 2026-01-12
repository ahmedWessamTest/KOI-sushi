import { Component, inject } from "@angular/core";
import { Table, TableModule } from "primeng/table";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { DropdownModule } from "primeng/dropdown";
import { ConfirmationService, MessageService } from "primeng/api";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { ButtonModule } from "primeng/button";
import { UsersService } from "../../../../../core/services/p-users/users.service";
import { usersData } from "../../../../../core/Interfaces/p-users/IGetAllUsers";
import { NgxSpinnerService } from "ngx-spinner";
import { timer } from "rxjs";
import { InputSwitchModule } from "primeng/inputswitch";
import { LoadingDataBannerComponent } from "../../../../../shared/components/loading-data-banner/loading-data-banner.component";
import { ToastModule } from "primeng/toast";
import { RouterLink } from "@angular/router";
import { MultiSelectModule } from "primeng/multiselect";

@Component({
  selector: "app-a-all-users",
  standalone: true,
  imports: [
    TableModule,
    CommonModule,
    FormsModule,
    DropdownModule,
    ConfirmDialogModule,
    ButtonModule,
    InputSwitchModule,
    LoadingDataBannerComponent,
    ToastModule,
    RouterLink,
    MultiSelectModule,
],
  templateUrl: "./a-all-users.component.html",
  styleUrl: "./a-all-users.component.scss",
  providers: [ConfirmationService, MessageService],
})
export class AAllUsersComponent {
  userStatusOptions = [
  { label: 'Active', key: 'is_active' },
  { label: 'Verified', key: 'is_verified' },
  { label: 'Deleted', key: 'is_deleted' },
]
  users: usersData[] = [];
  selectedUsers: usersData[] = [];

  roles: string[] = ["User", "Admin"];

  private confirmationService = inject(ConfirmationService);

  private ngxSpinnerService = inject(NgxSpinnerService);

  private messageService = inject(MessageService);

  private usersService = inject(UsersService);

  ngOnInit(): void {
    this.loadUsers();
  }


  onGlobalFilter(dt: Table, event: any) {
    const value = event.target.value;
    dt.filterGlobal(value, "contains");
  }

  confirmRoleChange(user: any): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to change the role of ${user.name}?`,
      header: "Confirm Role Change",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        user.role = user.role === "User" ? "Admin" : "User";
        // this.adminUserService.updateUser(user).subscribe(() => {
        //   this.messageService.add({
        //     severity: "success",
        //     summary: "Success",
        //     detail: `User role updated to ${user.role}`,
        //   });
        // });
      },
    });
  }

  confirmToggleStatus(user: any): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to ${user.status === "Active" ? "deactivate" : "activate"} ${user.name}?`,
      header: "Confirm Status Change",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        user.status = user.status === "Active" ? "Inactive" : "Active";
        // this.adminUserService.updateUser(user).subscribe(() => {
        //   this.messageService.add({
        //     severity: "success",
        //     summary: "Success",
        //     detail: `User status changed to ${user.status}`,
        //   });
        // });
      },
    });
  }

  confirmDelete(user: any): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${user.name}? This action cannot be undone.`,
      header: "Confirm Deletion",
      icon: "pi pi-exclamation-triangle",
      // accept: () => {
      //   this.adminUserService.deleteUser(user.id).subscribe(() => {
      //     this.users = this.users.filter((u) => u.id !== user.id);
      //     this.filteredUsers = this.filteredUsers.filter((u) => u.id !== user.id);
      //     this.messageService.add({ severity: "success", summary: "Deleted", detail: `User ${user.name} deleted.` });
      //   });
      // },
    });
  }

  // Toggle Coupon
  toggleUsersStatus(usersData: usersData) {
    this.ngxSpinnerService.show("actionsLoader");
    this.messageService.clear();

    const updatedStatus = usersData.status ; // Toggle between 0 and 1
    if (updatedStatus) {
      this.usersService.toggleUserStatus(usersData.id.toString()).subscribe(() => {
        usersData.status = updatedStatus; // Update the UI immediately
        this.messageService.add({
          severity: "success",
          summary: "Updated",
          detail: `User ${updatedStatus ? "Enabled" : "Disabled"} successfully`,
        });
        timer(200).subscribe(() => this.ngxSpinnerService.hide("actionsLoader"));
      });
    } 
  }

  totalRecords: number = 0;
  rowsPerPage = 10;
  currentPage = 1;

  onPageChange(event: any) {
    this.rowsPerPage = event.rows;
    this.currentPage = (event.first / event.rows) + 1
    this.loadUsers();
  }

  loadUsers() {
    this.ngxSpinnerService.show("actionsLoader");

    this.usersService.getAllUsers(this.currentPage, this.rowsPerPage).subscribe({
      next: (response) => {
        this.ngxSpinnerService.hide("actionsLoader");
        this.users = response.data.data;
        this.totalRecords = response.data.total;
        console.log(this.totalRecords);
        
      },
    });
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

  disableSelectedUsers(): void {
    this.confirmationService.confirm({
      message: "Are you sure you want to disable selected users?",
      header: "Disable Confirmation",
      icon: "pi pi-exclamation-triangle",
      rejectLabel: "No",
      acceptLabel: "Yes",
      closeOnEscape: true,
      acceptButtonStyleClass: "p-button-danger mx-2",

      accept: () => {
        this.ngxSpinnerService.show("actionsLoader");
        console.log(this.selectedUsers);
        
        const SelectedUsers = this.selectedUsers.map((user) => user.id);
        let data = { users: SelectedUsers, status: false };
        this.usersService.disableSelectedUsers(data).subscribe((response) => {
          this.loadUsers();
          this.selectedUsers = [];
        });
      },
      reject: () => {},
    });
  }
  enableSelectedUsers(): void {
    this.confirmationService.confirm({
      message: "Are you sure you want to enable selected users?",
      header: "Enable Confirmation",
      icon: "pi pi-exclamation-triangle",
      rejectLabel: "No",
      acceptLabel: "Yes",
      closeOnEscape: true,
      acceptButtonStyleClass: "p-button-danger mx-2",

      accept: () => {
        this.ngxSpinnerService.show("actionsLoader");
        const SelectedUsers = this.selectedUsers.map((user) => user.id);
        let data = { users: SelectedUsers, status: true };
        this.usersService.enableSelectedUsers(data).subscribe((response) => {
          this.loadUsers();
          this.selectedUsers = [];
        });
      },
      reject: () => {},
    });
  }
  getUserStatusModel(user: usersData): string[] {
  const selected: string[] = [];

  // if (user.is_active) selected.push('is_active');
  // if (user.is_verified) selected.push('is_verified');
  // if (user.is_deleted) selected.push('is_deleted');

  return selected;
}
onUserStatusChange(user: usersData, event: any) {
  const selectedKeys: string[] = event.value;

  const payload: any = {};

  payload.is_active = selectedKeys.includes('is_active');
  payload.is_verified = selectedKeys.includes('is_verified');
  payload.is_deleted = selectedKeys.includes('is_deleted');

  this.ngxSpinnerService.show('actionsLoader');

  // this.usersService.updateUser(user.id.toString(), payload).subscribe({
  //   next: () => {
  //     // sync UI
  //     user.is_active = payload.is_active;
  //     user.is_verified = payload.is_verified;
  //     user.is_deleted = payload.is_deleted;

  //     this.messageService.add({
  //       severity: 'success',
  //       summary: 'Updated',
  //       detail: 'User status updated'
  //     });

  //     this.ngxSpinnerService.hide('actionsLoader');
  //   },
  //   error: () => {
  //     this.ngxSpinnerService.hide('actionsLoader');
  //   }
  // });
}


}
