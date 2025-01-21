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
  @Input() debugMode: boolean = false;
  authForm: FormGroup;
  hide = true;
  hideConfirm = true;
  isSubmitEnabled: boolean = false;

  errorMessage: string | null = null;
  warningMessage: string | null = null;
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
          Validators.minLength(8),
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
          Validators.minLength(8),
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
    this.errorMessage = null;
    //const password = this.authForm.get('newPassword')?.value;
    this.isSubmitEnabled =
      this.authForm.get('newPassword')!.valid &&
      this.authForm.get('confirmPassword')!.valid &&
      !this.authForm.hasError('passwordMismatch');
  }
  hasFormError(controlName: string, errorName: string): boolean {
    return this.authForm.controls[controlName].hasError(errorName);
  }
  resetPassword(): void {
    if (
      this.authForm.value.newPassword !== this.authForm.value.confirmPassword
    ) {
      this.errorMessage = 'Las contraseñas ingresadas no coinciden';
      this.isProcessing = false;
      return;
    } else {
      this.errorMessage = null;
      this.isProcessing = true;
      console.log('Form submitted', this.authForm.value);
      if (this.debugMode) {
        console.log('debug mode----: no password check');
        this.newPassValid.emit(); // Back to the password recovery process
      } else {
        this.authService.resetPassword(this.authForm.value).subscribe({
          next: (response) => {
            console.log('clave reseteada exitosamente:', response);
            this.newPassValid.emit(); // Back to the password recovery process
          },
          error: (error) => {
            this.errorMessage = 'Error completando nueva contraseña: ' + error;
            console.error('Error completando nueva contraseña:', error);
          },
        });
      }
    }
  }
}
