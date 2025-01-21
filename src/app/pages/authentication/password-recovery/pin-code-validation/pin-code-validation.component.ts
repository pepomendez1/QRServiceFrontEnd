import {
  Component,
  EventEmitter,
  Input,
  ViewChild,
  Output,
  ElementRef,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PinCodeService } from 'src/app/services/pin-code.service';
import { ConfigService } from 'src/app/services/config.service';
import { MessageService } from '@fe-treasury/shared/messages/messages.service';
import { OTPService } from 'src/app/services/otp.service';
@Component({
  selector: 'app-pin-code-validation',
  templateUrl: './pin-code-validation.component.html',
  styleUrl: './pin-code-validation.component.scss',
})
export class PinCodeValidationComponent {
  @Input() isMobile: boolean = false;
  @Input() email: string = '';
  @Output() sendOtpForm = new EventEmitter<string>();
  @Output() returnToOpts = new EventEmitter<string>();
  pinForm: FormGroup;
  @ViewChild('digit1') firstInput!: ElementRef; // Reference to the first input
  isProcessing: boolean = false;
  incorrectPin: boolean = false;
  mailError: boolean = false;
  constructor(
    private fb: FormBuilder,
    private pinCodeService: PinCodeService,
    private configService: ConfigService,
    private otpService: OTPService,
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
      this.incorrectPin = false;
    });
  }

  ngAfterViewInit(): void {
    this.firstInput.nativeElement.focus(); // Focus the first input on component load
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

  returnToOptions() {
    this.returnToOpts.emit();
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
        this.sendOtpForm.emit();
      },
      error: (error) => {
        console.error('Error sending OTP:', error);
        this.incorrectPin = true;
        this.isProcessing = false;
      },
    });
  }
}
