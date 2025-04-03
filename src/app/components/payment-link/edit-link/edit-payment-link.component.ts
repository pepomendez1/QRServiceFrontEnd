import { Component, Input, Output, EventEmitter, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PaymentLink, PaymentLinkService } from '../payment-link.service';
import { SidePanelHeaderComponent } from '@fe-treasury/shared/side-panel/side-panel-header/side-panel-header.component';
import { SidePanelFooterComponent } from '@fe-treasury/shared/side-panel/side-panel-footer/side-panel-footer.component';
import { SidePanelService } from '@fe-treasury/shared/side-panel/side-panel.service';
import { AmountInputComponent } from '@fe-treasury/shared/amount-input/amount-input.component';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-edit-payment-link',
  standalone: true,
  templateUrl: './edit-payment-link.component.html',
  styleUrls: ['./edit-payment-link.component.scss'],
  imports: [
    CommonModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    SidePanelHeaderComponent,
    SidePanelFooterComponent,
    AmountInputComponent,
    FormsModule,
  ]
})
export class EditPaymentLinkComponent {
  @Output() saveChanges = new EventEmitter<PaymentLink>(); // ✅ Emit updates
  @ViewChild(AmountInputComponent) amountInput!: AmountInputComponent;

  isLoading = signal(false);
  errorMessage = signal('');

  amount: number = 0;
  isAmountUndefined: boolean = false;
  productName: string = '';
  productLink: string = '';

  // ✅ Use a setter for @Input()
  private _paymentLinkData!: PaymentLink;
  @Input()
  set paymentLinkData(value: PaymentLink) {
    if (value) {
      this._paymentLinkData = value;
      this.initializeForm();
    }
  }
  get paymentLinkData(): PaymentLink {
    return this._paymentLinkData;
  }

  constructor(private sidePanelService: SidePanelService, private paymentLinkService: PaymentLinkService, private cdr: ChangeDetectorRef) {}

  initializeForm(): void {
  if (this.paymentLinkData) {
      this.setAmount(this.paymentLinkData.amount.toString())
      this.productName = this.paymentLinkData.description || '';
      this.productLink = this.paymentLinkData.url || '';
      this.cdr.detectChanges();
      console.log('🔹 Amount after timeout:', this.amount);
  }
}


  setAmount(value: string) {
    console.log('🔹 Raw Input Value:', value);
    const sanitizedValue = value.replace(/\D/g, ""); // Remove non-numeric characters
    const parsedValue = Number(sanitizedValue);
    this.amount = isNaN(parsedValue) ? 0 : parsedValue;
    console.log('🔹 Parsed Amount:', this.amount);
  }

  toggleAmountUndefined(): void {
    this.isAmountUndefined = !this.isAmountUndefined;
    if (this.isAmountUndefined) {
      this.amount = 0;
    }
  }

  save(): void {
    if (!this.paymentLinkData?.id) {
      this.errorMessage.set('Error: No se puede actualizar el enlace de pago.');
      return;
    }

    this.isLoading.set(true);

    const updatedData: PaymentLink = {
      id: this.paymentLinkData.id,
      amount: this.isAmountUndefined ? 0 : this.amount,
      currency: this.paymentLinkData.currency,
      description: this.productName || this.paymentLinkData.description || undefined,
      status: this.paymentLinkData.status,
      expirationDate: '',
    };

    this.paymentLinkService.updatePaymentLink(updatedData).subscribe({
      next: (updatedLink: any) => {
        console.log('✅ Updated Payment Link:', updatedLink);
        this.isLoading.set(false);
        this.saveChanges.emit(updatedLink); // ✅ Emit changes
        //this.sidePanelService.close();
      },
      error: (error: any) => {
        console.error('❌ Error updating payment link:', error);
        this.errorMessage.set('Error actualizando el enlace de pago. Inténtelo de nuevo.');
        this.isLoading.set(false);
      },
    });
  }


  togglePaymentStatus(): void {
  if (!this.paymentLinkData?.id) {
    this.errorMessage.set('Error: No se puede actualizar el estado del enlace de pago.');
    return;
  }

  this.isLoading.set(true);

  // Toggle the current status
  const newStatus = this.paymentLinkData.status === "ACTIVE" ? "PAUSED" : "ACTIVE";

  // ✅ Exclude `link_url` from the update request
  const updatedData: PaymentLink = {
      id: this.paymentLinkData.id,
      amount: this.isAmountUndefined ? 0 : this.amount,
      currency: this.paymentLinkData.currency,
      description: this.paymentLinkData.description || undefined,
      expirationDate: '',
      status: newStatus,
    };

  this.paymentLinkService.updatePaymentLink(updatedData).subscribe({
    next: (updatedLink: any) => {
      console.log('✅ Payment Link Status Updated:', updatedLink);
      this.isLoading.set(false);
      this.paymentLinkData.status = newStatus; // Update local state
      this.saveChanges.emit(updatedLink);
    },
    error: (error: any) => {
      console.error('❌ Error updating payment link status:', error);
      this.errorMessage.set('Error actualizando el estado del enlace de pago. Inténtelo de nuevo.');
      this.isLoading.set(false);
    },
  });
}



  close(): void {
    this.sidePanelService.close();
  }
}
