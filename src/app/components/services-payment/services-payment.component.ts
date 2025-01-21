import { Component } from '@angular/core';
import { CardsActivityComponent } from "./expirations/expirations.component";
import { MyCardsComponent,  } from "./my-services-and-taxes/my-services-and-taxes.component";

@Component({
  selector: 'app-services-payment',
  standalone: true,
  imports: [
    CardsActivityComponent,
    MyCardsComponent,
  ],
  templateUrl: './services-payment.component.html',
  styleUrl: './services-payment.component.scss'
})
export class ServicesPaymentComponent {

}
