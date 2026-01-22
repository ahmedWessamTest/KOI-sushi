import { ResolveFn } from "@angular/router";
import { inject } from "@angular/core";
import { NgxSpinnerService } from "ngx-spinner";
import { finalize, timer } from "rxjs";
import { CombosService } from "../../services/d-combos/combos.service";

export const comboDetailsResolver: ResolveFn<boolean | any> = (route, state) => {
  const combosService = inject(CombosService);
  const ngxSpinnerService = inject(NgxSpinnerService);
  ngxSpinnerService.show("actionsLoader");

  if (route.paramMap.get("id")) {
    return combosService.getComboById(route.paramMap.get("id")!).pipe(
      finalize(() => {
        timer(200).subscribe(() => ngxSpinnerService.hide("actionsLoader"));
      })
    );
  }

  return true;
};
