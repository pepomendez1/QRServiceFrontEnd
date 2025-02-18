import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentCardsComponent } from './payment-cards.component';
import { MyCardsComponent } from './my-cards/my-cards.component';
import { CardsActivityComponent } from './cards-activity/cards-activity.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    PaymentCardsComponent,
    MyCardsComponent,
    CardsActivityComponent,
  ],
  exports: [PaymentCardsComponent],
})
export class PaymentCardsModule {}
