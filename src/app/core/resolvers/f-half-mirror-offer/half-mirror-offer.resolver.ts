import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { finalize, timer } from 'rxjs';
import { HalfMirrorOfferService } from '../../services/f-half-mirror-offer/half-mirror-offer.service';

export const halfMirrorOfferResolver: ResolveFn<boolean | any> = (
  route,
  state,
) => {
  const service = inject(HalfMirrorOfferService);
  const ngxSpinnerService = inject(NgxSpinnerService);
  ngxSpinnerService.show('actionsLoader');

  return service.getMirrorOffer().pipe(
    finalize(() => {
      timer(200).subscribe(() => ngxSpinnerService.hide('actionsLoader'));
    }),
  );
};
