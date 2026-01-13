import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { TagModule } from "primeng/tag";
import { ToutrialContent } from "../../../../../../core/Interfaces/a-tutorial-content/ITutorialAddResponse";

@Component({
  selector: "app-b-tutorial-details",
  standalone: true,
  imports: [TagModule, CommonModule, CardModule, ButtonModule, RouterLink],
  templateUrl: "./b-tutorial-details.component.html",
  styleUrl: "./b-tutorial-details.component.scss",
})
export class BTutorialDetailsComponent {
  private ActivatedRoute = inject(ActivatedRoute);

  tutorialData!: ToutrialContent;

  ngOnInit(): void {
    this.tutorialData = this.ActivatedRoute.snapshot.data["tutorial"].data;
  }
}
