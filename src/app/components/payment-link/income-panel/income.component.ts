import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentLinkService } from '../payment-link.service';
import { FormsModule } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-payment-link-income',
  standalone: true,
  imports: [CommonModule, MatMenuModule, MatIconModule, FormsModule],
  templateUrl: './income.component.html',
  styleUrl: './income.component.scss'
})
export class PaymentLinkIncomeComponent implements OnInit {
  private paymentLinkService = inject(PaymentLinkService);

  transactions: any[] = [];
  filteredTransactions: any[] = [];
  totalRecords: number = 0;
  pageSize: number = 10;
  currentPage: number = 1;
  loading: boolean = false;

  selectedFilters = { link: '', period: '', status: '' };

  linkOptions: string[] = ["Todos"];
  periodOptions = ['Hoy', 'Ayer', 'Última semana', 'Últimos 15 días', 'Último mes', 'Último año'];
  statusOptions = ['Todos', 'Liquidado', 'Por liquidar'];

  ngOnInit() {
    this.fetchTransactions();
  }

  fetchTransactions() {
    this.loading = true;
    this.paymentLinkService.getTransactions(this.currentPage, this.pageSize)
      .subscribe({
        next: (response) => {
          const uniqueLinks = new Set<string>();

          this.transactions = response.transactions.map(trx => {
            if (trx.payment_link_description) {
              uniqueLinks.add(trx.payment_link_description);
            }

            return {
              ...trx,
              formattedTotalAmount: this.formatCurrency(trx.total_amount),
              formattedMerchantAmount: this.formatMechantCurrency(trx.merchant_amount),
              formattedMerchantAmountMobile: this.formatMobileCurrency(trx.merchant_amount),
              status: this.getTransactionStatus(trx.settlement_date)
            };
          });

          this.linkOptions = ["Todos", ...Array.from(uniqueLinks)];
          this.totalRecords = response.total;
          this.applyFilters();
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
  }

  formatMobileCurrency(amount: number): string {
    const cleanAmount = Math.floor(amount); // Remove last two digits (centavos)
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(cleanAmount);
  }

  formatCurrency(amount: number): string {
      return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 2
      }).format(amount / 100); // Convertir de centavos a unidades
    }

    formatMechantCurrency(amount: number): string {
      return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 2
      }).format(amount); // Convertir de centavos a unidades
    }

  getTransactionStatus(settlementDate: string | null): string {
    if (!settlementDate) return 'Pendiente';
    const settlement = new Date(settlementDate);
    return settlement <= new Date() ? 'Acreditado' : 'Pendiente';
  }

  applyFilters() {
    let filtered = [...this.transactions];

    const now = new Date();

    if (this.selectedFilters.period) {
      filtered = filtered.filter(trx => {
        const trxDate = new Date(trx.created_at);
        switch (this.selectedFilters.period) {
          case 'Hoy':
            return trxDate.toDateString() === now.toDateString();
          case 'Ayer':
            const yesterday = new Date(now);
            yesterday.setDate(now.getDate() - 1);
            return trxDate.toDateString() === yesterday.toDateString();
          case 'Última semana':
            return trxDate >= new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
          case 'Últimos 15 días':
            return trxDate >= new Date(now.getFullYear(), now.getMonth(), now.getDate() - 15);
          case 'Último mes':
            return trxDate.getMonth() === now.getMonth() && trxDate.getFullYear() === now.getFullYear();
          case 'Último año':
            return trxDate.getFullYear() === now.getFullYear();
          default:
            return true;
        }
      });
    }

    if (this.selectedFilters.link && this.selectedFilters.link !== 'Todos') {
      filtered = filtered.filter(trx => trx.payment_link_description === this.selectedFilters.link);
    }

    if (this.selectedFilters.status && this.selectedFilters.status !== 'Todos') {
      filtered = filtered.filter(trx => trx.status === this.selectedFilters.status);
    }

    this.filteredTransactions = filtered;
  }

  setFilter(filterType: 'link' | 'period' | 'status', value: string) {
    this.selectedFilters[filterType] = value;
    this.applyFilters();
  }

  clearFilters() {
    this.selectedFilters = { link: '', period: '', status: '' };
    this.applyFilters();
  }

  getStartIndex(): number {
      return (this.currentPage - 1) * this.pageSize + 1;
    }

  getEndIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalRecords);
  }


  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.fetchTransactions();
    }
  }

  nextPage() {
    if (this.currentPage * this.pageSize < this.totalRecords) {
      this.currentPage++;
      this.fetchTransactions();
    }
  }
}
