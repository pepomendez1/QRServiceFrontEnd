import {
  ChangeDetectorRef,
  Component,
  OnInit,
  EventEmitter,
  Output,
  Input,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { ConfigService } from 'src/app/services/config.service';
import { MessageService } from '@fe-treasury/shared/messages/messages.service';
import { OTPService } from 'src/app/services/otp.service';
@Component({
  selector: 'app-password-validation',
  templateUrl: './password-validation.component.html',
  styleUrl: './password-validation.component.scss',
})
export class PasswordValidationComponent {
  @Output() returnToOpts = new EventEmitter<string>();
  @Output() sendOtpForm = new EventEmitter<string>();
  @Input() isMobile: boolean = false;
  @Input() email: string = '';
  passwordForm: FormGroup;
  isProcessing: boolean = false;
  incorrectPass: boolean = false;
  mailError: boolean = false;
  hidePassword = true;
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private otpService: OTPService,
    private configService: ConfigService,
    private messageService: MessageService
  ) {
    this.passwordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
    this.passwordForm.valueChanges.subscribe(() => {
      this.incorrectPass = false;
    });
  }

  returnToOptions() {
    this.returnToOpts.emit();
  }
  submitPass() {
    if (this.passwordForm.valid) {
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
  }
  //this.sendOtpForm.emit(),
  private validatePassword(email: string) {
    const password = this.passwordForm.value.password;
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
        localStorage.setItem('otpSession', response.Session);
        localStorage.setItem('challengeName', response.ChallengeName);
        this.isProcessing = false;
        this.sendOtpForm.emit();
      },
      error: (error) => {
        console.error('Error sending OTP:', error);
        this.incorrectPass = true;
        this.isProcessing = false;
      },
    });
  }
}
