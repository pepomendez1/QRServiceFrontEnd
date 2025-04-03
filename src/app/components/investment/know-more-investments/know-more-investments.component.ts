import { Component } from '@angular/core';
import { SvgLibraryService } from 'src/app/services/svg-library.service';
import { SidePanelService } from '@fe-treasury/shared/side-panel/side-panel.service';
import { SafeHtml } from '@angular/platform-browser';
import { FaqInvestmentsComponent } from '../faq-investments/faq-investments.component';
@Component({
  selector: 'app-know-more-investments',
  templateUrl: './know-more-investments.component.html',
  styleUrl: './know-more-investments.component.scss',
})
export class KnowMoreInvestmentsComponent {
  svg: SafeHtml | null = null;

  constructor(
    private svgLibrary: SvgLibraryService,
    private sidePanelService: SidePanelService
  ) {}
  ngOnInit(): void {
    this.svgLibrary.getSvg('investment').subscribe((svgContent) => {
      this.svg = svgContent; // SafeHtml type to display SVG dynamically
      //console.log('Dynamically loaded SVG with store color:', svgContent);
    });
  }

  openFAQPanel() {
    this.sidePanelService.open(
      FaqInvestmentsComponent,
      'Datos de la cuenta',
      {},
      false
    );
  }
}
