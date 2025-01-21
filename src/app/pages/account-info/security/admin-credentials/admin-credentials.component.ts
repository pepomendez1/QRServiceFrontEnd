import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SidePanelHeaderComponent } from '@fe-treasury/shared/side-panel/side-panel-header/side-panel-header.component';
import { SidePanelFooterComponent } from '@fe-treasury/shared/side-panel/side-panel-footer/side-panel-footer.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { ChangePinComponent } from './change-pin/change-pin.component';

@Component({
  selector: 'app-admin-credentials',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    SidePanelHeaderComponent,
    MatProgressSpinnerModule,
    SidePanelFooterComponent,
    ChangePinComponent,
    ChangePasswordComponent,
  ],
  templateUrl: './admin-credentials.component.html',
  styleUrl: './admin-credentials.component.scss',
})
export class AdminCredentialsComponent {
  @Output() backToOptions = new EventEmitter<void>();
  credentialOpt: string = 'start';

  handleArrowBack() {
    this.backToOptions.emit();
  }

  changeRecoveryOpt(recoveryOpt: string) {
    this.credentialOpt = recoveryOpt;
  }
}
