import { Component, EventEmitter, Output, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PinCodeService } from 'src/app/services/pin-code.service';
import { SnackBarMessage } from '../common/snackbar/snackbar';
@Component({
  selector: 'app-pin-code',
  templateUrl: './pin-code.component.html',
  styleUrls: ['./pin-code.component.scss'],
})
export class PinCodeComponent {
  @Input() onboardingPartner: string | undefined; // or the appropriate type
  @Input() pinCodeMode: string = 'new';
  @Input() debugMode: boolean = false;
  @Output() stageCompleted = new EventEmitter<void>();
  @Output() pinResetOK = new EventEmitter<void>();
  pinForm: FormGroup;
  errorMessage: string | null = null;
  warningMessage: string | null = null;
  isProcessing = false; // Tracks the processing state

  constructor(
    private fb: FormBuilder,
    private snackBarMessage: SnackBarMessage,
    private pinCodeService: PinCodeService
  ) {
    this.pinForm = this.fb.group({
      pin: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
      confirmPin: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
    });
    this.pinForm.valueChanges.subscribe(() => {
      this.checkFormValidity();
    });
  }
  checkFormValidity(): void {
    const pin = this.pinForm.get('pin')?.value;
    if (pin && pin.length !== 6) {
      this.warningMessage = 'El PIN debe tener 6 dígitos';
    } else if (pin && !/^\d+$/.test(pin)) {
      this.warningMessage = 'El PIN debe ser numérico';
    } else {
      this.warningMessage = null;
    }
  }

  finishPin(): void {
    this.stageCompleted.emit();
  }
  finishResetPin(): void {
    this.pinResetOK.emit();
  }
  onSubmit(): void {
    if (this.pinForm.valid) {
      this.isProcessing = true;
      const pin = this.pinForm.get('pin')?.value;
      const confirmPin = this.pinForm.get('confirmPin')?.value;
      // Handle form submission
      if (pin !== confirmPin) {
        this.errorMessage = 'Los PINs ingresados no coinciden';
        this.isProcessing = false;
      } else {
        this.errorMessage = null;
        console.log('Form submitted:', this.pinForm.value);
        this.pinCodeService.setPinCode(this.pinForm.value.pin).subscribe(
          () => {
            console.log('pin code OK');
            this.stageCompleted.emit();
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
    } else {
      this.checkFormValidity();
    }
  }
}
