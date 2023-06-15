import { Component } from '@angular/core';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent {
  sideBarOpen = false;
  // Add dashboard for admin to control user list and setting

  toggleSideBar(): void {
    this.sideBarOpen = !this.sideBarOpen;
  }
}
