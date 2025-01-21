import { Component, Input, OnChanges, OnInit } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-amount-display',
  templateUrl: './amount-display.component.html',
  styleUrl: './amount-display.component.scss'
})

export class AmountDisplayComponent implements OnInit, OnChanges {
  @Input() symbol: string = '$';
  @Input() amount: number = 0;

  mainAmount: string = '';
  centsAmount: string = '00';

  ngOnInit(): void {
    this.formatAmount();
  }

  ngOnChanges(): void {
    this.formatAmount();
  }

  formatAmount(): void {
    const amountParts = this.amount.toFixed(2).split('.'); // Ensure 2 decimal places
    this.mainAmount = this.formatMainAmount(amountParts[0]);
    this.centsAmount = amountParts[1] || '00'; // Default to '00' if no decimals
  }

  formatMainAmount(amountStr: string): string {
    return amountStr.replace(/\B(?=(\d{3})+(?!\d))/g, '.'); // Add dots for thousands
  }
}
