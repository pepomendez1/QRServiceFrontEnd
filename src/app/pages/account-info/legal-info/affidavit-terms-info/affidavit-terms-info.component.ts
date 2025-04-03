import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreDataService } from 'src/app/services/store-data.service';
import { SidePanelHeaderComponent } from '@fe-treasury/shared/side-panel/side-panel-header/side-panel-header.component';
import { DocumentService } from 'src/app/services/documents.service';

@Component({
  selector: 'app-affidavit-terms-info',
  standalone: true,
  imports: [CommonModule, SidePanelHeaderComponent],
  templateUrl: './affidavit-terms-info.component.html',
  styleUrl: './affidavit-terms-info.component.scss',
})
export class AffidavitTermsInfoComponent {
  @Input() termsOpt: string = '';
  @Output() backToTermsOpt = new EventEmitter<void>();
  headerTitle: string = '';
  fileContent: string = '';
  FCIPolicyContent: string = '';

  constructor(private documentService: DocumentService) {}

  async ngOnInit() {
    switch (this.termsOpt) {
      case 'terms_cond':
        this.headerTitle = 'Términos y condiciones generales ';
        this.fileContent = await this.documentService.loadTermsAndConditions();
        break;
      case 'terms_inv_sal':
        this.headerTitle = 'Términos y condiciones cuenta remunerada ';
        this.fileContent =
          await this.documentService.loadTermsAndConditionsBalanceInvestment();
        break;
      case 'disclaimer':
        this.headerTitle = 'Declaración jurada ';
        this.fileContent = await this.documentService.loadDisclaimer();
        break;
      case 'fci-policy':
        this.headerTitle = 'Reglamento de Gestión FCI ';
        this.fileContent = await this.documentService.loadFCIPolicy();
        break;
      default:
        break;
    }
  }

  handleArrowBack() {
    this.backToTermsOpt.emit();
  }
}
