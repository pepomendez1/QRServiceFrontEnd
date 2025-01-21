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
    this.authForm = this.fb.group({
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
  onSubmit(): void {
    if (
      this.authForm.value.newPassword !== this.authForm.value.confirmPassword
    ) {
      this.incorrectPass = true;
      this.isProcessing = false;
      return;
    } else {
      this.errorMessage = null;
      this.isProcessing = true;
      console.log('Form submitted', this.authForm.value);
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
