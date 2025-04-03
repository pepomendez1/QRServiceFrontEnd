import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { PaymentLinkService } from './payment-link.service';
import { PaymentLinkCardComponent } from './create-link-card/payment-link-card.component';
import { PaymentLinksListComponent } from './list-link-card/payment-link-list.component';
import { PaymentLinkIncomeComponent } from './income-panel/income.component';

@Component({
  selector: 'app-payment-link',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTabsModule,
    PaymentLinkCardComponent,
    PaymentLinksListComponent,
    PaymentLinkIncomeComponent
  ],
  templateUrl: './payment-link.component.html',
  styleUrl: './payment-link.component.scss',
})
export class PaymentLinkComponent {
  @ViewChild(PaymentLinksListComponent) paymentLinksList!: PaymentLinksListComponent;


  onLinkCreated(): void {
    this.paymentLinksList.loadPaymentLinks(); // ✅ Refresh the list when a new link is created
  }

}
