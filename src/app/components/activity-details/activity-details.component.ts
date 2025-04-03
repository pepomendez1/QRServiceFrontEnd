import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TreasuryService } from 'src/app/services/treasury.service';
import { VoucherService } from 'src/app/services/layout/voucher.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SidePanelHeaderComponent } from '@fe-treasury/shared/side-panel/side-panel-header/side-panel-header.component';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SidePanelFooterComponent } from '@fe-treasury/shared/side-panel/side-panel-footer/side-panel-footer.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { VoucherPreviewModalComponent } from '../voucher-modal/voucher-modal.component';
@Component({
  selector: 'app-activity-details',
  templateUrl: './activity-details.component.html',
  styleUrls: ['./activity-details.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ClipboardModule,
    MatTooltipModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    SidePanelFooterComponent,
    SidePanelHeaderComponent,
    MatIconModule,
  ],
})
export class ActivityDetailsComponent {
  isGeneratingVoucher = false;
  @Input() data: any;
  type: string = 'Operación';
  status: string = 'Aprobada';
  detail: any;
  isLoading: boolean = true;
  constructor(
    private treasuryService: TreasuryService,
    private voucherService: VoucherService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // Subscribe to the voucher generation state
    this.voucherService.generatingVoucher$.subscribe((isGenerating) => {
      this.isGeneratingVoucher = isGenerating;
    });
    this.getDetailById(this.data);
  }
  getDetailById(id: string): void {
    this.treasuryService.getTransactionsDetailById(id).subscribe({
      next: (response: string) => {
        this.detail = response;
        console.log(response);
        this.isLoading = false;
        this.getType();
        this.getStatus();
      },
      error: (error: any) => {
        console.error(error);
        this.isLoading = false;
      },
    });
    // throw new Error('Method not implemented.');
  }

  getType() {
    switch (this.detail.type) {
      case 'cash_out':
        this.type = 'Transferencia de dinero';
        break;
      case 'cash_in':
        this.type = 'Ingreso de dinero';
        break;
      default:
        break;
    }
  }

  getStatus() {
    switch (this.detail.status) {
      case 'processing':
        this.status = 'EN PROCESO';
        break;
      case 'processed':
        this.status = 'APROBADA';
        break;
      case 'rejected':
        this.status = 'RECHAZADA';
        break;
      case 'cancelled':
        this.status = 'CANCELADA';
        break;
      default:
        break;
    }
  }

  downloadVoucher() {
    this.voucherService.generateVoucherById(this.data);
  }

  // CODE to try modal
  // async downloadVoucher(): Promise<void> {
  //   try {
  //     // Generate the voucher and get the PDF URL
  //     const pdfUrl = await this.voucherService.generateVoucher(this.data);

  //     // Open a modal to preview the voucher with overlay icons
  //     this.dialog.open(VoucherPreviewModalComponent, {
  //       width: '90%', // Adjust the width as needed
  //       maxWidth: '800px', // Set a maximum width
  //       height: '90%', // Adjust the height as needed
  //       data: { pdfUrl }, // Pass the PDF URL to the modal
  //     });
  //   } catch (error) {
  //     console.error('Error generating voucher:', error);
  //   }
  // }
}
