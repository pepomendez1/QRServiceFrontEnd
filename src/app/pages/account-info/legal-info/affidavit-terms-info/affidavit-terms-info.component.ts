import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreDataService } from 'src/app/services/store-data.service';
import { SidePanelHeaderComponent } from '@fe-treasury/shared/side-panel/side-panel-header/side-panel-header.component';
import { DISCLAIMER_CONTENT } from 'src/app/pages/onboarding/affidavit-terms/terms-cond/disclaimer-text.constant';
import { TERMS_AND_CONDITIONS_INV_SALDOS } from 'src/app/pages/onboarding/affidavit-terms/terms-cond/terms-inv.constant';
import { TERMS_AND_CONDITIONS_CONTENT } from 'src/app/pages/onboarding/affidavit-terms/terms-cond/terms-and-cond.constant';

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
      default:
        break;
    }
  }

  private loadTermsAndConditions(): void {
    this.storeDataService.getStore().subscribe((storeData) => {
      // Get the URL from the store or fallback to a local file
      const termsUrl =
        storeData.init_config?.terms_and_conditions ||
        '/assets/docs/terms_and_conditions.docx';

      // Fetch the document content
      this.fetchDocxContent(termsUrl);
    });
  }

  private async fetchDocxContent(url: string) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const arrayBuffer = await response.arrayBuffer();

      // Lazy load mammoth
      const Mammoth = await import('mammoth');
      const result = await Mammoth.extractRawText({ arrayBuffer });
      this.fileContent = result.value;
    } catch (error) {
      console.error('Error fetching or parsing terms and conditions:', error);
      this.fileContent = 'Error loading terms and conditions.';
    }
  }
  handleArrowBack() {
    this.backToTermsOpt.emit();
  }
}
