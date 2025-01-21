import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { OTPService } from 'src/app/services/otp.service';
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
  challengeName = ''; // Challenge name used in OTP verification
  session: string = ''; // Session token to be saved when OTP is sent
  userSub: string | null = ''; // Cognito sub value if the user is signed in

  constructor(
    private fb: FormBuilder,
    private otpService: OTPService,
    private router: Router,
    private authService: AuthService
  ) {
    this.recoveryMail = this.fb.group({
      emailInput: ['', [Validators.required, Validators.email]], // Both validators are synchronous
    });

    this.recoveryMail.valueChanges.subscribe(() => {});
  }

  ngOnInit(): void {}
  returnToOptions() {
    this.returnToOpts.emit(); // Call stepCompleted method
  }

  sendEmail() {
    if (this.recoveryMail.invalid) {
      return;
    } else {
      const email = this.recoveryMail.value.emailInput;
      if (this.debugMode) {
        this.mailCompleted.emit(email); // Call stepCompleted method
      } else {
        this.otpService.sendOtp(email).subscribe({
          next: (response) => {
            console.log('OTP Sent:', response);
            localStorage.setItem('otpEmail', email);
            localStorage.setItem('otpSession', response.Session);
            localStorage.setItem('challengeName', response.ChallengeName);
            this.mailCompleted.emit(this.recoveryMail.value.emailInput); // Call stepCompleted method
          },
          error: (error: any) => {
            console.error('Error sending OTP:', error);
          },
        });
      }
    }
  }
}
