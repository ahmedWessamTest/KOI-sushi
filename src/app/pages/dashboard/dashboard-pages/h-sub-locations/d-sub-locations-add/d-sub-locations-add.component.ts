import { Component, inject } from "@angular/core";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";
import { MessageService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { DialogModule } from "primeng/dialog";
import { InputSwitchModule } from "primeng/inputswitch";
import { timer } from "rxjs";
import { IAddSubLocationBody } from "../../../../../core/Interfaces/e-sublocations/IAddSubLocationBody";
import { SubLocationsService } from "../../../../../core/services/e-sublocations/sub-locations.service";
import { DropdownModule } from "primeng/dropdown";
import { GovernoratesData } from "../../../../../core/Interfaces/e-sublocations/IGetSubLocationsBranches";
import { IGetSubLocationById } from "../../../../../core/Interfaces/e-sublocations/IGetSubLocationById";
import { DividerModule } from "primeng/divider";
import { FloatLabelModule } from "primeng/floatlabel";
import { CommonModule } from "@angular/common";
import { OnlyNumberDirective } from "../../../../../only-number.directive";
import { BranchesService } from "../../../../../core/services/j-branches/branches.service";
import { Branches } from "../../../../../core/Interfaces/j-branches/IAllBranches";

@Component({
  selector: "app-d-sub-locations-add",
  standalone: true,
  imports: [
    ButtonModule,
    CardModule,
    InputSwitchModule,
    CommonModule,
    DialogModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    DropdownModule,
    DividerModule,
    FloatLabelModule,
    OnlyNumberDirective,
  ],
  templateUrl: "./d-sub-locations-add.component.html",
  styleUrl: "./d-sub-locations-add.component.scss",
  providers: [MessageService],
})
export class DSubLocationsAddComponent {
  subLocationForm: FormGroup;

  isEditing = false;

  subLocationId: string | null = null;

  governorates: GovernoratesData[] = [];

  Branches: Branches[] = [];

  private fb = inject(FormBuilder);

  private subLocationsService = inject(SubLocationsService);
  private branchesService = inject(BranchesService)
  private ngxSpinnerService = inject(NgxSpinnerService);

  private router = inject(Router);

  private messageService = inject(MessageService);

  private activatedRoute = inject(ActivatedRoute);

  constructor() {
    this.subLocationForm = this.fb.group({
      title_en: ["", Validators.required],
      title_ar: ["", Validators.required],
      governorate_id: ["", Validators.required],
      delivery_fee: ["", Validators.required],
      branch_id: ["", Validators.required],
      status: [true, Validators.required],
    });
  }

  ngOnInit() {
    const DATA = this.activatedRoute.snapshot.data["subLocations"] ;
    this.getGovernoratesData();
      this.getBranches()
    if (DATA) {
      this.isEditing = true;
        
      this.patchFormValues(DATA.data)    
      // this.Branches = DATA.branches;
      // this.locations = DATA.locations;
      this.subLocationId = DATA.data.id.toString();
    } 
  }
patchFormValues(data:any) {
  this.subLocationForm.patchValue({
    title_en: data.title_en,
      title_ar: data.title_ar,
      governorate_id: data.governorate.id,
      delivery_fee: data.delivery_fee,
      branch_id: data.branch_id,
      status: data.status,
  });
  console.log(this.subLocationForm.value);
  
}
  getGovernoratesData(): void {
    this.subLocationsService.getGoverorates().subscribe({
      next: (response) => {
        this.governorates = response.data;
      },
    });
  }
getBranches() {
  this.branchesService.getAllBranches().subscribe({
      next: (response) => {
        this.Branches = response.data;
      },
    });
}
  saveSubLocation(): void {
    this.subLocationForm.markAllAsTouched();
    if (this.subLocationForm.invalid) return;
    this.ngxSpinnerService.show("actionsLoader");
    this.messageService.clear();
    const subLocationBody: IAddSubLocationBody = this.subLocationForm.value;

    if (this.isEditing && this.subLocationId) {
      this.subLocationsService.updateLocation(this.subLocationId, subLocationBody).subscribe(() => {
        this.router.navigate(["/dashboard/sub-locations/"]);
        this.messageService.add({ severity: "success", summary: "Updated", detail: "Area updated successfully" });
        timer(200).subscribe(() => this.ngxSpinnerService.hide("actionsLoader"));
      });
    } else {
      this.subLocationsService.addLocation(subLocationBody).subscribe(() => {
        this.router.navigate(["/dashboard/sub-locations/"]);
        this.messageService.add({ severity: "success", summary: "Added", detail: "Area added successfully" });
        timer(200).subscribe(() => this.ngxSpinnerService.hide("actionsLoader"));
      });
    }
  }
}
