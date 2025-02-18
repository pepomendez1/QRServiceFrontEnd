import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardsActivityComponent } from './cards-activity/cards-activity.component';
import { MyCardsComponent } from './my-cards/my-cards.component';
import { SafeHtml } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { CardShippingBannerComponent } from './card-shipping-banner/card-shipping-banner.component';
import { GeneralFailureComponent } from '@fe-treasury/shared/general-failure/general-failure.component';
import { SvgLibraryService } from 'src/app/services/svg-library.service';
@Component({
  selector: 'app-payment-cards',
  standalone: true,
  imports: [
    CommonModule,
    CardsActivityComponent,
    MyCardsComponent,
    CardShippingBannerComponent,
    GeneralFailureComponent,
  ],
  templateUrl: './payment-cards.component.html',
  styleUrl: './payment-cards.component.scss',
})
export class PaymentCardsComponent {
  cardsFailure: boolean = false;
  problemImg: SafeHtml | null = null;
  oderedPhysicalCard: boolean = false;
  cardData: any = '';
  constructor(private svgLibrary: SvgLibraryService, private router: Router) {}

  ngOnInit(): void {
    this.svgLibrary.getSvg('problem').subscribe((svgContent) => {
      this.problemImg = svgContent; // SafeHtml type to display SVG dynamically
    });
  }

  getFailureStatus(status: boolean): void {
    console.log('Failure status: ', status);
    this.cardsFailure = status;
  }
  getShippingCard(card: boolean): void {
    this.oderedPhysicalCard = card;
  }
  getShippingData(shipping: any): void {
    this.cardData = shipping;
  }
}
