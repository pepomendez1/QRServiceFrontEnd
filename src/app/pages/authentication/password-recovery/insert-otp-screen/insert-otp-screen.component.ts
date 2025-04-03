import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { OtpInputComponent } from '@fe-treasury/shared/otp-input/otp-input.component';
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

  @ViewChild(OtpInputComponent) otpInputComponent!: OtpInputComponent;
  otp: string = ''; // OTP input by the user
  session: string | null = ''; // Session retrieved from localStorage
  userSub: string | null = ''; // Cognito sub value if the user is signed in
  challengeName: string | null = ''; // Challenge name used in OTP verification
  errorMessage: string | null = null;
  successMessage: string | null = null;
  warningMessage: string | null = null;

  headerDescription: string = '';
  clearForm = false;
  isSubmitButtonEnabled = false;

  buttonText: string = 'Continuar'; // Default button text
  buttonEnabled: boolean = false; // Default button state

  constructor(
    private svgLibrary: SvgLibraryService,
    private router: Router,
    private otpService: OTPService,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    console.log('mobile mode in insert otp: ', this.isMobile);

    this.challengeName = localStorage.getItem('challengeName');
    this.session = localStorage.getItem('otpSession');

    console.log('e mail input  ', this.emailOTP);
    console.log('challenge input  ', this.challengeName);
    console.log('session input  ', this.session);

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
    // Retrieve email and session from localStorage
  }

  returnToEmailForm() {
    this.checkMail.emit(); // Call stepCompleted method
  }

  handleButtonText(text: string): void {
    this.buttonText = text;
  }

  handleButtonEnabled(isEnabled: boolean): void {
    this.buttonEnabled = isEnabled;
  }
  otpValidatedOK() {
    this.otpValid.emit(); // Call stepCompleted method
  }

  submitOtp(): void {
    if (this.buttonEnabled) {
      this.otpInputComponent.submitOtp();
    }
  }

  handleButtonState(isEnabled: boolean): void {
    this.isSubmitButtonEnabled = isEnabled;
  }
}
