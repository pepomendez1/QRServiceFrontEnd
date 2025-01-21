import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { SidePanelHeaderComponent } from '@fe-treasury/shared/side-panel/side-panel-header/side-panel-header.component';
import { SidePanelService } from '@fe-treasury/shared/side-panel/side-panel.service';
import { AffidavitTermsInfoComponent } from './affidavit-terms-info/affidavit-terms-info.component';
@Component({
  selector: 'app-legal-info',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    SidePanelHeaderComponent,
    AffidavitTermsInfoComponent,
  ],
  templateUrl: './legal-info.component.html',
  styleUrl: './legal-info.component.scss',
})
export class LegalInfoComponent {
  showTerms: boolean = false;
  termsOpt: string = '';
  constructor(private sidePanelService: SidePanelService) {}
  handleArrowBack() {
    this.sidePanelService.close();
  }
  openTerms(terms: string): void {
    this.termsOpt = terms;
    this.showTerms = true;
  }
  returnToOpts() {
    this.showTerms = false;
  }
}
