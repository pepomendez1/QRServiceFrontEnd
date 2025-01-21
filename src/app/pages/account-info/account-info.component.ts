import { Component } from '@angular/core';
import { SidePanelService } from '@fe-treasury/shared/side-panel/side-panel.service';
import { TreasuryAccountInfoComponent } from 'src/app/components/treasury-account-info/treasury-account-info.component';
import { AdminDataComponent } from './admin-data/admin-data.component';
import { LegalInfoComponent } from './legal-info/legal-info.component';
import { SecurityComponent } from './security/security.component';
@Component({
  selector: 'app-account-info',
  templateUrl: './account-info.component.html',
  styleUrl: './account-info.component.scss',
})
export class AccountInfoComponent {
  constructor(private sidePanelService: SidePanelService) {}

  openAdminInfo(): void {
    this.sidePanelService.open(
      AdminDataComponent,
      'Datos del administrador',
      {},
      false
    );
  }
  openAccounData(): void {
    this.sidePanelService.open(
      TreasuryAccountInfoComponent,
      'Datos de la cuenta',
      {},
      false
    );
  }
  openSecurityPanel(): void {
    this.sidePanelService.open(SecurityComponent, 'Seguridad', {}, false);
  }
  openLegalInfo(): void {
    this.sidePanelService.open(
      LegalInfoComponent,
      'Información Legal',
      {},
      false
    );
  }
}
