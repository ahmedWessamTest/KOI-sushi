import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { finalize, timer } from 'rxjs';
import { DiscountOfferService } from '../../services/e-discount-offer/discount-offer.service';

export const discountOfferResolver: ResolveFn<boolean | any> = (
  route,
  state,
) => {
  const service = inject(DiscountOfferService);
  const ngxSpinnerService = inject(NgxSpinnerService);
  ngxSpinnerService.show('actionsLoader');

  return service.getDiscountOffer().pipe(
    finalize(() => {
      timer(200).subscribe(() => ngxSpinnerService.hide('actionsLoader'));
    }),
  );
};
