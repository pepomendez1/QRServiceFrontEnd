import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreDataService } from 'src/app/services/store-data.service';
import { SidePanelHeaderComponent } from '@fe-treasury/shared/side-panel/side-panel-header/side-panel-header.component';
import { DISCLAIMER_CONTENT } from 'src/app/pages/onboarding/affidavit-terms/terms-cond/disclaimer-text.constant';
import { TERMS_AND_CONDITIONS_INV_SALDOS } from 'src/app/pages/onboarding/affidavit-terms/terms-cond/terms-inv.constant';

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

  constructor(private storeDataService: StoreDataService) {}

  ngOnInit() {
    switch (this.termsOpt) {
      case 'terms_cond':
        this.headerTitle = 'Términos y condiciones generales ';
        this.loadTermsAndConditions();
        break;
      case 'terms_inv_sal':
        this.headerTitle = 'Términos y condiciones cuenta remunerada ';
        this.fileContent = TERMS_AND_CONDITIONS_INV_SALDOS;
        break;
      case 'disclaimer':
        this.headerTitle = 'Declaración jurada ';
        this.fileContent = DISCLAIMER_CONTENT;
        break;
      case 'fci-policy':
        this.headerTitle = 'Reglamento de Gestión FCI ';
        this.loadFCIPolicy();
        break;
      default:
        break;
    }
  }

  private loadTermsAndConditions(): void {
    this.storeDataService.getStore().subscribe((storeData) => {
      const termsUrl =
        storeData.init_config?.terms_and_conditions ||
        '/assets/docs/terms_and_conditions.docx';

      this.fetchDocxContent(
        termsUrl,
        (content) => (this.fileContent = content),
        'Error loading terms and conditions.'
      );
    });
  }

  private loadFCIPolicy(): void {
    const privacyUrl = '/assets/docs/fci_policy.docx';

    this.fetchDocxContent(
      privacyUrl,
      (content) => (this.fileContent = content),
      'Error loading FCI policy.'
    );
  }

  private async fetchDocxContent(
    url: string,
    contentUpdater: (content: string) => void,
    errorMessage: string
  ) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const arrayBuffer = await response.arrayBuffer();

      // Lazy load Mammoth
      const Mammoth = await import('mammoth');
      const result = await Mammoth.extractRawText({ arrayBuffer });
      contentUpdater(result.value);
    } catch (error) {
      console.error('Error fetching or parsing document:', error);
      contentUpdater(errorMessage);
    }
  }

  handleArrowBack() {
    this.backToTermsOpt.emit();
  }
}
