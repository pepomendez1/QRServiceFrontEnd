import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { PaymentLinkService } from '../payment-link.service';
import { AmountInputComponent } from '@fe-treasury/shared/amount-input/amount-input.component';

@Component({
  selector: 'app-payment-link-card',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatSlideToggleModule,
    MatButtonModule,
    AmountInputComponent
  ],
  templateUrl: './payment-link-card.component.html',
  styleUrls: ['./payment-link-card.component.scss']
})
export class PaymentLinkCardComponent {
  @ViewChild(AmountInputComponent) amountInput!: AmountInputComponent; // Reference AmountInputComponent
  amount: number = 0; // ✅ Default amount
  isAmountUndefined: boolean = false;
  productName: string = '';
  isLoading: boolean = false;

  @Output() linkCreated = new EventEmitter<void>();

  constructor(private paymentLinkService: PaymentLinkService) {}

  /**
   * Toggles whether the amount is undefined.
   * If toggled ON, disables amount input.
   */
  toggleAmountUndefined(): void {
    this.isAmountUndefined = !this.isAmountUndefined;
    if (this.isAmountUndefined) {
      this.amount = 0; // ✅ Ensure amount is always a number
    }
  }

  /**
   * Sets the amount, ensuring a valid number.
   * @param value - The input value from the amount input field.
   */
  setAmount(value: string): void {
    console.log('🔹 Raw Input Value:', value); // Debugging log

    // 🔹 Remove all non-numeric characters
    let sanitizedValue = value.replace(/\D/g, "");

    // 🔹 Convert to number
    const parsedValue = Number(sanitizedValue);

    // 🔹 Prevent invalid parsing (e.g., NaN)
    this.amount = isNaN(parsedValue) ? 0 : parsedValue;

    console.log('🔹 Parsed Amount:', this.amount); // Debugging log
}



  /**
   * Validates input and creates a payment link.
   */
  createLink(): void {
    if (!this.isAmountUndefined && this.amount <= 0) {
      alert('El monto debe ser mayor a 0.');
      return;
    }

    this.isLoading = true;

    // ✅ Ensuring amount is never null
    const requestBody = {
      amount: this.isAmountUndefined ? 0 : this.amount, // ✅ Always a number
      currency: 'ARS',
      description: this.productName || "",
      expirationDate: '',
      status: "ACTIVE"
    };

    console.log('🔹 Sending Payment Link Request:', requestBody); // Debugging log

    this.paymentLinkService.createPaymentLink(requestBody).subscribe({
      next: () => {
        this.isLoading = false;
        this.linkCreated.emit(); // Notify parent component

        // Reset input fields
        this.amount = 0;
        this.productName = '';

        // Reset AmountInputComponent if available
        if (this.amountInput && this.amountInput.reset) {
          this.amountInput.reset();
        }

        console.log('✅ Payment link created successfully');
      },
      error: (err) => {
        console.error('❌ Error creating payment link:', err);
        this.isLoading = false;
      }
    });
  }
}
