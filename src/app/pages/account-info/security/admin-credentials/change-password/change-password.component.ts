import {
  Component,
  EventEmitter,
  ViewChild,
  Output,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { OTPService } from 'src/app/services/otp.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfigService } from 'src/app/services/config.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MessagesModule } from '@fe-treasury/shared/messages/messages.module';
import { SidePanelHeaderComponent } from '@fe-treasury/shared/side-panel/side-panel-header/side-panel-header.component';
import { SidePanelFooterComponent } from '@fe-treasury/shared/side-panel/side-panel-footer/side-panel-footer.component';
import { PinCodeService } from 'src/app/services/pin-code.service';
import { SvgLibraryService } from 'src/app/services/svg-library.service';
import { MessageService } from '@fe-treasury/shared/messages/messages.service';
import { AuthService } from 'src/app/services/auth.service';
import { MatInputModule } from '@angular/material/input';
import {
  specialCharacterValidator,
  numberValidator,
  uppercaseValidator,
  lowercaseValidator,
} from 'src/app/utils/form-validators';

import { OtpFormModule } from '@fe-treasury/shared/otp-form/otp-form.module';
import { SafeHtml } from '@angular/platform-browser';
@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatCardModule,
    OtpFormModule,
    FormsModule,
    ReactiveFormsModule,
    MessagesModule,
    MatFormFieldModule,
    SidePanelHeaderComponent,
    MatProgressSpinnerModule,
    SidePanelFooterComponent,
  ],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.scss',
})
export class ChangePasswordComponent {
  @Output() backToCredentials = new EventEmitter<void>();
  @Output() backToSecurityPanel = new EventEmitter<void>();
  isProcessing: boolean = false;
  pinForm: FormGroup;
  authForm: FormGroup;
  OTPinputImg: SafeHtml | null = null;
  successImg: SafeHtml | null = null;
  otp: string = ''; // OTP input by the user
  session: string | null = ''; // Session retrieved from localStorage
  challengeName: string | null = ''; // Challenge name used in OTP verification
  timeLeft: number = 300;
  timeOut: boolean = false;
  incorrectPin: boolean = false;
  clearForm = false;
  resetTimer: boolean = false; // Reset timer signal
  email: any = '';
  hidePassword: boolean = true;
  hideNewPassword: boolean = true;
  hideConfirm: boolean = true;
  incorrectPass: boolean = false;
  debugMode: boolean = false;
  isResetPasswordSubmitEnabled: boolean = false;
  passwordToValidate: any = '';
  @ViewChild('digit1') firstInput!: ElementRef; // Reference to the first input
  isSubmitButtonEnabled = false;
  public otpObject: string = '';
  // --- States list Referencia ---------------------------------------------//
  // insertPIN: Validación de PIN
  // insertOTP: Formulario para ingresar OTP del mail
  // insertPassword: Validación de contraseña
  // resetPassword: Pantalla cambio de contraseña
  // changeSuccess: pantalla de success
  // ---------------------------------------------------------------------//
  viewState: string = 'insertPIN'; // Default state

  constructor(
    private svgLibrary: SvgLibraryService,
    private fb: FormBuilder,
    private pinCodeService: PinCodeService,
    private configService: ConfigService,
    private otpService: OTPService,
    private authService: AuthService,
    private messageService: MessageService
  ) {
    this.pinForm = this.fb.group({
      digit1: ['', [Validators.required, Validators.pattern('[0-9]')]],
      digit2: ['', [Validators.required, Validators.pattern('[0-9]')]],
      digit3: ['', [Validators.required, Validators.pattern('[0-9]')]],
      digit4: ['', [Validators.required, Validators.pattern('[0-9]')]],
      digit5: ['', [Validators.required, Validators.pattern('[0-9]')]],
      digit6: ['', [Validators.required, Validators.pattern('[0-9]')]],
    });
    this.pinForm.valueChanges.subscribe(() => {
      this.messageService.clearMessage();
      this.incorrectPin = false;
    });

    this.authForm = this.fb.group({
      newPassword: [
        '',
        [
          Validators.required,
          Validators.minLength(12),
          specialCharacterValidator(),
          numberValidator(),
          uppercaseValidator(),
          lowercaseValidator(),
        ],
      ],
      confirmPassword: [
        '',
        [
          Validators.required,
          Validators.minLength(12),
          specialCharacterValidator(),
          numberValidator(),
          uppercaseValidator(),
        ],
      ],
    });
    this.authForm.valueChanges.subscribe(() => {
      this.messageService.clearMessage();
      this.checkFormValidity();
    });
  }
  checkFormValidity(): void {
    this.incorrectPass = false;
    //const password = this.authForm.get('newPassword')?.value;
    this.isResetPasswordSubmitEnabled =
      this.authForm.get('newPassword')!.valid &&
      this.authForm.get('confirmPassword')!.valid &&
      !this.authForm.hasError('passwordMismatch');
  }
  hasFormError(controlName: string, errorName: string): boolean {
    return this.authForm.controls[controlName].hasError(errorName);
  }
  ngOnInit() {
    this.svgLibrary.getSvg('enter-password').subscribe((svgContent) => {
      this.OTPinputImg = svgContent; // SafeHtml type to display SVG dynamically
    });
    this.svgLibrary.getSvg('congrats').subscribe((svgContent) => {
      this.successImg = svgContent; // SafeHtml type to display SVG dynamically
    });
    this.messageService.clearMessage();
    this.email = this.authService.getEmail();
  }
  passwordFormIsValid(): boolean {
    const passwordNotEmpty = !!this.passwordToValidate;
    const passwordLength = this.passwordToValidate.length >= 12;
    return passwordNotEmpty && passwordLength;
  }
  resetIncorrectPass(): void {
    this.incorrectPass = false; // Reset the incorrectPass value
  }
  handleBackspace(
    event: KeyboardEvent,
    previousInput: HTMLInputElement | null
  ): void {
    if (
      event.key === 'Backspace' &&
      (event.target as HTMLInputElement).value === ''
    ) {
      if (previousInput) {
        previousInput.focus();
        previousInput.value = ''; // Clear the previous input
      }
    }
  }

  moveToNextField(event: Event, nextField?: HTMLInputElement): void {
    const currentField = event.target as HTMLInputElement | null;

    if (currentField && currentField.value.length >= currentField.maxLength) {
      nextField?.focus();
    }
  }

  handleArrowBack() {
    // insertPIN: Validación de PIN
    // insertOTP: Formulario para ingresar OTP del mail
    // insertPassword: Validación de contraseña
    // resetPassword: Pantalla cambio de contraseña
    // changeSuccess: pantalla de success
    switch (this.viewState) {
      case 'insertPIN':
        this.backToCredentials.emit();
        break;
      case 'insertOTP':
        this.viewState = 'insertPIN';
        break;
      case 'insertPassword':
        this.viewState = 'insertOTP';
        break;
      case 'resetPassword':
        this.viewState = 'insertPassword';
        break;
      case 'changeSuccess':
        this.viewState = 'resetPassword';
        break;
      default:
        break;
    }
  }

  submitPin() {
    if (this.pinForm.valid) {
      console.log('set pin');
      this.isProcessing = true;

      this.configService.getConfig().subscribe({
        next: (config: any) => {
          const clientId = config.portal_client_id;
          console.log('clientId:', clientId);
          this.validatePinCode(this.email, clientId);
        },
        error: () => {
          this.isProcessing = false;
          this.messageService.showMessage(
            'Error obteniendo la configuración. Inténtalo de nuevo.',
            'error'
          );
        },
      });
    }
  }

  private validatePinCode(email: string, clientId: string) {
    const pinCode = Object.values(this.pinForm.value).join('');
    this.pinCodeService.validatePinCode(pinCode, email, clientId).subscribe({
      next: () => this.sendOtp(email),
      error: () => {
        this.isProcessing = false;
        this.incorrectPin = true;
      },
    });
  }
  private sendOtp(email: string) {
    this.otpService.sendOtp(email).subscribe({
      next: (response) => {
        console.log('OTP Sent:', response);
        //localStorage.setItem('otpEmail', email);
        localStorage.setItem('otpSession', response.Session);
        localStorage.setItem('challengeName', response.ChallengeName);
        this.isProcessing = false;
        this.viewState = 'insertOTP';
      },
      error: (error) => {
        console.error('Error sending OTP:', error);
        this.incorrectPin = true;
        this.isProcessing = false;
      },
    });
  }

  handleOtpEvent(otp?: string) {
    if (otp) {
      this.otpObject = otp;
    }
    return;
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
  handleButtonState(isEnabled: boolean): void {
    this.isSubmitButtonEnabled = isEnabled;
  }

  submitOtpForm(): void {
    console.log('submitted: ', this.otpObject);
    this.isProcessing = true;
    const otpString = Object.values(this.otpObject).join('');
    if (this.debugMode) {
      setTimeout(() => {
        this.isProcessing = false;
        this.viewState = 'insertPassword';
      }, 3000); // 3-second delay
    } else {
      this.session = localStorage.getItem('otpSession');
      this.challengeName = localStorage.getItem('challengeName');
      this.otpService
        .verifyOtp(
          this.email || '',
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
            this.isProcessing = false;
            this.viewState = 'insertPassword';
            //this.otpValid.emit(); // Call stepCompleted method
          },
          error: (error: any) => {
            console.error('Error verifying OTP:', error);
            this.messageService.showMessage(
              'Código incorrecto o utilizado - ',
              'error',
              'Reenviar código',
              () => this.resendCode()
            );
            this.isProcessing = false;
            // Handle error, show message to the user
          },
        });
    }
  }
  validatePasswordForm(): void {
    console.log('validate password');
    this.isProcessing = true;
    this.configService.getConfig().subscribe({
      next: (config: any) => {
        const clientId = config.portal_client_id;
        console.log('clientId:', clientId);
        this.validatePassword(this.email);
      },
      error: () => {
        this.isProcessing = false;
        this.messageService.showMessage(
          'Error obteniendo la configuración. Inténtalo de nuevo.',
          'error'
        );
      },
    });
  }

  private validatePassword(email: string) {
    const password = this.passwordToValidate;
    const checkCredentials = { username: email, password: password };
    this.authService.signIn(checkCredentials).subscribe({
      next: () => {
        this.isProcessing = false;
        this.viewState = 'resetPassword';
      },
      error: () => {
        this.isProcessing = false;
        this.incorrectPass = true;
      },
    });
  }

  resetPassword(): void {
    if (
      this.authForm.value.newPassword !== this.authForm.value.confirmPassword
    ) {
      this.incorrectPass = true;
      this.isProcessing = false;
      return;
    } else {
      this.isProcessing = true;
      console.log('Form submitted', this.authForm.value);
      if (this.debugMode) {
        setTimeout(() => {
          this.isProcessing = false;
          console.log('debug mode----: no password check');
          this.viewState = 'changeSuccess'; // Back to the password recovery process
        }, 3000); // 3-second delay
      } else {
        this.authService.resetPassword(this.authForm.value).subscribe({
          next: (response) => {
            console.log('clave reseteada exitosamente:', response);
            this.isProcessing = false;
            this.viewState = 'changeSuccess'; // Back to the password recovery process
          },
          error: (error) => {
            this.isProcessing = false;
            console.error('Error completando nueva contraseña:', error);
            this.messageService.showMessage(
              'Error generando la nueva contraseña ' + error?.error?.message,
              'error'
            );
          },
        });
      }
    }
  }
  allowOnlyNumbers(event: KeyboardEvent): void {
    const charCode = event.key.charCodeAt(0);

    // Allow only numeric characters (0-9)
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }
  backToOptions(): void {
    this.backToSecurityPanel.emit();
  }
}
