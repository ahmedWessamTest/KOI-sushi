import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { finalize, timer } from 'rxjs';
import { CustomOffersService } from '../../services/g-custom-offers/custom-offers.service';

export const customOfferDetailsResolver: ResolveFn<any> = (route, state) => {
  const service = inject(CustomOffersService);
  const ngxSpinnerService = inject(NgxSpinnerService);
  const id = route.paramMap.get('id');

  if (!id) return null;

  ngxSpinnerService.show('actionsLoader');
  return service.getCustomOfferById(id).pipe(
    finalize(() => {
      timer(200).subscribe(() => ngxSpinnerService.hide('actionsLoader'));
    }),
  );
};
