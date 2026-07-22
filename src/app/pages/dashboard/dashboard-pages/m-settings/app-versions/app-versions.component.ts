import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { finalize, timer } from 'rxjs';
import {
  IAppVersionsGetResponse,
  IAppVersionsUpdatePayload,
} from '../../../../../core/Interfaces/q-app-versions/IAppVersions';
import { AppVersionsService } from '../../../../../core/services/q-app-versions/app-versions.service';

@Component({
  selector: 'app-app-versions',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    ToastModule,
  ],
  templateUrl: './app-versions.component.html',
  styleUrl: './app-versions.component.scss',
  providers: [MessageService],
})
export class AppVersionsComponent implements OnInit {
  versionForm: FormGroup;
  isLoading = false;

  private fb = inject(FormBuilder);
  private appVersionsService = inject(AppVersionsService);
  private ngxSpinnerService = inject(NgxSpinnerService);
  private messageService = inject(MessageService);

  // Version pattern validator (e.g. 1.0.0 or 1.0)
  readonly versionPattern = /^\d+\.\d+(\.\d+)?$/;

  constructor() {
    this.versionForm = this.fb.group({
      ios_version: [
        '',
        [Validators.required, Validators.pattern(this.versionPattern)],
      ],
      android_version: [
        '',
        [Validators.required, Validators.pattern(this.versionPattern)],
      ],
    });
  }

  ngOnInit(): void {
    this.getVersions();
  }

  getVersions(): void {
    this.isLoading = true;
    this.ngxSpinnerService.show('actionsLoader');
    this.appVersionsService
      .getAppVersions()
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.ngxSpinnerService.hide('actionsLoader');
        })
      )
      .subscribe({
        next: (response: IAppVersionsGetResponse) => {
          if (response?.success && response?.data) {
            this.versionForm.patchValue({
              android_version: response.data.android?.version || '',
              ios_version: response.data.ios?.version || '',
            });
          }
        },
        error: (err) => {
          console.error('Error fetching app versions', err);
        },
      });
  }

  saveVersions(): void {
    this.versionForm.markAllAsTouched();
    if (this.versionForm.invalid) return;

    this.ngxSpinnerService.show('actionsLoader');
    this.messageService.clear();

    const versionsData: IAppVersionsUpdatePayload = this.versionForm.value;

    this.appVersionsService
      .updateAppVersions(versionsData)
      .pipe(
        finalize(() => {
          timer(300).subscribe(() =>
            this.ngxSpinnerService.hide('actionsLoader')
          );
        })
      )
      .subscribe({
        next: (res: any) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: res?.message || 'App versions updated successfully',
          });
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err?.error?.message || 'Failed to update app versions',
          });
        },
      });
  }
}
