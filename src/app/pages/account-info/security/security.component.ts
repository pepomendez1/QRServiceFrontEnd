import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SidePanelService } from '@fe-treasury/shared/side-panel/side-panel.service';
import { SidePanelHeaderComponent } from '@fe-treasury/shared/side-panel/side-panel-header/side-panel-header.component';
import { AdminCredentialsComponent } from './admin-credentials/admin-credentials.component';
import { ManageDevicesComponent } from './manage-devices/manage-devices.component';

@Component({
  selector: 'app-security',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    SidePanelHeaderComponent,
    ManageDevicesComponent,
    AdminCredentialsComponent,
  ],
  templateUrl: './security.component.html',
  styleUrl: './security.component.scss',
})
export class SecurityComponent {
  loading: boolean = false;
  securityPanelMode: string = 'options';
  constructor(private sidePanelService: SidePanelService) {}

  handleArrowBack() {
    this.sidePanelService.close();
  }
  changeMode(mode: string) {
    this.securityPanelMode = mode;
  }
}
