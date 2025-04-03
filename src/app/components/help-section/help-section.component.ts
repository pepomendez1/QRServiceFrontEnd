import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreDataService } from 'src/app/services/store-data.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { DocumentService } from 'src/app/services/documents.service';

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

  constructor(
    private storeDataService: StoreDataService,
    private documentService: DocumentService,
    private sanitizer: DomSanitizer
  ) {}

  async ngOnInit() {
    this.storeDataService.getStore().subscribe(async (data) => {
      if (data.init_config?.iframe_help_url) {
        // If iframe URL is available, use it
        this.iframeUrl = data.init_config.iframe_help_url;
      } else {
        // If iframe URL is not available, load the help content document
        const content = await this.documentService.loadHelpContent();
        // Sanitize the HTML content to prevent XSS attacks
        this.fileContent = this.sanitizer.bypassSecurityTrustHtml(content);
      }
    });
  }
}
