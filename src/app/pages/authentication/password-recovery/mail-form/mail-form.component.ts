import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OTPService } from 'src/app/services/otp.service';
import { MessageService } from '@fe-treasury/shared/messages/messages.service';

@Component({
  selector: 'mail-recovery-form',
  templateUrl: './mail-form.component.html',
  styleUrls: ['./mail-form.component.scss'],
})
export class MailRecoveryFormComponent {
  @Input() recoveryType: string | undefined;
  @Input() debugMode: boolean = false;
  @Input() isMobile: boolean = false;
  @Output() mailCompleted = new EventEmitter<string>();
  @Output() returnToOpts = new EventEmitter<string>();

  recoveryMail: FormGroup;
  successMessage: any = null;
  errorMessage: any = null;
  isProcessing: boolean = false;
  mailError: boolean = false;
  challengeName = ''; // Challenge name used in OTP verification
  session: string = ''; // Session token to be saved when OTP is sent
  userSub: string | null = ''; // Cognito sub value if the user is signed in
  headerDescription: string = '';
  constructor(
    private fb: FormBuilder,
    private otpService: OTPService,
    private messageService: MessageService
  ) {
    this.recoveryMail = this.fb.group({
      emailInput: ['', [Validators.required, Validators.email]],
    });

    this.recoveryMail.valueChanges.subscribe(() => {
      this.mailError = false;
      this.messageService.clearMessage();
    });
  }

  ngOnInit(): void {
    this.messageService.clearMessage();
    switch (this.recoveryType) {
      case 'password':
        this.headerDescription =
          'Te enviaremos un código a tu mail para que generes una nueva contraseña';
        break;
      case 'pin':
        this.headerDescription =
          ' Te enviaremos un código a tu mail para que generes un nuevo PIN';
        break;
      case 'password-pin':
        this.headerDescription =
          'Te enviaremos un código a tu mail para que generes una nueva contraseña y PIN, además tendrás que validar tu identidad.';
        break;
      default:
        break;
    }
  }
  returnToOptions() {
    this.returnToOpts.emit(); // Call stepCompleted method
  }

  handleValidation() {
    const control = this.recoveryMail.get('emailInput');
    if (control && control.touched) {
      if (control.hasError('required')) {
        this.errorMessage = 'El e-mail es obligatorio.';
      } else if (control.hasError('email')) {
        this.errorMessage = 'El formato del e-mail es inválido.';
      } else {
        this.errorMessage = '';
      }
    } else {
      this.errorMessage = '';
    }
  }

  submitForm() {
    // Trigger validation before submitting
    this.recoveryMail.markAllAsTouched();
    this.handleValidation();

    if (this.recoveryMail.invalid) return;

    this.isProcessing = true;
    const email = this.recoveryMail.value.emailInput;

    if (this.recoveryType === 'password-pin') {
      this.sendOtp(email);
    } else {
      this.mailCompleted.emit(email); // Call stepCompleted method
      this.isProcessing = false;
    }
  }

  private sendOtp(email: string) {
    if (this.debugMode) {
      setTimeout(() => {
        this.isProcessing = false;
        this.mailCompleted.emit(email); // Call stepCompleted method
      }, 3000); // 3-second delay
    } else {
      this.otpService.sendOtp(email).subscribe({
        next: (response) => {
          console.log('OTP Sent:', response);
          localStorage.setItem('otpSession', response.Session);
          localStorage.setItem('challengeName', response.ChallengeName);
          this.isProcessing = false;
          this.mailCompleted.emit(email); // Call stepCompleted method
        },
        error: (error) => {
          console.error('Error sending OTP:', error);
          this.mailError = true;
          this.errorMessage =
            'No tenemos registrado este correo. Revisá e ingresalo nuevamente.';
          this.isProcessing = false;
        },
      });
    }
  }
}
