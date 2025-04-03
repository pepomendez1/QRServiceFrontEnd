import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { OtpFormComponent } from '@fe-treasury/shared/otp-input/otp-form/otp-form.component';
import { OTPService } from 'src/app/services/otp.service';
import { MessageService } from '@fe-treasury/shared/messages/messages.service';

@Component({
  selector: 'app-insert-otp-screen',
  templateUrl: './insert-otp-screen.component.html',
  styleUrl: './insert-otp-screen.component.scss',
})
export class InsertOtpScreenComponent {
  @Input() notificationTitle: string | undefined;
  @Input() notificationText: string | undefined;
  @Input() notificationType: string | undefined;
  @Input() isMobile: boolean = false;
  @Input() debugMode: boolean = false;
  @Output() checkMail = new EventEmitter<void>();
  @Output() otpValid = new EventEmitter<void>();

  @ViewChild(OtpFormComponent) otpFormComponent!: OtpFormComponent;
  otp: string = ''; // OTP input by the user
  email: string | null = ''; // Email retrieved from localStorage
  session: string | null = ''; // Session retrieved from localStorage
  userSub: string | null = ''; // Cognito sub value if the user is signed in
  challengeName: string | null = ''; // Challenge name used in OTP verification
  errorMessage: string | null = null;
  successMessage: string | null = null;
  warningMessage: string | null = null;
  timeLeft: number = 10;
  timeOut: boolean = false;
  isProcessing = false;
  isSubmitButtonEnabled = false;
  resetTimer: boolean = false; // Reset timer signal

  constructor(
    private router: Router,
    private otpService: OTPService,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.messageService.clearMessage();
    this.restartValues();
    // Retrieve email and session from localStorage
  }
  restartValues(): void {
    this.email = localStorage.getItem('otpEmail');
    this.session = localStorage.getItem('otpSession');
    this.challengeName = localStorage.getItem('challengeName');

    if (!this.email || !this.session) {
      console.error('Missing email or session in localStorage');
      this.messageService.showMessage('Código incorrecto', 'error');
      // Optionally, redirect the user back to the request OTP screen or show an error message
    }
  }
  returnToEmailForm() {
    this.checkMail.emit(); // Call stepCompleted method
  }

  submitOtpForm(): void {
    this.otpFormComponent.triggerFormSubmission();
  }
  handleButtonState(isEnabled: boolean): void {
    this.isSubmitButtonEnabled = isEnabled;
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
    this.otpService.sendOtp(this.email).subscribe({
      next: (response) => {
        console.log('OTP Sent:', response);
        localStorage.setItem('otpEmail', this.email || '');
        localStorage.setItem('otpSession', response.Session);
        localStorage.setItem('challengeName', response.ChallengeName);
        this.timeOut = false;

        // Reset timer and force change detection
        this.resetTimer = true;
        setTimeout(() => (this.resetTimer = false), 0);
        this.messageService.showMessage('Código enviado!', 'success');
        setTimeout(() => {
          this.messageService.clearMessage();
        }, 5000);
        //this.cdr.detectChanges(); // Force change detection to update the child component
        this.restartValues();
      },
      error: (error: any) => {
        console.error('Error sending OTP:', error);
        this.messageService.showMessage('Error en el envío de mail!', 'error');
      },
    });
  }
  handleOtp(otp: string): void {
    console.log('submitted: ', otp);
    this.isProcessing = true;
    this.errorMessage = '';
    if (this.debugMode) this.otpValid.emit(); // Call stepCompleted method
    else {
      this.otpService
        .verifyOtp(
          this.email || '',
          otp,
          this.session || '',
          this.challengeName || ''
        )
        .subscribe({
          next: (response) => {
            console.log('OTP Verified:', response);
            // Handle success, maybe redirect the user or proceed with onboarding, etc.
            localStorage.removeItem('otpEmail');
            localStorage.removeItem('otpSession');
            localStorage.removeItem('challengeName');
            this.successMessage = 'Código Correcto!';
            this.errorMessage = null;
            this.otpValid.emit(); // Call stepCompleted method
          },
          error: (error: any) => {
            console.error('Error verifying OTP:', error);
            this.errorMessage = 'Código incorrecto';
            this.successMessage = null;
            // Handle error, show message to the user
          },
        });
    }
    this.isProcessing = false;
  }
}
