import { DatePipe, SlicePipe } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { DialogModule } from "primeng/dialog";
import { TableModule } from "primeng/table";
import { TooltipModule } from "primeng/tooltip";

import { EmailsData, IGetAllMessages } from "../../../../../core/Interfaces/l-contact-form/IGetAllMessages";
import { ContactUsInboxService } from "../../../../../core/services/l-contact-form/contact-us-inbox.service";
import { LoadingDataBannerComponent } from "../../../../../shared/components/loading-data-banner/loading-data-banner.component";
import { NoDataFoundBannerComponent } from "../../../../../shared/components/no-data-found-banner/no-data-found-banner.component";
import { RouterLink } from "@angular/router";
@Component({
  selector: "app-d-messages",
  standalone: true,
  imports: [
    TableModule,
    ButtonModule,
    DialogModule,
    CardModule,
    ReactiveFormsModule,
    FormsModule,
    TooltipModule,
    RouterLink,
    SlicePipe,
    DatePipe,
    LoadingDataBannerComponent,
    NoDataFoundBannerComponent,
  ],
  templateUrl: "./d-messages.component.html",
  styleUrl: "./d-messages.component.scss",
})
export class DMessagesComponent {
  emails: EmailsData[] = [];
  totalRecords: number = 0;
  rowsPerPage = 10;
  currentPage = 1;
  constructor(private contactUsInboxService: ContactUsInboxService) {}

  ngOnInit(): void {
    this.getAllMessages();
  }
  getAllMessages(): void {
    this.contactUsInboxService.getContactUsMessages(this.currentPage,this.rowsPerPage).subscribe({
      next: (response: any) => {
        this.emails = response.data;
        this.totalRecords = response.total
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
  onPageChange(event: any) {
    this.rowsPerPage = event.rows;
    this.currentPage = (event.first / event.rows) + 1
    this.getAllMessages();
  }
  // Filter table by name
  onGlobalFilter(table: any, event: any): void {
    table.filterGlobal(event.target.value, "contains");
  }
}
