import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentLinkService, PaymentLink } from '../payment-link.service';
import { MatMenuModule } from '@angular/material/menu';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SidePanelService } from '@fe-treasury/shared/side-panel/side-panel.service';
import { EditPaymentLinkComponent } from '../edit-link/edit-payment-link.component';

@Component({
  selector: 'app-payment-links-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './payment-link-list.component.html',
  styleUrls: ['./payment-link-list.component.scss']
})
export class PaymentLinksListComponent implements OnInit {
  links: PaymentLink[] = [];
  filteredLinks: PaymentLink[] = [];
  searchQuery: string = '';
  isFocused: boolean = false;
  searching: boolean = false;
  isLoading: boolean = false;
  error: string | null = null;
  copiedLinkId: string | null = null;
  currentPage = 1;
  pageSize = 10;
  totalLinks = 0;

  private paymentLinkService = inject(PaymentLinkService);
  private sidePanelService = inject(SidePanelService);

  ngOnInit(): void {
    this.loadPaymentLinks();
  }

  loadPaymentLinks(): void {
    this.isLoading = true;
    this.paymentLinkService.getAllPaymentLinks(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        console.log('response: ', response)
        this.links = response.links;
        this.totalLinks = response.total;
        this.filteredLinks = response.links;
        this.isLoading = false;
        console.log("links: ", this.links)
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  
  formatAmount(amount: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2
    }).format(amount / 100); // Convertir de centavos a unidades
  }


  getStartIndex(): number {
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  getEndIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalLinks);
  }


  get totalPages(): number {
    return Math.ceil(this.totalLinks / this.pageSize);
  }

  nextPage(): void {
    if (this.currentPage * this.pageSize < this.totalLinks) {
      this.currentPage++;
      this.loadPaymentLinks();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadPaymentLinks();
    }
  }


  filterPaymentLink(): void {
    this.searching = true;
    setTimeout(() => {
      this.filteredLinks = this.links.filter(link =>
        link.description?.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
      this.searching = false;
    }, 300);
  }

  copyLink(url: string | undefined, linkId: string | undefined): void {
    if (url && linkId) {
      navigator.clipboard.writeText(url).then(() => {
        this.copiedLinkId = linkId;
        setTimeout(() => {
          this.copiedLinkId = null;
        }, 2000);
      });
    } else {
      console.error('URL is missing for the link');
    }
  }

  deleteLink(paymentLink: PaymentLink): void {
    const updatedData: PaymentLink = {
      id: paymentLink.id,
      amount: paymentLink.amount,
      currency: paymentLink.currency,
      description: paymentLink.description,
      expirationDate: paymentLink.expirationDate,
      status: "DELETED",
    };

  this.paymentLinkService.updatePaymentLink(updatedData).subscribe({
    next: (updatedLink: any) => {
      console.log('✅ Payment Link Status Updated:', updatedLink);
      this.isLoading = false;
      this.loadPaymentLinks(); // Refresh after edit
    },
    error: (error: any) => {
      console.error('❌ Error updating payment link status:', error);
      this.isLoading = false;
    },
  });
  }

  openEditPaymentLinkModal(paymentLink: PaymentLink): void {
  const editPanelRef = this.sidePanelService.open(EditPaymentLinkComponent, 'Editar Enlace de Pago');

  // Ensure component instance is available before setting @Input() property
  setTimeout(() => {
    if (editPanelRef?.instance) {
      editPanelRef.instance.paymentLinkData = paymentLink; // ✅ Assign after initialization
      console.log('✅ Passing Payment Link Data:', paymentLink);

      editPanelRef.instance.saveChanges.subscribe((updatedData: PaymentLink) => {
        if (updatedData) {
          console.log('✅ Updated Payment Link:', updatedData);
          this.loadPaymentLinks(); // Refresh after edit
        }
      });
    } else {
      console.error('❌ EditPaymentLinkComponent instance is undefined');
    }
  });
}
}
