import { Component, EventEmitter, Output, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PinCodeService } from 'src/app/services/pin-code.service';
import { SnackBarMessage } from '../common/snackbar/snackbar';
import { PinCodeReadyComponent } from './pin-code-ready/pin-code-ready.component';

@Component({
  selector: 'app-pin-code-peya',
  templateUrl: './pin-code.component.html',
  styleUrls: ['./pin-code.component.scss'],
})
export class PinCodePeYaComponent implements OnInit {
  @Input() pinCodeMode: string = 'new';
  @Input() debugMode: boolean = false;
  @Output() pinCompleted = new EventEmitter<void>();
  @Output() pinResetCompleted = new EventEmitter<void>();
  pinForm: FormGroup;
  pinConfirm: FormGroup;
  pinEntered = false;
  currentStep: number = 2;
  errorMessage: string | null = null;
  warningMessage: string | null = null;
  isProcessing = false; // Tracks the processing state
  confirmPinForm = false;
  diffPinConfirm: boolean = false;
  setPin: string = '';
  confirmPin: string = '';

  constructor(
    private fb: FormBuilder,
    private snackBarMessage: SnackBarMessage,
    private pinCodeService: PinCodeService
  ) {
    this.pinForm = this.fb.group({
      digit1: ['', [Validators.required, Validators.pattern('[0-9]')]],
      digit2: ['', [Validators.required, Validators.pattern('[0-9]')]],
      digit3: ['', [Validators.required, Validators.pattern('[0-9]')]],
      digit4: ['', [Validators.required, Validators.pattern('[0-9]')]],
      digit5: ['', [Validators.required, Validators.pattern('[0-9]')]],
      digit6: ['', [Validators.required, Validators.pattern('[0-9]')]],
    });
    this.pinConfirm = this.fb.group({
      digit1: ['', [Validators.required, Validators.pattern('[0-9]')]],
      digit2: ['', [Validators.required, Validators.pattern('[0-9]')]],
      digit3: ['', [Validators.required, Validators.pattern('[0-9]')]],
      digit4: ['', [Validators.required, Validators.pattern('[0-9]')]],
      digit5: ['', [Validators.required, Validators.pattern('[0-9]')]],
      digit6: ['', [Validators.required, Validators.pattern('[0-9]')]],
    });
  }

  ngOnInit(): void {
    console.log('pin code mode: ', this.pinCodeMode);
  }

  moveToNextField(event: Event, nextField?: HTMLInputElement): void {
    const currentField = event.target as HTMLInputElement | null;

    if (currentField && currentField.value.length >= currentField.maxLength) {
      nextField?.focus();
    }
  }

  checkFormValidity(): void {
    this.errorMessage = null;
    const pin = Object.values(this.pinForm.value).join('');
    if (pin && pin.length !== 6) {
      this.warningMessage = 'El PIN debe tener 6 dígitos';
    } else if (pin && !/^\d+$/.test(pin)) {
      this.warningMessage = 'El PIN debe ser numérico';
    } else {
      this.warningMessage = null;
    }
  }
  returnPin() {
    this.diffPinConfirm = false;
    this.confirmPinForm = false;
  }
  submitPin() {
    if (this.pinForm.valid) {
      console.log('set pin');
      this.isProcessing = true;
      const pin = Object.values(this.pinForm.value).join('');
      this.setPin = pin;
      this.confirmPinForm = true;
      this.isProcessing = false;
    }
  }

  onSubmit(): void {
    if (this.pinConfirm.valid) {
      this.isProcessing = true;
      const pinConfirmed = Object.values(this.pinConfirm.value).join('');
      console.log('Form submitted:', pinConfirmed);
      if (pinConfirmed !== this.setPin) {
        this.isProcessing = false;
        this.diffPinConfirm = true;
      }
      //this.pinEntered = true;
      else {
        if (this.pinCodeMode === 'new') {
          this.pinCodeService.setPinCode(Number(pinConfirmed)).subscribe(
            () => {
              console.log('pin code OK');
              this.pinCompleted.emit(); //exit pin code
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
        } else if (this.pinCodeMode === 'reset') {
          if (this.debugMode) this.pinResetCompleted.emit(); //exit pin code
          else {
            this.pinCodeService.setPinCode(Number(pinConfirmed)).subscribe(
              () => {
                console.log('pin code reset OK');
                this.pinResetCompleted.emit(); //exit pin code
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
    } else {
      this.checkFormValidity();
    }
  }
}
