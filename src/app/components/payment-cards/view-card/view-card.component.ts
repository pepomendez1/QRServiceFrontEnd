import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { PaymentCardsService } from '../payment-cards.service';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { SidePanelService } from '@fe-treasury/shared/side-panel/side-panel.service';
import { SecondsToTimeStringPipe } from 'src/app/pipes/seconds-to-time-string.pipe';
import { SidePanelHeaderComponent } from '@fe-treasury/shared/side-panel/side-panel-header/side-panel-header.component';
import { OtpInputModule } from '@fe-treasury/shared/otp-input/otp-input.module';
import { OTPService } from 'src/app/services/otp.service';
import { MessagesModule } from '@fe-treasury/shared/messages/messages.module';
import { MessageService } from '@fe-treasury/shared/messages/messages.service';
import { AuthService } from 'src/app/services/auth.service';
import { Clipboard } from '@angular/cdk/clipboard';
import { OtpInputComponent } from '@fe-treasury/shared/otp-input/otp-input.component';
import { SnackbarService } from '@fe-treasury/shared/snack-bar/snackbar.service';
import { SidePanelFooterComponent } from '@fe-treasury/shared/side-panel/side-panel-footer/side-panel-footer.component';
@Component({
  selector: 'app-view-card',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinner,
    MatIcon,
    SecondsToTimeStringPipe,
    MessagesModule,
    SidePanelHeaderComponent,
    SidePanelFooterComponent,
    OtpInputModule,
  ],
  templateUrl: './view-card.component.html',
  styleUrl: './view-card.component.scss',
})
export class ViewCardComponent implements OnInit {
  @ViewChild(OtpInputComponent) otpInputComponent!: OtpInputComponent;
  @Input() data: any;

  public iframeUrl: SafeResourceUrl = '';
  public loading = true;
  public steps = ['otp', 'viewCard'];
  public currentStep = 0;
  public errors: string[] = [];
  public timeLeft = 0;
  // opt data
  public email: any = '';
  public session: string | null = '';
  public challengeName: string | null = '';
  buttonText: string = 'Continuar'; // Default button text
  buttonEnabled: boolean = false; // Default button state

  isProcessing: boolean = false;
  debugMode: boolean = false;
  bypassOTP: boolean = false;

  isIframeReady: boolean = false;

  public incorrectOTP: boolean = false;
  private showCardTimerInterval: any;
  constructor(
    private clipboard: Clipboard,
    private cardService: PaymentCardsService,
    private authService: AuthService,
    private sanitizer: DomSanitizer,
    private messageService: MessageService,
    private snackBarService: SnackbarService,
    private sidePanelService: SidePanelService,
    private otpService: OTPService
  ) {}

  ngOnInit(): void {
    this.messageService.clearMessage();
    this.sidePanelService.toggleDisableClose(false);
    this.email = this.authService.getEmail();

    if (!this.bypassOTP) {
      this.otpService.sendOtp(null).subscribe({
        next: (response) => {
          console.log('sendOtp:', response);
          this.session = response.Session;
          this.challengeName = response.ChallengeName;
          this.loading = false;
        },
        error: (error: any) => {
          console.error('Error sending OTP:', error);
          this.loading = false;
          this.snackBarService.openError('Error en el envío de OTP', true);
        },
      });
    } else {
      this.viewCard();
    }

    // this.getCardIframeUrl(this.data.id);
  }

  handleButtonText(text: string): void {
    this.buttonText = text;
  }
  handleButtonEnabled(isEnabled: boolean): void {
    this.buttonEnabled = isEnabled;
  }

  otpValidatedOK() {
    this.isProcessing = false;
    this.viewCard();
  }

  submitOtp(): void {
    if (this.buttonEnabled) {
      this.otpInputComponent.submitOtp();
    }
  }

  viewCard() {
    this.loading = true;
    this.currentStep = 1;
    this.sidePanelService.toggleDisableClose(true);
    this.getCardIframeUrl(this.data.provider_id);
  }

  getCardIframeUrl(cardId: string): void {
    // start 5min timer
    this.timeLeft = this.bypassOTP ? 30000 : 300;
    this.showCardTimerInterval = setInterval(() => {
      this.timeLeft -= 1;
      if (this.timeLeft === 0) {
        this.snackBarService.openError(
          'El tiempo para ver datos de la tarjeta finalizó',
          true
        );
        this.sidePanelService.close('timeout'); // Close with timeout origin
      }
    }, 1000);

    this.cardService.getCardIframeUrl(cardId).subscribe({
      next: (url: string) => {
        this.iframeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        this.loading = false;
      },
      error: (error: any) => {
        this.loading = false;
        console.log(error);
        this.handleError(error);
        this.errors.push(error.message);
      },
    });
  }
  ngOnDestroy(): void {
    this.clearTimer();
    // this.iframeUrl = ''; // Limpia la URL del iframe
  }

  private clearTimer(): void {
    if (this.showCardTimerInterval) {
      clearInterval(this.showCardTimerInterval);
      this.showCardTimerInterval = null;
      //this.iframeUrl = ''; // Elimina la URL del iframe
    }
  }
  private handleError(error: any) {
    this.snackBarService.openError(error.message, true);
  }
  handleArrowBack() {
    this.sidePanelService.close();
  }
  close(): void {
    console.log('Clearing clipboard...');
    this.clearClipboard();

    // Delay closing the side panel slightly to ensure focus remains
    setTimeout(() => {
      this.sidePanelService.toggleDisableClose(false);
      this.sidePanelService.close();
      console.log('Side panel closed.');
    }, 100); // Delay of 100ms
    this.clearTimer();
  }

  onIframeLoad(): void {
    console.log('Iframe loaded. Waiting for styles...');

    setTimeout(() => {
      // console.log('Assuming styles are applied. Stopping loader.');

      this.isIframeReady = true;
    }, 2000); // Adjust delay based on observed loading time
  }

  private clearClipboard(): void {
    if (document.hasFocus()) {
      const placeholder = ' ';
      this.clipboard.copy(placeholder);
      navigator.clipboard
        .writeText(placeholder)
        .then(() => {
          console.log('Clipboard successfully cleared.');
        })
        .catch((err) => {
          console.error('Error clearing clipboard:', err);
        });
    } else {
      console.warn('Cannot clear clipboard: Document is not focused.');
    }
  }
}
