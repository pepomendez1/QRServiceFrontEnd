import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { OtpFormComponent } from '@fe-treasury/shared/otp-form/otp-form.component';
import { OTPService } from 'src/app/services/otp.service';
import { MessageService } from '@fe-treasury/shared/messages/messages.service';
import { SvgLibraryService } from 'src/app/services/svg-library.service';
import { SafeHtml } from '@angular/platform-browser';
@Component({
  selector: 'app-insert-otp-screen',
  templateUrl: './insert-otp-screen.component.html',
  styleUrl: './insert-otp-screen.component.scss',
})
export class InsertOtpScreenComponent {
  @Input() notificationTitle: string | undefined;
  @Input() notificationText: string | undefined;
  @Input() notificationType: string | undefined;
  @Input() recoveryType: string | undefined;
  @Input() emailOTP: string | null = '';
  @Input() isMobile: boolean = false;
  @Input() debugMode: boolean = false;
  @Output() checkMail = new EventEmitter<void>();
  @Output() otpValid = new EventEmitter<void>();

  @ViewChild(OtpFormComponent) otpFormComponent!: OtpFormComponent;
  otp: string = ''; // OTP input by the user
  session: string | null = ''; // Session retrieved from localStorage
  userSub: string | null = ''; // Cognito sub value if the user is signed in
  challengeName: string | null = ''; // Challenge name used in OTP verification
  errorMessage: string | null = null;
  successMessage: string | null = null;
  warningMessage: string | null = null;
  timeLeft: number = 300;
  timeOut: boolean = false;
  isProcessing = false;
  headerDescription: string = '';
  clearForm = false;
  isSubmitButtonEnabled = false;
  resetTimer: boolean = false; // Reset timer signal
  public otpObject: string = '';
  OTPinputImg: SafeHtml | null = null;
  constructor(
    private svgLibrary: SvgLibraryService,
    private router: Router,
    private otpService: OTPService,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.svgLibrary.getSvg('enter-password').subscribe((svgContent) => {
      this.OTPinputImg = svgContent; // SafeHtml type to display SVG dynamically
    });
    console.log('mobile mode in insert otp: ', this.isMobile);

    this.messageService.clearMessage();
    switch (this.recoveryType) {
      case 'password':
        this.headerDescription =
          'Ingresalo acá para generar una nueva contraseña';
        break;
      case 'pin':
        this.headerDescription = 'Ingresalo acá para generar un nuevo PIN';
        break;
      case 'password-pin':
        this.headerDescription =
          'Ingresalo acá para generar tus nuevas credenciales';
        break;
      default:
        break;
    }

    this.restartValues();
    // Retrieve email and session from localStorage
  }
  restartValues(): void {
    //this.email = localStorage.getItem('otpEmail');
    this.session = localStorage.getItem('otpSession');
    this.challengeName = localStorage.getItem('challengeName');

    if (!this.emailOTP || !this.session) {
      console.error('Missing email or session in localStorage');
      this.messageService.showMessage('Código incorrecto', 'error');
      // Optionally, redirect the user back to the request OTP screen or show an error message
    }
  }
  returnToEmailForm() {
    this.checkMail.emit(); // Call stepCompleted method
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
      this.otpService.sendOtp(this.emailOTP).subscribe({
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
  submitOtpForm(): void {
    console.log('submitted: ', this.otpObject);
    this.isProcessing = true;
    this.errorMessage = '';
    const otpString = Object.values(this.otpObject).join('');
    if (this.debugMode) {
      setTimeout(() => {
        this.isProcessing = false;
        this.otpValid.emit(); // Call stepCompleted method
      }, 3000); // 3-second delay
    } else {
      this.otpService
        .verifyOtp(
          this.emailOTP || '',
          otpString,
          this.session || '',
          this.challengeName || ''
        )
        .subscribe({
          next: (response) => {
            console.log('OTP Verified:', response);
            // Handle success, maybe redirect the user or proceed with onboarding, etc.
            //localStorage.removeItem('otpEmail');
            localStorage.removeItem('otpSession');
            localStorage.removeItem('challengeName');
            this.otpValid.emit(); // Call stepCompleted method
          },
          error: (error: any) => {
            console.error('Error verifying OTP:', error);
            this.messageService.showMessage(
              'Código incorrecto o utilizado - ',
              'error',
              'Reenviar código',
              () => this.resendCode()
            );
            // Handle error, show message to the user
          },
        });
    }
    this.isProcessing = false;
  }
}
