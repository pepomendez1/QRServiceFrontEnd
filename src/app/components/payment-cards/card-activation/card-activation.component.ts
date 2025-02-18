import { Component, Input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SidePanelHeaderComponent } from '../../../../../@fe-treasury/shared/side-panel/side-panel-header/side-panel-header.component';
import { MatIconModule } from '@angular/material/icon';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PaymentCardsService } from '../../payment-cards/payment-cards.service';
import { SidePanelFooterComponent } from '@fe-treasury/shared/side-panel/side-panel-footer/side-panel-footer.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import {
  DomSanitizer,
  SafeHtml,
  SafeResourceUrl,
} from '@angular/platform-browser';
@Component({
  selector: 'app-card-activation',
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
  templateUrl: './card-activation.component.html',
  styleUrl: './card-activation.component.scss',
})
export class CardActivationComponent {
  public iframeUrl: SafeResourceUrl = '';
  isLoading: boolean = true;
  isIframeReady: boolean = false;
  constructor(
    private cardService: PaymentCardsService,
    private sanitizer: DomSanitizer
  ) {}
  ngOnInit(): void {
    this.getActivationForm();
  }
  getActivationForm(): void {
    this.cardService.getActivationFormIframe().subscribe({
      next: (url: string) => {
        this.iframeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        this.isLoading = false;
      },
      error: (error: any) => {
        this.isLoading = false;
        console.log(error);
      },
    });
  }

  onIframeLoad(): void {
    console.log('Iframe loaded. Waiting for styles...');

    setTimeout(() => {
      // console.log('Assuming styles are applied. Stopping loader.');

      this.isIframeReady = true;
    }, 1000); // Adjust delay based on observed loading time
  }
  activateCard() {}
}
