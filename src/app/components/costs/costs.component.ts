import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CostsService } from './costs.service';
import { CostsPaymentLinkComponent } from './payment-link/costs-payment-link';

@Component({
  selector: 'app-costs',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    CostsPaymentLinkComponent
  ],
  templateUrl: './costs.component.html',
  styleUrls: ['./costs.component.scss']
})
export class CostsComponent implements OnInit {
  config: any;
  loading = true;

  constructor(private costsService: CostsService) {}

  ngOnInit(): void {
    this.fetchCosts();
  }

  fetchCosts(): void {
    this.costsService.getCostConfig().subscribe({
      next: (response) => {
        console.log('config response: ', response)
        this.config = response;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching costs config:', error);
        this.loading = false;
      }
    });
  }
}
