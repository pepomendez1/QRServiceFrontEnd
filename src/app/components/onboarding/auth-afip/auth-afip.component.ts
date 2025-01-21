import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AfipService } from '../../../services/afip.service';
import { OnboardingService } from 'src/app/services/onboarding.service';
import { TokenService } from 'src/app/services/token.service';
import {
  emailValidator,
  argentinaPhoneNumberValidator,
} from '../../../utils/form-validators';
import { SnackBarMessage } from '../../common/snackbar/snackbar';

@Component({
  selector: 'app-auth-afip',
  templateUrl: './auth-afip.component.html',
  styleUrls: ['./auth-afip.component.scss'],
})
export class AuthAfipComponent {
  @Output() stepCompleted = new EventEmitter<void>();
  cuilForm: FormGroup;
  warningMessage: string | null = null;
  errorMessage: string | null = null;
  isProcessing = false; // Tracks the processing state

  constructor(
    private fb: FormBuilder,
    private snackBarMessage: SnackBarMessage,
    private onboardingService: OnboardingService
  ) {
    this.cuilForm = this.fb.group({
      cuil: [
        '',
        [
          Validators.required,
          Validators.minLength(11),
          Validators.maxLength(11),
          Validators.pattern('^[0-9]*$'),
        ],
      ],
      email: ['', [Validators.required, emailValidator()]],
      phone: ['', [Validators.required, argentinaPhoneNumberValidator()]],
    });
    this.cuilForm.valueChanges.subscribe(() => {
      this.updateFormValidity();
    });
  }

  updateFormValidity() {
    const cuil = this.cuilForm.get('cuil')?.value;
    if (cuil && cuil.length !== 11) {
      this.warningMessage = 'El CUIL/CUIT debe tener 11 dígitos';
    } else if (cuil && !/^\d+$/.test(cuil)) {
      this.warningMessage = 'El CUIL/CUIT debe ser numérico';
    } else {
      this.warningMessage = null;
    }
  }

  onSubmit() {
    this.isProcessing = true;
    if (this.cuilForm.valid) {
      console.log('Form submitted', this.cuilForm.value);
      this.onboardingService.afipOnboarding(this.cuilForm.value).subscribe(
        () => {
          this.stepCompleted.emit();
        },
        (error: any) => {
          console.error('Failed to update step:', error);
          this.snackBarMessage.showSnackbar(
            'Error:' + error.error.message,
            'error'
          );
          this.isProcessing = false;
        }
      );
    }
  }
}
