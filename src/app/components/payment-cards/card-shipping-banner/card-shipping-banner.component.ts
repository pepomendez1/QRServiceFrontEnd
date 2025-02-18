import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidePanelService } from '@fe-treasury/shared/side-panel/side-panel.service';
import { SvgLibraryService } from 'src/app/services/svg-library.service';
import { CardShippingStatusComponent } from '../card-shipping-status/card-shipping-status.component';
import { CardActivationComponent } from '../card-activation/card-activation.component';
import { SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-card-shipping-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card-shipping-banner.component.html',
  styleUrl: './card-shipping-banner.component.scss',
})
export class CardShippingBannerComponent {
  public loading = true;
  @Input() shippingCardData: any;
  // max cards
  cardOrder: SafeHtml | null = null;

  constructor(
    private svgLibrary: SvgLibraryService,
    private sidePanelService: SidePanelService
  ) {}

  ngOnInit(): void {
    this.svgLibrary.getSvg('card-order').subscribe((svgContent) => {
      this.cardOrder = svgContent; // SafeHtml type to display SVG dynamically
      //console.log('Dynamically loaded SVG with store color:', svgContent);
    });
  }

  shippingStatus() {
    this.sidePanelService.open(
      CardShippingStatusComponent,
      'Seguimiento tarjeta',
      this.shippingCardData
    );
  }

  activateCard() {
    this.sidePanelService.open(CardActivationComponent, 'Activar tarjeta');
  }
}
