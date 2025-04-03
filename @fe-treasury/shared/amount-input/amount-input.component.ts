import { FormsModule } from '@angular/forms';
import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { calculateNewCursorPosition, setCursorPosition } from 'src/app/components/transfer/utils';

@Component({
  selector: 'app-amount-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './amount-input.component.html',
  styleUrl: './amount-input.component.scss',
})
export class AmountInputComponent {
  @Input() disabled: boolean = false;
  @Output() setAmount = new EventEmitter<string>();
  @ViewChild('amountInput', { static: false }) amountInput!: ElementRef;

  amount: string = '0,00'; // Default value

  /** 🔄 Properly resets the amount input field */
  reset() {
    this.amount = '0,00'; // Reset the internal amount
    this.setAmount.emit(this.amount); // Emit reset event
    if (this.amountInput) {
      this.amountInput.nativeElement.value = this.amount; // Reset the input field
    }
  }

  handleKeyDown(event: KeyboardEvent) {
    if (this.disabled) {
      event.preventDefault();
      return;
    }

    const inputElement = this.amountInput.nativeElement;
    const key = event.key;
    let cursorPosition = inputElement.selectionStart as number;

    // **Allow navigation keys**
    if (['ArrowLeft', 'ArrowRight', 'Tab'].includes(key)) {
      return;
    }

    // **Prevent invalid characters**
    if (!/[\d]/.test(key) && key !== 'Backspace' && key !== 'Delete') {
      event.preventDefault();
      return;
    }

    setTimeout(() => {
      let value = inputElement.value.replace(/[^0-9]/g, ''); // Remove invalid characters

      // **Allow full deletion (empty input)**
      if (value === '') {
        this.reset(); // 🔹 Reset everything if empty
        return;
      }

      // **Fix backspace before the comma issue**
      if (key === 'Backspace' && cursorPosition === value.length - 2) {
        event.preventDefault();
        return;
      }

      // **Convert input into proper number format**
      let numericValue = parseFloat(value) / 100 || 0;

      // **Format with thousand separators**
      let formattedValue = new Intl.NumberFormat('es-ES', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        useGrouping: true, // ✅ Ensures thousand separators for all numbers
      }).format(numericValue);

      // **Calculate new cursor position**
      let newCursorPosition = calculateNewCursorPosition(
        value,
        cursorPosition,
        formattedValue,
        key
      );

      // **Ensure cursor stays in the integer part unless manually moved**
      if (newCursorPosition >= formattedValue.length - 2) {
        newCursorPosition = formattedValue.length - 3;
      }

      inputElement.value = formattedValue;
      this.amount = formattedValue;
      this.setAmount.emit(this.amount);

      // **Update cursor position correctly**
      setTimeout(() => setCursorPosition(inputElement, newCursorPosition), 0);
    }, 0);
  }
}

