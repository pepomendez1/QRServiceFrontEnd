import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { StoreDataService } from 'src/app/services/store-data.service';
import { SidePanelHeaderComponent } from '@fe-treasury/shared/side-panel/side-panel-header/side-panel-header.component';
@Component({
  selector: 'app-faq-investments',
  standalone: true,
  imports: [SidePanelHeaderComponent],
  templateUrl: './faq-investments.component.html',
  styleUrl: './faq-investments.component.scss',
})
export class FaqInvestmentsComponent {
  fileContent!: SafeHtml; // Update type to SafeHtml

  constructor(private storeDataService: StoreDataService) {}
  ngOnInit() {
    this.loadFAQInvestment();
  }

  private loadFAQInvestment(): void {
    this.storeDataService.getStore().subscribe((storeData) => {
      // Get the URL from the store or fallback to a local file
      const termsUrl =
        storeData.init_config?.faq_investments ||
        '/assets/docs/faq_investments.docx';

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

      // Lazy load Mammoth
      const Mammoth = await import('mammoth');

      // Extract HTML content with Mammoth
      const result = await Mammoth.convertToHtml({ arrayBuffer });

      // Set file content with HTML output
      this.fileContent = result.value;

      // Log warnings for unsupported styles
      if (result.messages.length) {
        console.warn('Mammoth warnings:', result.messages);
      }
    } catch (error) {
      console.error('Error fetching or parsing terms and conditions:', error);
      this.fileContent = 'Error obteniendo Contenido de preguntas frecuentes';
    }
  }
}
