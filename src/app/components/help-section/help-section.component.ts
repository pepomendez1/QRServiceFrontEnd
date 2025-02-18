import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreDataService } from 'src/app/services/store-data.service';
import { SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-help-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './help-section.component.html',
  styleUrl: './help-section.component.scss',
})
export class HelpSectionComponent {
  iframeUrl: string = '';
  fileContent!: SafeHtml; // Update type to SafeHtml

  constructor(private storeDataService: StoreDataService) {}

  ngOnInit(): void {
    this.storeDataService.getStore().subscribe((data) => {
      if (data.init_config?.iframe_help_url) {
        this.iframeUrl = data.init_config.iframe_help_url || '';
      } else {
        this.loadHelpContent();
      }
    });
  }

  private loadHelpContent(): void {
    this.storeDataService.getStore().subscribe((storeData) => {
      // Get the URL from the store or fallback to a local file
      const termsUrl =
        storeData.init_config?.help_content_doc ||
        '/assets/docs/help_content.docx';

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
