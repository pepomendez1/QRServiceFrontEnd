import { Injectable } from '@angular/core';
import { StoreDataService } from './store-data.service'; // Adjust the import path as needed

@Injectable({
  providedIn: 'root', // Provide the service at the root level
})
export class DocumentService {
  constructor(private storeDataService: StoreDataService) {}

  async fetchDocxContent(
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
      const result = await Mammoth.convertToHtml({ arrayBuffer });

      // Add tabindex="-1" to all <a> tags
      const modifiedContent = result.value.replace(/<a /g, '<a tabindex="-1" ');

      contentUpdater(modifiedContent);
    } catch (error) {
      console.error('Error fetching or parsing document:', error);
      contentUpdater(errorMessage);
    }
  }

  async loadTermsAndConditions(): Promise<string> {
    return new Promise((resolve) => {
      this.storeDataService.getStore().subscribe((storeData) => {
        const termsUrl =
          storeData.init_config?.terms_and_conditions ||
          '/assets/docs/terms_and_conditions.docx';

        this.fetchDocxContent(
          termsUrl,
          (content) => resolve(content),
          'Error obteniendo términos y condiciones.'
        );
      });
    });
  }

  async loadTermsAndConditionsBalanceInvestment(): Promise<string> {
    return new Promise((resolve) => {
      this.storeDataService.getStore().subscribe((storeData) => {
        const termsInvestment =
          storeData.init_config?.terms_and_conditions_investments ||
          '/assets/docs/terms_and_conditions_balance_investment.docx';

        this.fetchDocxContent(
          termsInvestment,
          (content) => resolve(content),
          'Error cargando terminos y condiciones de la cuenta remunerada'
        );
      });
    });
  }

  async loadPrivacyPolicy(): Promise<string> {
    return new Promise((resolve) => {
      this.storeDataService.getStore().subscribe((storeData) => {
        const privacyUrl =
          storeData.init_config?.privacy_policy ||
          '/assets/docs/privacy_policy.docx';

        this.fetchDocxContent(
          privacyUrl,
          (content) => resolve(content),
          'Error cargando la política de privacidad'
        );
      });
    });
  }

  async loadDisclaimer(): Promise<string> {
    return new Promise((resolve) => {
      this.storeDataService.getStore().subscribe((storeData) => {
        const affidavit =
          storeData.init_config?.affidavit_file ||
          '/assets/docs/disclaimer_default.docx';

        this.fetchDocxContent(
          affidavit,
          (content) => resolve(content),
          'Error cargando declaración jurada.'
        );
      });
    });
  }

  // --- Reglamento de Gestión  -----//
  async loadFCIPolicy(): Promise<string> {
    return new Promise((resolve) => {
      const privacyUrl = '/assets/docs/fci_policy.docx';

      this.fetchDocxContent(
        privacyUrl,
        (content) => resolve(content),
        'Error obteniendo el reglamento de gestión FCI.'
      );
    });
  }

  async loadFAQInvestment(): Promise<string> {
    return new Promise((resolve) => {
      this.storeDataService.getStore().subscribe((storeData) => {
        // Get the URL from the store or fallback to a local file
        const FAQInvestment =
          storeData.init_config?.faq_investments ||
          '/assets/docs/faq_investments.docx';

        this.fetchDocxContent(
          FAQInvestment,
          (content) => resolve(content),
          'Error obteniendo las preguntas frecuentes sobre inversiones'
        );
      });
    });
  }

  async loadHelpContent(): Promise<string> {
    return new Promise((resolve) => {
      this.storeDataService.getStore().subscribe((storeData) => {
        // Get the URL from the store or fallback to a local file
        const helpDoc =
          storeData.init_config?.help_content_doc ||
          '/assets/docs/help_content.docx';

        this.fetchDocxContent(
          helpDoc,
          (content) => resolve(content),
          'Error obteniendo el contenido de Ayuda'
        );
      });
    });
  }
}
