import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
@Component({
  selector: 'app-voucher-preview-modal',
  templateUrl: './voucher-modal.component.html',
  styleUrls: ['./voucher-modal.component.scss'],
  standalone: true,
  imports: [MatIconModule],
})
export class VoucherPreviewModalComponent {
  safePdfUrl: SafeResourceUrl;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { pdfUrl: string },
    private dialogRef: MatDialogRef<VoucherPreviewModalComponent>,
    private sanitizer: DomSanitizer
  ) {
    // Sanitize the PDF URL
    console.log('PDF URL:', data.pdfUrl); // Log the URL
    this.safePdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      data.pdfUrl
    );
    console.log('Sanitized PDF URL:', this.safePdfUrl); // Log the sanitized URL
  }

  downloadVoucher(): void {
    const link = document.createElement('a');
    link.href = this.data.pdfUrl; // Use the original URL for download
    link.download = 'comprobante_transaccion.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  shareVoucher(): void {
    if (navigator.share) {
      fetch(this.data.pdfUrl) // Use the original URL for sharing
        .then((response) => response.blob())
        .then((blob) => {
          const file = new File([blob], 'comprobante_transaccion.pdf', {
            type: 'application/pdf',
          });
          navigator.share({
            title: 'Comprobante de Transacción',
            files: [file],
          });
        })
        .catch((error) => {
          console.error('Error sharing voucher:', error);
        });
    } else {
      console.warn('Web Share API not supported');
    }
  }

  closeModal(): void {
    this.dialogRef.close();
  }
}
