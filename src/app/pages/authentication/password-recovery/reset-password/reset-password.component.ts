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
import {
  specialCharacterValidator,
  numberValidator,
  uppercaseValidator,
  lowercaseValidator,
} from 'src/app/utils/form-validators';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
})
export class ResetPasswordComponent {
  @Output() newPassValid = new EventEmitter<void>();
  @Output() returnToOptions = new EventEmitter<void>();
  @Input() debugMode: boolean = false;
  @Input() isMobile: boolean = false;
  authForm: FormGroup;
  hide = true;
  hideConfirm = true;
  isSubmitEnabled: boolean = false;
  incorrectPass: boolean = false;
  isProcessing = false; // Tracks the processing state

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private cd: ChangeDetectorRef
  ) {
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
      this.checkFormValidity();
    });
  }
  ngOnInit(): void {
    this.checkFormValidity();
  }
  checkFormValidity(): void {
    this.incorrectPass = false;
    //const password = this.authForm.get('newPassword')?.value;
    this.isSubmitEnabled =
      this.authForm.get('newPassword')!.valid &&
      this.authForm.get('confirmPassword')!.valid &&
      !this.authForm.hasError('passwordMismatch');
  }
  hasFormError(controlName: string, errorName: string): boolean {
    return this.authForm.controls[controlName].hasError(errorName);
  }
  returnArrow(): void {
    this.returnToOptions.emit();
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
          this.newPassValid.emit(); // Back to the password recovery process
        }, 3000); // 3-second delay
      } else {
        this.authService.resetPassword(this.authForm.value).subscribe({
          next: (response) => {
            console.log('clave reseteada exitosamente:', response);
            this.isProcessing = false;
            this.newPassValid.emit(); // Back to the password recovery process
          },
          error: (error) => {
            this.isProcessing = false;
            console.error('Error completando nueva contraseña:', error);
          },
        });
      }
    }
  }
}
