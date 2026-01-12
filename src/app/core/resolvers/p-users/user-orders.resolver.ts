import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { finalize, timer } from 'rxjs';
import { UsersService } from '../../services/p-users/users.service';
import { NgxSpinnerService } from 'ngx-spinner';

export const userOrdersResolver: ResolveFn<boolean | any> = (route, state) => {
  const usersService = inject(UsersService);
    const ngxSpinnerService = inject(NgxSpinnerService);
    ngxSpinnerService.show("actionsLoader");
    return usersService.getUserOrders(route.paramMap.get("id")!).pipe(
      finalize(() => {
        timer(200).subscribe(() => ngxSpinnerService.hide("actionsLoader"));
      })
    );
};
