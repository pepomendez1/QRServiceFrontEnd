import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServicesPaymentComponent } from './services-payment.component';
import { MyCardsComponent } from './my-services-and-taxes/my-services-and-taxes.component';
import { CardsActivityComponent } from './expirations/expirations.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ServicesPaymentComponent,
    MyCardsComponent,
    CardsActivityComponent,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatFormFieldModule,
    MatInputModule
  ],
  exports : [
    ServicesPaymentComponent
  ]
})
export class PaymentCardsModule { }
