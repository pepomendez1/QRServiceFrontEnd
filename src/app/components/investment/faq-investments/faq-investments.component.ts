import { Component } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';
import { SidePanelHeaderComponent } from '@fe-treasury/shared/side-panel/side-panel-header/side-panel-header.component';
import { DocumentService } from 'src/app/services/documents.service';
@Component({
  selector: 'app-faq-investments',
  standalone: true,
  imports: [SidePanelHeaderComponent],
  templateUrl: './faq-investments.component.html',
  styleUrl: './faq-investments.component.scss',
})
export class FaqInvestmentsComponent {
  fileContent!: SafeHtml; // Update type to SafeHtml

  constructor(private documentService: DocumentService) {}
  async ngOnInit() {
    this.fileContent = await this.documentService.loadFAQInvestment();
  }
}
