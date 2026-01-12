import { inject } from "@angular/core";
import { ResolveFn } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";
import { finalize, timer } from "rxjs";
import { UsersService } from "../../services/p-users/users.service";

export const usersAddressDataResolver: ResolveFn<any> = (route, state) => {
    const  usersService = inject(UsersService);
  
  const ngxSpinnerService = inject(NgxSpinnerService);
  ngxSpinnerService.show("actionsLoader");
  return usersService.getUserAddress(route.params['id']).pipe(
    finalize(() => {
      timer(200).subscribe(() => ngxSpinnerService.hide("actionsLoader"));
    })
  );
};
