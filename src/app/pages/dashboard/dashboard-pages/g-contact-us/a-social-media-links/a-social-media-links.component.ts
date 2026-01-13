import { Component, inject, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ButtonModule } from "primeng/button";
import { MessagesModule } from "primeng/messages";
import { ToastModule } from "primeng/toast";
import { LoadingDataBannerComponent } from "../../../../../shared/components/loading-data-banner/loading-data-banner.component";
import { MessageService } from "primeng/api";
import { SocialLinksService } from "../../../../../core/services/k-contact-info/social-links.service";
import { ISocialMediaLinks } from "../../../../../core/Interfaces/k-contact-info/ISocialMediaLinks";
import { ISocialMediaUpdate } from "../../../../../core/Interfaces/k-contact-info/ISocialMediaUpdate";

@Component({
  selector: "app-a-social-media-links",
  standalone: true,
  imports: [FormsModule, ButtonModule, MessagesModule, ToastModule, LoadingDataBannerComponent],
  templateUrl: "./a-social-media-links.component.html",
  styleUrl: "./a-social-media-links.component.scss",
  providers: [MessageService],
})
export class ASocialMediaLinksComponent implements OnInit {
  socialMediaLinks: any[] = [];
  isLoading: boolean = false;
  private socialLinksService = inject(SocialLinksService);

  constructor(private messageService: MessageService) {}

  ngOnInit() {
    this.fetchSocialMediaLinks();
  }

  fetchSocialMediaLinks() {
    this.isLoading = true;
    this.socialLinksService.getSocialMediaLinks().subscribe({
      next: (response: ISocialMediaLinks) => {
        if (response && response.data) {
          this.socialMediaLinks = this.convertResponseToLinks(response.data);
        }
        this.isLoading = false;
      },
      error: () => {
        this.messageService.add({ severity: "error", summary: "Error", detail: "Failed to load social links" });
        this.isLoading = false;
      },
    });
  }

  // Convert API response into UI-friendly structure
  convertResponseToLinks(contact: ISocialMediaLinks["data"]): any[] {
    return [
      { key: "twitter", label: "Twitter", icon: "pi-twitter", url: contact.twitter || "" },
      { key: "snapchat", label: "Snapchat", icon: "pi-comment", url: contact.snapchat || "" },
      { key: "instagram", label: "Instagram", icon: "pi-instagram", url: contact.instagram || "" },
      { key: "whatsapp", label: "WhatsApp", icon: "pi-whatsapp", url: contact.whatsapp || "" },
      { key: "tiktok", label: "TikTok", icon: "pi-tiktok", url: contact.tiktok || "" },
      { key: "facebook", label: "Facebook", icon: "pi-facebook", url: contact.facebook || "" },
      { key: "linkedin", label: "LinkedIn", icon: "pi-linkedin", url: contact.linkedin || "" },
      { key: "email", label: "Email", icon: "pi-envelope", url: contact.email || "" },
    ].filter((link) => link.url !== null); // Remove null values
  }

  saveChanges() {
    this.isLoading = true;
    const updatedLinks = this.convertLinksToRequestBody(this.socialMediaLinks);

    this.socialLinksService.updateSocialMediaLinks(updatedLinks).subscribe({
      next: () => {
        this.messageService.add({ severity: "success", summary: "Success", detail: "Changes saved successfully" });
        this.isLoading = false;
        this.fetchSocialMediaLinks();
      },
      error: () => {
        this.messageService.add({ severity: "error", summary: "Error", detail: "Failed to save changes" });
        this.isLoading = false;
      },
    });
  }

  // Convert UI input back to API format
  convertLinksToRequestBody(links: any[]): ISocialMediaUpdate {
    const requestBody: ISocialMediaUpdate = {
      twitter: "",
      snapchat: "",
      instagram: "",
      whatsapp: "",
      tiktok: "",
      facebook: "",
      linkedin: "",
      email: "",
    };

    links.forEach((link) => {
      if (requestBody.hasOwnProperty(link.key)) {
        requestBody[link.key as keyof ISocialMediaUpdate] = link.url.trim() || "";
      }
    });

    return requestBody;
  }
}
