import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
//import { PaymentCardsService } from '../payment-cards.service';
import {  ServicesPaymentService } from '../services-payment.service';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { SidePanelService } from '@fe-treasury/shared/side-panel/side-panel.service';
import { SecondsToTimeStringPipe } from 'src/app/pipes/seconds-to-time-string.pipe';
import { SidePanelHeaderComponent } from '@fe-treasury/shared/side-panel/side-panel-header/side-panel-header.component';
import { OtpFormModule } from '@fe-treasury/shared/otp-form/otp-form.module';
import { OTPService } from 'src/app/services/otp.service';
import { MessagesModule } from '@fe-treasury/shared/messages/messages.module';
import { MessageService } from '@fe-treasury/shared/messages/messages.service';
import { AuthService } from 'src/app/services/auth.service';
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
    OtpFormModule,
  ],
  templateUrl: './view-card.component.html',
  styleUrl: './view-card.component.scss',
})
export class ViewCardComponent implements OnInit {
  @Input() data: any;

  public iframeUrl: SafeResourceUrl = '';
  public loading = true;
  public steps = ['otp', 'viewCard'];
  public currentStep = 0;
  public errors: string[] = [];
  public timeLeftOTP = 300;
  public timeLeft = 0;
  clearForm = false;
  timeOut: boolean = false;
  resetTimer: boolean = false; // Reset timer signal

  // opt data
  public email: any = '';
  public session: string | null = '';
  public challengeName: string | null = '';
  public otpObject: string = '';
  public buttonEnabled = false;
  isProcessing: boolean = false;
  debugMode: boolean = false;
  isSubmitButtonEnabled: boolean = false;
  public incorrectOTP: boolean = false;
  private showCardTimerInterval: any;
  constructor(
    private cardService: ServicesPaymentService,
    private authService: AuthService,
    private sanitizer: DomSanitizer,
    private messageService: MessageService,
    private snackBar: MatSnackBar,
    private snackBarService: SnackbarService,
    private sidePanelService: SidePanelService,
    private otpService: OTPService
  ) {}

  ngOnInit(): void {
    this.messageService.clearMessage();
    this.sidePanelService.toggleDisableClose(false);
    this.email = this.authService.getEmail();
    this.otpService.sendOtp(null).subscribe({
      next: (response) => {
        console.log('sendOtp:', response);
        this.session = response.Session;
        this.challengeName = response.ChallengeName;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error sending OTP:', error);
      },
    });

    // this.getCardIframeUrl(this.data.id);
  }

  viewCard() {
    this.loading = true;
    this.currentStep = 1;
    this.sidePanelService.toggleDisableClose(true);
    this.getCardIframeUrl(this.data.provider_id);
  }
  handleTimeOut(): void {
    console.log('Time Out');
    this.timeOut = true;
    this.messageService.showMessage(
      'El tiempo de validez del código ha caducado - ',
      'warning',
      'Reenviar código',
      () => this.resendCode()
    );
  }

  resendCode() {
    this.incorrectOTP = false;
    this.isProcessing = true;
    if (this.debugMode) {
      this.timeOut = false;
      this.resetTimer = true;
      setTimeout(() => (this.resetTimer = false), 0);
      this.messageService.showMessage('Código enviado!', 'success');
      setTimeout(() => {
        this.messageService.clearMessage();
      }, 5000);
      this.isProcessing = false;
      this.restartValues();
    } else {
      this.otpService.sendOtp(this.email).subscribe({
        next: (response) => {
          console.log('OTP Sent:', response);
          //localStorage.setItem('otpEmail', this.email || '');
          localStorage.setItem('otpSession', response.Session);
          localStorage.setItem('challengeName', response.ChallengeName);
          this.timeOut = false;

          // Reset timer and force change detection
          this.resetTimer = true;
          setTimeout(() => (this.resetTimer = false), 0);
          this.messageService.showMessage('Código enviado!', 'success');
          this.clearForm = true;
          setTimeout(() => (this.clearForm = false), 0);

          setTimeout(() => {
            this.messageService.clearMessage();
          }, 5000);
          this.isProcessing = false;
          //this.cdr.detectChanges(); // Force change detection to update the child component
          this.restartValues();
        },
        error: (error: any) => {
          console.error('Error sending OTP:', error);
          this.messageService.showMessage(
            'Error en el envío de mail!: ',
            'error'
          );
          this.isProcessing = false;
        },
      });
    }
  }
  restartValues(): void {
    //this.email = localStorage.getItem('otpEmail');
    this.session = localStorage.getItem('otpSession');
    this.challengeName = localStorage.getItem('challengeName');

    if (!this.email || !this.session) {
      console.error('Missing email or session in localStorage');
      this.messageService.showMessage('Código incorrecto', 'error');
      // Optionally, redirect the user back to the request OTP screen or show an error message
    }
  }

  getCardIframeUrl(cardId: string): void {
    // start 5min timer
    this.timeLeft = 300;
    this.showCardTimerInterval = setInterval(() => {
      this.timeLeft -= 1;
      if (this.timeLeft === 0) {
        this.snackBarService.openError(
          'El tiempo para ver datos de la tarjeta finalizó',
          true
        );
        this.close();
        this.clearTimer(); // Stop the timer
      }
    }, 1000);

    this.cardService.getCardIframeUrl(cardId).subscribe({
      next: (url: string) => {
        this.iframeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        this.loading = false;
      },
      error: (error: any) => {
        this.loading = false;
        this.handleError(error);
        this.errors.push(error.message);
      },
    });
  }
  ngOnDestroy(): void {
    this.clearTimer(); // Clear the timer when the component is destroyed
  }

  private clearTimer(): void {
    if (this.showCardTimerInterval) {
      clearInterval(this.showCardTimerInterval);
      this.showCardTimerInterval = null;
    }
  }
  private handleError(error: any) {
    this.snackBarService.openError(error.message, true);
  }
  handleArrowBack() {
    this.sidePanelService.close();
  }
  close() {
    this.sidePanelService.toggleDisableClose(false);
    this.sidePanelService.close();
    this.clearTimer();
  }

  // otp functions

  enableButton(event: boolean) {
    this.buttonEnabled = event;
    console.log('Button enabled: ', event);
  }

  handleOtpEvent(otp?: string) {
    if (otp) {
      this.otpObject = otp;
    }
    return;
  }
  handleButtonState(isEnabled: boolean): void {
    this.isSubmitButtonEnabled = isEnabled;
  }
  submitOtp() {
    this.isProcessing = true;
    console.log('Submit', this.otpObject);
    // otp is an object
    // {
    //   "digit1": "1",
    //   "digit2": "2",
    //   "digit3": "3",
    //   "digit4": "4",
    //   "digit5": "5",
    //   "digit6": "6"
    // }
    // but it has to be converted to a string
    const otpString = Object.values(this.otpObject).join('');

    this.otpService
      .verifyOtp(null, otpString, this.session || '', this.challengeName || '')
      .subscribe({
        next: (data: any) => {
          this.isProcessing = false;
          this.viewCard();
        },
        error: (error: any) => {
          console.error('Error verifying OTP:', error);
          this.incorrectOTP = true;
          this.isProcessing = false;
          // Handle error, show messag
        },
      });
  }
}
