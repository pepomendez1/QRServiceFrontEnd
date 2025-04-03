import { Component, EventEmitter, Input, Output } from '@angular/core';
import { OTPService } from 'src/app/services/otp.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SvgLibraryService } from 'src/app/services/svg-library.service';
import { MessageService } from '../messages/messages.service';

@Component({
  selector: 'app-otp-input',
  templateUrl: './otp-input.component.html',
  styleUrls: ['./otp-input.component.scss'],
})
export class OtpInputComponent {
  // Input properties
  @Input() gap: string = ''; // Default gap between OTP inputs
  @Input() OTPdescription: string = 'Copia acá ese código para continuar'; // Description text
  @Input() squareInputSize: string = ''; // Default size for the OTP inputs (both width and height)
  @Input() timeLeft: number = 0; // Time left for OTP validation
  @Input() userMail: string | null = '';
  @Input() debugMode: boolean = false;
  @Input() emailValidation: boolean = true;
  @Input() session: string | null = ''; // Session ID for OTP validation
  @Input() challengeName: string | null = ''; // Challenge name for OTP validation
  // Output events
  @Output() buttonText = new EventEmitter<string>(); // Emits button text ("Validando" or "Continuar")
  @Output() buttonEnabled = new EventEmitter<boolean>(); // Emits button enabled state
  @Output() otpValidated = new EventEmitter<void>(); // Emits when OTP is successfully validated

  // Internal state
  public timeLeftOTP = 300; // Default OTP timer value
  clearForm = false; // Flag to clear the OTP form
  timeOut: boolean = false; // Flag to indicate if OTP timer has expired
  resetTimer: boolean = false; // Flag to reset the OTP timer
  enterOTPImg: SafeHtml | null = null; // SVG image for OTP input

  // OTP data
  public otpObject: string = ''; // OTP value entered by the user

  // Button and processing state
  isProcessing: boolean = false; // Flag to indicate if OTP is being processed
  isSubmitButtonEnabled: boolean = false; // Flag to indicate if OTP form is valid
  public incorrectOTP: boolean = false; // Flag to indicate if OTP is incorrect

  constructor(
    private otpService: OTPService,
    private svgLibrary: SvgLibraryService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    // Load SVG image for OTP input
    this.messageService.clearMessage();
    this.svgLibrary.getSvg('enter-password').subscribe((svgContent) => {
      this.enterOTPImg = svgContent; // SafeHtml type to display SVG dynamically
    });
    console.log('e mail input  ', this.userMail);
    console.log('challenge input  ', this.challengeName);
    console.log('session input  ', this.session);
  }

  // Handle OTP timer expiration
  handleTimeOut(): void {
    console.log('Time Out');
    this.timeOut = true;
    this.updateButtonState(); // Update button state and text
    this.messageService.showMessage(
      'El tiempo de validez del código ha caducado - ',
      'warning',
      'Reenviar código',
      () => this.resendCode()
    );
  }

  // Resend OTP code
  resendCode() {
    this.incorrectOTP = false;
    this.isProcessing = true;
    this.updateButtonState(); // Update button state and text

    this.otpService.sendOtp(this.userMail).subscribe({
      next: (response) => {
        //console.log('OTP Sent:', response);
        this.session = response.Session;
        this.timeOut = false;
        this.updateButtonState(); // Update button state and text

        // Reset timer and form
        this.resetTimer = true;
        setTimeout(() => (this.resetTimer = false), 0);
        this.messageService.showMessage('Código enviado!', 'success');
        this.clearForm = true;
        setTimeout(() => (this.clearForm = false), 0);

        setTimeout(() => {
          this.messageService.clearMessage();
        }, 5000);
        this.isProcessing = false;
        this.updateButtonState(); // Update button state and text
        this.restartValues();
      },
      error: (error: any) => {
        console.error('Error sending OTP:', error);
        this.messageService.showMessage('Error en el envío de OTP  ', 'error');
        this.isProcessing = false;
        this.updateButtonState(); // Update button state and text
      },
    });
  }

  // Restart OTP values from localStorage
  restartValues(): void {
    if (!this.userMail || !this.session) {
      console.error('Missing email or session in localStorage');
      this.messageService.showMessage('Código incorrecto', 'error');
    }
  }

  // Handle OTP input event
  handleOtpEvent(otp?: string): void {
    if (otp) {
      this.otpObject = otp;
    }
  }

  // Handle OTP form validity changes
  handleButtonState(isEnabled: boolean): void {
    this.isSubmitButtonEnabled = isEnabled;
    this.updateButtonState(); // Update button state and text
  }

  // Update button state and text based on conditions
  private updateButtonState(): void {
    const isButtonEnabled =
      this.isSubmitButtonEnabled && !this.isProcessing && !this.timeOut;
    const buttonText = this.isProcessing ? 'Validando' : 'Continuar';

    // Emit button state and text to the parent component
    this.buttonEnabled.emit(isButtonEnabled);
    this.buttonText.emit(buttonText);
  }

  // Submit OTP for validation
  submitOtp(): void {
    this.isProcessing = true;
    this.updateButtonState(); // Update button state and text
    //console.log('Submit', this.otpObject);

    // Convert OTP object to string
    const otpString = Object.values(this.otpObject).join('');

    if (this.debugMode) {
      setTimeout(() => {
        this.isProcessing = false;
        this.updateButtonState(); // Update button state and text
        this.otpValidated.emit(); // Emit OTP validation success
      }, 3000);
    } else {
      const emailData = this.emailValidation ? this.userMail : null;

      //console.log('email: ', emailData);
      //console.log('session: ', this.session);
      // Verify OTP via service
      this.otpService
        .verifyOtp(
          emailData,
          otpString,
          this.session || '',
          this.challengeName || ''
        )
        .subscribe({
          next: (data: any) => {
            this.isProcessing = false;
            this.updateButtonState(); // Update button state and text
            this.otpValidated.emit(); // Emit OTP validation success
          },
          error: (error: any) => {
            console.error('Error verifying OTP:', error);
            this.incorrectOTP = true;
            this.isProcessing = false;
            this.updateButtonState(); // Update button state and text
          },
        });
    }
  }
}
