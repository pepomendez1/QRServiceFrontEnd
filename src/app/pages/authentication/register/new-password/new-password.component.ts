import {
  ChangeDetectorRef,
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import {
  specialCharacterValidator,
  numberValidator,
  uppercaseValidator,
  lowercaseValidator,
} from 'src/app/utils/form-validators';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Router } from '@angular/router';

@Component({
  selector: 'app-new-password',
  templateUrl: './new-password.component.html',
  styleUrl: './new-password.component.scss',
})
export class NewPasswordComponent {
  @Input() debugMode: boolean = false;
  @Input() isMobile: boolean = false;
  @Output() returnToWelcome = new EventEmitter<void>();
  currentStep: number = 1;
  authForm: FormGroup;
  hide = true;
  hideConfirm = true;
  incorrectPass: boolean = false;
  isSubmitEnabled: boolean = false;

  errorMessage: string | null = null;
  warningMessage: string | null = null;
  isProcessing = false; // Tracks the processing state

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private cd: ChangeDetectorRef,
    private breakpointObserver: BreakpointObserver
  ) {
    this.authForm = this.fb.group(
      {
        // username: ['', [Validators.required, Validators.email]],
        // password: ['', [Validators.required, Validators.minLength(8)]],
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
      },
      { validator: this.passwordMatchValidator } // Add custom validator here
    );
    this.authForm.valueChanges.subscribe(() => {
      this.checkFormValidity();
    });
  }

  // Custom validator to check if passwords match
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  ngOnInit(): void {
    this.checkFormValidity();
  }
  checkFormValidity(): void {
    const newPasswordValid = this.authForm.get('newPassword')!.valid;
    const confirmPasswordValid = this.authForm.get('confirmPassword')!.valid;

    // Enable the button if both fields meet the requirements
    this.isSubmitEnabled = newPasswordValid && confirmPasswordValid;
  }
  hasFormError(controlName: string, errorName: string): boolean {
    return this.authForm.controls[controlName].hasError(errorName);
  }
  onSubmit(): void {
    const newPassword = this.authForm.get('newPassword')!.value;
    const confirmPassword = this.authForm.get('confirmPassword')!.value;

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      // Manually set the error for passwordMismatch
      this.authForm
        .get('confirmPassword')!
        .setErrors({ passwordMismatch: true });
      return; // Stop form submission
    }

    // If passwords match, proceed with submission
    this.errorMessage = null;
    this.isProcessing = true;

    if (this.debugMode) {
      console.log('password OK --- Debug Mode');
      setTimeout(() => {
        this.isProcessing = false;
        this.router.navigate(['/pin-code']);
      }, 3000); // 3-second delay
    } else {
      this.authService.completeNewPassword(this.authForm.value).subscribe({
        next: (response) => {
          console.log('Autenticación completada exitosamente:', response);
          this.isProcessing = false;
          this.router.navigate(['/pin-code']);
        },
        error: (error) => {
          this.errorMessage = 'Error completando nueva contraseña: ' + error;
          console.error('Error completando nueva contraseña:', error);
          this.isProcessing = false;
        },
      });
    }
  }

  disablePaste(event: ClipboardEvent): void {
    event.preventDefault();
  }

  returnArrow() {
    this.returnToWelcome.emit(); // Call stepCompleted method
  }
  goToStep(step: string) {
    this.router.navigate([`/onboarding-peya/${step}`]);
  }
}
