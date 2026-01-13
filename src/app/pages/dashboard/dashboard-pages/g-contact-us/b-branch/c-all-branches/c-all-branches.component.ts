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
import { Branches, BranchesData } from "../../../../../../core/Interfaces/j-branches/IAllBranches";
import { BranchesService } from "../../../../../../core/services/j-branches/branches.service";
import { LoadingDataBannerComponent } from "../../../../../../shared/components/loading-data-banner/loading-data-banner.component";
@Component({
  selector: "app-c-all-branches",
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
  ],
  templateUrl: "./c-all-branches.component.html",
  styleUrl: "./c-all-branches.component.scss",
  providers: [MessageService],
})
export class CAllBranchesComponent {
  branches: Branches[] = [];

  loading = false;

  private ngxSpinnerService = inject(NgxSpinnerService);

  private branchesService = inject(BranchesService);

  private messageService = inject(MessageService);

  ngOnInit() {
    this.fetchBranches();
  }

  // get All Branches
  fetchBranches() {
    this.loading = true;
    this.branchesService.getAllBranches().subscribe(
      (response) => {
        this.branches = response.data;
        this.loading = false;
      },
      () => {
        this.loading = false;
        this.messageService.add({ severity: "error", summary: "Error", detail: "Failed to load branches" });
      }
    );
  }

  // Toggle Branches
  toggleBranchStatus(branch: any) {
    this.ngxSpinnerService.show("actionsLoader");
    this.messageService.clear();

    const updatedStatus = !branch.status; // Toggle between 0 and 1
      this.branchesService.toggleBranch(branch.id.toString()).subscribe(() => {
        branch.status = updatedStatus; // Update the UI immediately
        this.messageService.add({
          severity: "success",
          summary: "Updated",
          detail: `Branch ${updatedStatus ? "Enabled" : "Disabled"} successfully`,
        });
        timer(200).subscribe(() => this.ngxSpinnerService.hide("actionsLoader"));
      });
  }
}
