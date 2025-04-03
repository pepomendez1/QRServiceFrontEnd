import {
  Component,
  EventEmitter,
  Input,
  ViewChild,
  Output,
  ElementRef,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from '@fe-treasury/shared/messages/messages.service';
import { PinCodeService } from 'src/app/services/pin-code.service';

@Component({
  selector: 'app-reset-pin',
  templateUrl: './reset-pin.component.html',
  styleUrl: './reset-pin.component.scss',
})
export class ResetPinComponent {
  @Output() newPassValid = new EventEmitter<void>();
  @Output() pinResetCompleted = new EventEmitter<void>();
  @Output() pinResetBackArrow = new EventEmitter<void>();
  @Input() isMobile: boolean = false;
  @Input() debugMode: boolean = false;
  pinForm: FormGroup;
  pinConfirm: FormGroup;
  confirmPinForm = false;
  diffPinConfirm: boolean = false;
  setPin: string = '';
  @ViewChild('digit1') firstInput!: ElementRef; // Reference to the first input
  isProcessing: boolean = false;
  incorrectPin: boolean = false;

  constructor(
    private fb: FormBuilder,
    private pinCodeService: PinCodeService,
    private messageService: MessageService
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
    this.pinForm.valueChanges.subscribe(() => {
      this.messageService.clearMessage();
      this.diffPinConfirm = false;
    });
    this.pinConfirm.valueChanges.subscribe(() => {
      this.diffPinConfirm = false;
      this.messageService.clearMessage();
    });
  }

  ngAfterViewInit(): void {
    this.firstInput.nativeElement.focus(); // Focus the first input on component load
  }
  handleBackspace(
    event: KeyboardEvent,
    previousInput: HTMLInputElement | null
  ): void {
    if (
      event.key === 'Backspace' &&
      (event.target as HTMLInputElement).value === ''
    ) {
      if (previousInput) {
        previousInput.focus();
        previousInput.value = ''; // Clear the previous input
      }
    }
  }

  moveToNextField(event: Event, nextField?: HTMLInputElement): void {
    const currentField = event.target as HTMLInputElement | null;

    if (currentField && currentField.value.length >= currentField.maxLength) {
      nextField?.focus();
    }
  }
  returnArrow(): void {
    if (!this.confirmPinForm) {
      this.pinResetBackArrow.emit(); //exit pin code
    } else {
      this.returnPin();
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
  submitPinConfirm(): void {
    if (this.pinConfirm.valid) {
      this.isProcessing = true;
      const pinConfirmed = Object.values(this.pinConfirm.value).join('');
      console.log('Form submitted:', pinConfirmed);
      if (pinConfirmed !== this.setPin) {
        this.isProcessing = false;
        this.diffPinConfirm = true;
        console.log('pins no coinciden');
      }
      //this.pinEntered = true;
      else {
        if (this.debugMode) this.pinResetCompleted.emit(); //exit pin code
        else {
          this.pinCodeService.resetPinCodeOTP(Number(pinConfirmed)).subscribe(
            () => {
              console.log('pin code reset OK');
              this.pinResetCompleted.emit(); //exit pin code
              this.isProcessing = false;
            },
            (error: any) => {
              console.error('Failed to update step:', error);
              this.messageService.showMessage(
                'Error al Actualizar PIN ' + error,
                'error'
              );
              this.isProcessing = false;
            }
          );
        }
      }
    }
  }
}
