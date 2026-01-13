import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ToastModule } from 'primeng/toast';
import { timer } from 'rxjs';
import { IAddBranchBody } from '../../../../../../core/Interfaces/j-branches/IAddBranchBody';
import { BranchesService } from '../../../../../../core/services/j-branches/branches.service';
import { OnlyNumberDirective } from '../../../../../../only-number.directive';
import { FileUploadModule } from 'primeng/fileupload';
import { CalendarModule } from 'primeng/calendar';
import { GovernoratesData } from '../../../../../../core/Interfaces/e-sublocations/IGetSubLocationsBranches';
import { SubLocationsService } from '../../../../../../core/services/e-sublocations/sub-locations.service';
import { DropdownModule } from "primeng/dropdown";

@Component({
  selector: 'app-b-branch-add',
  standalone: true,
  imports: [
    ButtonModule,
    CardModule,
    InputSwitchModule,
    DialogModule,
    FormsModule,
    ReactiveFormsModule,
    ToastModule,
    RouterLink,
    OnlyNumberDirective,
    FileUploadModule,
    CalendarModule,
    DropdownModule
],
  templateUrl: './b-branch-add.component.html',
  styleUrl: './b-branch-add.component.scss',
  providers: [MessageService],
})
export class BBranchAddComponent {
  branchForm: FormGroup;

  isEditing = false;
  
  branchId: string | null = null;
  lightImageBase: string = '';
  private fb = inject(FormBuilder);
  governorates: GovernoratesData[] = [];
  private branchesService = inject(BranchesService);

  private ngxSpinnerService = inject(NgxSpinnerService);
  private subLocationsService = inject(SubLocationsService);
  private router = inject(Router);

  private messageService = inject(MessageService);

  private activatedRoute = inject(ActivatedRoute);

  constructor() {
    this.branchForm = this.fb.group(
      {
        title_en: ['', Validators.required],
        title_ar: ['', Validators.required],
        address_en: ['', Validators.required],
        address_ar: ['', Validators.required],
        disable_en: ['', Validators.required],
        disable_ar: ['', Validators.required],
        governorate_id:['',Validators.required],
        phone_primary: [
          '',
          [Validators.required, Validators.pattern(/^0?[0-9]{9,}$/)],
        ],
        phone_secondary: ['', [Validators.pattern(/^0?[0-9]{9,}$/)]],
        phone_tertiary: ['', [Validators.pattern(/^0?[0-9]{9,}$/)]],
        opening_time: ['', Validators.required],
        closing_time: ['', Validators.required],
        light_map: [null],
        location_url: [
          '',
          [
            Validators.required,
            Validators.pattern(/^https?:\/\/(www\.)?google\.com\/maps\/.+$/i),
          ],
        ],
        status: [true, Validators.required],
      },
      { validators: this.timeRangeValidator }
    );
  }
  timeRangeValidator(form: FormGroup) {
    const opening = form.get('opening_time')?.value;
    const closing = form.get('closing_time')?.value;

    if (!opening || !closing) return null;

    if (closing <= opening) {
      return { invalidTimeRange: true };
    }

    return null;
  }

  ngOnInit() {
    this.getGovernoratesData();
    const branchData = this.activatedRoute.snapshot.data['branch'];
    if (branchData) {
      this.isEditing = true;
      this.patchFormValues(branchData.data);
      this.branchId = branchData.data.id;
    }
  }
  getGovernoratesData(): void {
    this.subLocationsService.getGoverorates().subscribe({
      next: (response) => {
        this.governorates = response.data;
      },
    });
  }
  patchFormValues(data: any) {
    this.branchForm.patchValue({
      title_en: data.title_en,
      title_ar: data.title_ar,
      governorate_id:data.governorate_id,
      address_en: data.address_en,
      address_ar: data.address_ar,
      disable_en: data.disable_en,
      disable_ar: data.disable_ar,
      phone_primary: data.phone_primary,
      phone_secondary: data.phone_secondary,
      phone_tertiary: data.phone_tertiary,
      opening_time: data.opening_time,
      closing_time: data.closing_time,
      location_url: data.location_url,
      status: data.status,
    });
    this.lightImageBase = data.light_map;
  }
  saveBranch() {
    this.branchForm.markAllAsTouched();
    if (this.branchForm.invalid) return;
    this.ngxSpinnerService.show('actionsLoader');
    this.messageService.clear();
    const branchData: FormData = new FormData();
    Object.entries(this.branchForm.value).forEach(([key, value]: any) => {
      if (value == null) return;
      if (key === 'opening_time' || key === 'closing_time') {
        let date: Date;
        if (value instanceof Date) {
          date = value;
        } else {
          // لو جاية string زي "22:00:00"
          const [h, m, s] = value.split(':');
          date = new Date();
          date.setHours(+h, +m, +(s || 0));
        }

        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        const time = `${hours}:${minutes}`;
        console.log(time);

        branchData.append(key, time);
      } else if (key === 'status') {
        const statusValue = key ? '1' : '0';
        branchData.append(key, statusValue);
      } else {
        branchData.append(key, value);
      }
    });
    if (this.isEditing && this.branchId) {
      this.branchesService
        .updateBranch(this.branchId, branchData)
        .subscribe(() => {
          this.router.navigate(['/dashboard/contact-us/branches']);
          this.messageService.add({
            severity: 'success',
            summary: 'Updated',
            detail: 'Branch updated successfully',
          });
          timer(200).subscribe(() =>
            this.ngxSpinnerService.hide('actionsLoader')
          );
        });
    } else {
      this.branchesService.addBranch(branchData).subscribe(() => {
        this.router.navigate(['/dashboard/contact-us/branches']);
        this.messageService.add({
          severity: 'success',
          summary: 'Added',
          detail: 'Branch added successfully',
        });
        timer(200).subscribe(() =>
          this.ngxSpinnerService.hide('actionsLoader')
        );
      });
    }
  }
  onLightMapSelect(event: any) {
    const file = event.files?.[0];
    if (file) {
      this.branchForm.patchValue({
        light_map: file,
      });
      this.branchForm.get('light_map')?.markAsTouched();
      this.lightImageBase = '';
    }
  }
  clearImage(): void {
    this.branchForm.patchValue({ light_map: '' });
  }
}
