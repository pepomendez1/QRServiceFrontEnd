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
import { SvgLibraryService } from 'src/app/services/svg-library.service';
import { MessagesModule } from '@fe-treasury/shared/messages/messages.module';
import { SidePanelHeaderComponent } from '@fe-treasury/shared/side-panel/side-panel-header/side-panel-header.component';
import { SidePanelFooterComponent } from '@fe-treasury/shared/side-panel/side-panel-footer/side-panel-footer.component';
import { PinCodeService } from 'src/app/services/pin-code.service';
import { MessageService } from '@fe-treasury/shared/messages/messages.service';
import { AuthService } from 'src/app/services/auth.service';
import { MatInputModule } from '@angular/material/input';
import { OtpInputComponent } from '@fe-treasury/shared/otp-input/otp-input.component';
import { OtpInputModule } from '@fe-treasury/shared/otp-input/otp-input.module';
import { SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-change-pin',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatCardModule,
    OtpInputModule,
    FormsModule,
    ReactiveFormsModule,
    MessagesModule,
    MatFormFieldModule,
    SidePanelHeaderComponent,
    MatProgressSpinnerModule,
    SidePanelFooterComponent,
  ],
  templateUrl: './change-pin.component.html',
  styleUrl: './change-pin.component.scss',
})
export class ChangePinComponent {
  @ViewChild(OtpInputComponent) otpInputComponent!: OtpInputComponent;
  @ViewChild('digit1') firstInput!: ElementRef; // Reference to the first input
  @Output() backToCredentials = new EventEmitter<void>();
  @Output() backToSecurityPanel = new EventEmitter<void>();
  isProcessing: boolean = false;
  pinForm: FormGroup;

  successImg: SafeHtml | null = null;

  // OTP
  session: string | null = ''; // Session retrieved from localStorage
  challengeName: string | null = ''; // Challenge name used in OTP verification
  email: any = '';
  buttonText: string = 'Continuar'; // Default button text
  buttonEnabled: boolean = false; // Default button state

  incorrectPin: boolean = false;
  hidePassword: boolean = true;
  incorrectPass: boolean = false;
  debugMode: boolean = false;
  passwordToValidate: any = '';
  public otpObject: string = '';
  newPinForm: FormGroup;
  setPin: string = '';
  pinConfirm: FormGroup;
  confirmPinForm = false;
  diffPinConfirm: boolean = false;

  // --- States list Referencia ---------------------------------------------//
  // insertPIN: Validación de PIN
  // insertOTP: Formulario para ingresar OTP del mail
  // insertPassword: Validación de contraseña
  // resetPinCode: Pantalla cambio de contraseña
  // changeSuccess: pantalla de success
  // ---------------------------------------------------------------------//
  viewState: string = 'insertPassword'; // Default state

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
    this.newPinForm = this.fb.group({
      digit1: ['', [Validators.required, Validators.pattern('[0-9]')]],
      digit2: ['', [Validators.required, Validators.pattern('[0-9]')]],
      digit3: ['', [Validators.required, Validators.pattern('[0-9]')]],
      digit4: ['', [Validators.required, Validators.pattern('[0-9]')]],
      digit5: ['', [Validators.required, Validators.pattern('[0-9]')]],
      digit6: ['', [Validators.required, Validators.pattern('[0-9]')]],
    });
    this.pinConfirm = this.fb.group({
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
    this.newPinForm.valueChanges.subscribe(() => {
      this.messageService.clearMessage();
      this.diffPinConfirm = false;
    });
    this.pinConfirm.valueChanges.subscribe(() => {
      this.messageService.clearMessage();
      this.diffPinConfirm = false;
    });
  }

  ngOnInit() {
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
  allowOnlyNumbers(event: KeyboardEvent): void {
    const charCode = event.key.charCodeAt(0);

    // Allow only numeric characters (0-9)
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }
  handleArrowBack() {
    // insertPassword: Validación de contraseña
    // insertOTP: Formulario para ingresar OTP del mail
    // insertPIN: Validación de PIN
    // resetPinCode: Pantalla cambio de contraseña
    // changeSuccess: pantalla de success
    switch (this.viewState) {
      case 'insertPassword':
        this.backToCredentials.emit();
        break;
      case 'insertOTP':
        this.viewState = 'insertPassword';
        break;
      case 'insertPIN':
        this.viewState = 'insertOTP';
        break;
      case 'resetPinCode':
        if (this.confirmPinForm) this.confirmPinForm = false;
        else this.viewState = 'insertPIN';
        break;
      case 'changeSuccess':
        this.confirmPinForm = false;
        this.viewState = 'resetPinCode';
        break;
      default:
        break;
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
      next: () => this.sendOtp(email),
      error: () => {
        this.isProcessing = false;
        this.incorrectPass = true;
      },
    });
  }

  private sendOtp(email: string) {
    this.otpService.sendOtp(email).subscribe({
      next: (response) => {
        console.log('OTP Sent:', response);
        //localStorage.setItem('otpEmail', email);
        this.session = response.Session;
        this.challengeName = response.ChallengeName;
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
  handleButtonText(text: string): void {
    this.buttonText = text;
  }

  handleButtonEnabled(isEnabled: boolean): void {
    this.buttonEnabled = isEnabled;
  }

  submitOtp(): void {
    if (this.buttonEnabled) {
      this.otpInputComponent.submitOtp();
    }
  }
  otpValidatedOK() {
    this.isProcessing = false;
    this.viewState = 'insertPIN';
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
      next: () => {
        this.isProcessing = false;
        this.viewState = 'resetPinCode';
      },
      error: () => {
        this.isProcessing = false;
        this.incorrectPin = true;
      },
    });
  }

  submitNewPin() {
    if (this.newPinForm.valid) {
      console.log('set pin');
      this.isProcessing = true;
      const pin = Object.values(this.newPinForm.value).join('');
      this.setPin = pin;
      this.confirmPinForm = true;
      this.isProcessing = false;
    }
  }

  submitPinConfirm(): void {
    if (this.pinConfirm.valid) {
      this.isProcessing = true;
      const pinConfirmed = Object.values(this.pinConfirm.value).join('');
      console.log('Form submitted:', pinConfirmed);
      if (pinConfirmed !== this.setPin) {
        this.isProcessing = false;
        this.diffPinConfirm = true;
        console.log('pins no coinciden');
      }
      //this.pinEntered = true;
      else {
        if (this.debugMode) this.viewState = 'changeSuccess'; //exit pin code
        else {
          this.pinCodeService.setPinCode(Number(pinConfirmed)).subscribe(
            () => {
              console.log('pin code reset OK');
              this.viewState = 'changeSuccess';
              this.isProcessing = false;
            },
            (error: any) => {
              console.error('Failed to update step:', error);
              this.messageService.showMessage(
                'Error al Actualizar PIN ' + error,
                'error'
              );
              this.isProcessing = false;
            }
          );
        }
      }
    }
  }
  backToOptions(): void {
    this.backToSecurityPanel.emit();
  }
}
