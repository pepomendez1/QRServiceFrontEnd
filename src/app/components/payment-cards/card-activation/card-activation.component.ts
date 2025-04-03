import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SidePanelHeaderComponent } from '../../../../../@fe-treasury/shared/side-panel/side-panel-header/side-panel-header.component';
import { MatIconModule } from '@angular/material/icon';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { MatTooltipModule } from '@angular/material/tooltip';
//import { OtpFormModule } from '@fe-treasury/shared/otp-input/otp-form/otp-form.module';
import { PaymentCardsService } from '../../payment-cards/payment-cards.service';
import { SidePanelFooterComponent } from '@fe-treasury/shared/side-panel/side-panel-footer/side-panel-footer.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { OTPService } from 'src/app/services/otp.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SnackbarService } from '@fe-treasury/shared/snack-bar/snackbar.service';
import { MessageService } from '@fe-treasury/shared/messages/messages.service';

import { MessagesModule } from '@fe-treasury/shared/messages/messages.module';
import { AuthService } from 'src/app/services/auth.service';
import { OtpInputModule } from '@fe-treasury/shared/otp-input/otp-input.module';
import { OtpInputComponent } from '@fe-treasury/shared/otp-input/otp-input.component';
import { SidePanelService } from '@fe-treasury/shared/side-panel/side-panel.service';
@Component({
  selector: 'app-card-activation',
  standalone: true,
  imports: [
    CommonModule,
    ClipboardModule,
    MatTooltipModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    OtpInputModule,
    MessagesModule,
    SidePanelFooterComponent,
    SidePanelHeaderComponent,
    MatIconModule,
  ],
  templateUrl: './card-activation.component.html',
  styleUrl: './card-activation.component.scss',
})
export class CardActivationComponent {
  @ViewChild(OtpInputComponent) otpInputComponent!: OtpInputComponent;
  public iframeUrl: SafeResourceUrl = '';
  isLoading: boolean = true;
  isIframeReady: boolean = false;
  public steps = ['otp', 'activateCard'];
  public currentStep = 0;
  public isProcessing: boolean = false;
  public email: any = '';
  bypassOTP: boolean = false;
  public session: string | null = '';
  public challengeName: string | null = '';
  buttonText: string = 'Continuar'; // Default button text
  buttonEnabled: boolean = false; // Default button state
  // opt data
  constructor(
    private cardService: PaymentCardsService,
    private sanitizer: DomSanitizer,
    private otpService: OTPService,
    private messageService: MessageService,
    private sidePanelService: SidePanelService,
    private snackBarService: SnackbarService,
    private authService: AuthService
  ) {}
  ngOnInit(): void {
    //this.getActivationForm();
    this.messageService.clearMessage();
    this.email = this.authService.getEmail();

    if (!this.bypassOTP) {
      this.otpService.sendOtp(null).subscribe({
        next: (response) => {
          console.log('sendOtp:', response);
          this.session = response.Session;
          this.challengeName = response.ChallengeName;
          this.isLoading = false;
        },
        error: (error: any) => {
          console.error('Error sending OTP:', error);
          this.isLoading = false;
        },
      });
    } else {
      this.getActivationForm();
    }
  }

  // Handle button text change from OtpInputComponent
  handleButtonText(text: string): void {
    this.buttonText = text;
  }

  handleButtonEnabled(isEnabled: boolean): void {
    this.buttonEnabled = isEnabled;
  }

  handleArrowBack() {
    this.sidePanelService.close();
  }

  otpValidatedOK() {
    this.isProcessing = false;
    this.getActivationForm();
  }

  submitOtp(): void {
    if (this.buttonEnabled) {
      this.otpInputComponent.submitOtp();
    }
  }
  getActivationForm(): void {
    this.cardService.getActivationFormIframe().subscribe({
      next: (url: string) => {
        this.iframeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        this.isLoading = false;
        this.currentStep = 1;
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
