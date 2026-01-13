import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { WEB_SITE_BASE_URL } from "../../constants/WEB_SITE_BASE_UTL";
import { IAddBranchBody } from "../../Interfaces/j-branches/IAddBranchBody";
import { IBranchById } from "../../Interfaces/j-branches/IBranchById";
import { IAddBranch } from "../../Interfaces/j-branches/IAddBranch";
import { IUpdateBranch } from "../../Interfaces/j-branches/IUpdateBranch";
import { IToggleBranch } from "../../Interfaces/j-branches/IToggleBranch";
import { IAllBranches } from "../../Interfaces/j-branches/IAllBranches";

@Injectable({
  providedIn: "root",
})
export class BranchesService {
  constructor(private http: HttpClient) {}

  getAllBranches() {
    return this.http.get<IAllBranches>(`${WEB_SITE_BASE_URL}branches`);
  }
  getBranchById(branchId: string) {
    return this.http.get<IBranchById>(`${WEB_SITE_BASE_URL}branches/${branchId}`);
  }
  addBranch(branchData: FormData) {
    return this.http.post<IAddBranch>(`${WEB_SITE_BASE_URL}branches`, branchData);
  }
  updateBranch(branchId: string, branchData: FormData) {
    return this.http.post<IUpdateBranch>(`${WEB_SITE_BASE_URL}branches/${branchId}`, branchData);
  }
  destroyBranch(branchId: string) {
    return this.http.post<IToggleBranch>(`${WEB_SITE_BASE_URL}branch_destroy/${branchId}`, {});
  }
  toggleBranch(branchId: string) {
    return this.http.post<IToggleBranch>(`${WEB_SITE_BASE_URL}branches/${branchId}/toggle`, {});
  }
}
