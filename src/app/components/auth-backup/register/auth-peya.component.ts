import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import {
  specialCharacterValidator,
  numberValidator,
  uppercaseValidator,
  lowercaseValidator,
} from 'src/app/utils/form-validators';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './auth-peya.component.html',
  styleUrls: ['./auth-peya.component.scss'],
})
export class AuthComponentPeYa implements OnInit {
  currentStep: number = 1;
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
    private router: Router,
    private cd: ChangeDetectorRef
  ) {
    this.authForm = this.fb.group({
      // username: ['', [Validators.required, Validators.email]],
      // password: ['', [Validators.required, Validators.minLength(8)]],
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
  onSubmit(): void {
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
      this.authService.completeNewPassword(this.authForm.value).subscribe({
        next: (response) => {
          console.log('Autenticación completada exitosamente:', response);
          this.router.navigate(['/']);
        },
        error: (error) => {
          this.errorMessage = 'Error completando nueva contraseña: ' + error;
          console.error('Error completando nueva contraseña:', error);
        },
      });
    }
  }
  goToStep(step: string) {
    this.router.navigate([`/onboarding-peya/${step}`]);
  }
}
