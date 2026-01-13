import { CommonModule, CurrencyPipe } from "@angular/common";
import { Component, inject } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { TagModule } from "primeng/tag";
import { IGetSubLocationById } from "../../../../../core/Interfaces/e-sublocations/IGetSubLocationById";
import { IBranch, ILocation } from "../../../../../core/Interfaces/e-sublocations/IGetSubLocationsBranches";

@Component({
  selector: "app-b-sub-locations-details",
  standalone: true,
  imports: [TagModule, CommonModule, CardModule, ButtonModule, RouterLink, CurrencyPipe],
  templateUrl: "./b-sub-locations-details.component.html",
  styleUrl: "./b-sub-locations-details.component.scss",
})
export class BSubLocationsDetailsComponent {
  private ActivatedRoute = inject(ActivatedRoute);
  location: ILocation = {} as ILocation;


  ngOnInit(): void {
    this.location = this.ActivatedRoute.snapshot.data["subLocations"].data;
  }

}
