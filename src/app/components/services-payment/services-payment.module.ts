import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServicesPaymentComponent } from './services-payment.component';
import { MyCardsComponent } from './my-services-and-taxes/my-services-and-taxes.component';
import { CardsActivityComponent } from './expirations/expirations.component';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ServicesPaymentComponent,
    MyCardsComponent,
    CardsActivityComponent
  ],
  exports : [
    ServicesPaymentComponent
  ]
})
export class PaymentCardsModule { }
