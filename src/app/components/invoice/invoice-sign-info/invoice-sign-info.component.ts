import { Component, Input } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { SnackbarService } from '@fe-treasury/shared/snack-bar/snackbar.service';
import { InvoiceService } from 'src/app/services/invoice.service';
import { SvgLibraryService } from 'src/app/services/svg-library.service';

@Component({
  selector: 'app-invoice-sign-info',
  templateUrl: './invoice-sign-info.component.html',
  styleUrl: './invoice-sign-info.component.scss',
})
export class InvoiceSignInfoComponent {
  @Input() hasPendingInvoices = true;
  public loading = true;
  invoiceSign: SafeHtml | null = null;

  constructor(private svgLibrary: SvgLibraryService, private router: Router) {}

  ngOnInit(): void {
    this.svgLibrary.getSvg('invoice-sign').subscribe((svgContent) => {
      this.invoiceSign = svgContent;
    });
  }

  goToInvoice() {
    this.router.navigate(['/app/invoice']);
  }
}
