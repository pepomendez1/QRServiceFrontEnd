import {
  Component,
  EventEmitter,
  Output,
  OnInit,
  Input,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PinCodeService } from 'src/app/services/pin-code.service';
import { SvgLibraryService } from 'src/app/services/svg-library.service';
import { SnackbarService } from '@fe-treasury/shared/snack-bar/snackbar.service';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MessageService } from '@fe-treasury/shared/messages/messages.service';
import { SafeHtml } from '@angular/platform-browser';
@Component({
  selector: 'app-pin-code',
  templateUrl: './pin-code.component.html',
  styleUrl: './pin-code.component.scss',
})
export class PinCodeComponent {
  @Input() debugMode: boolean = false;
  @Output() pinCompleted = new EventEmitter<void>();
  @Output() pinResetCompleted = new EventEmitter<void>();
  @Output() pinResetBackArrow = new EventEmitter<void>();
  @ViewChild('digit1') firstInput!: ElementRef; // Reference to the first input of both forms

  logoUrl: SafeHtml | null = null;
  pinForm: FormGroup;
  pinConfirm: FormGroup;
  isMobile: boolean = false;
  currentStep: number = 2;
  errorMessage: string | null = null;
  warningMessage: string | null = null;
  isProcessing = false; // Tracks the processing state
  confirmPinForm = false;
  diffPinConfirm: boolean = false;
  setPin: string = '';
  confirmPin: string = '';
  private formChanged = false; // Tracks if the form has switched
  constructor(
    private svgLibrary: SvgLibraryService,
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private snackbarService: SnackbarService,
    private pinCodeService: PinCodeService,
    private messageService: MessageService,
    private breakpointObserver: BreakpointObserver
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

  ngOnInit(): void {
    this.logoUrl = this.svgLibrary.getLogo();
    this.breakpointObserver
      .observe(['(max-width: 840px)'])
      .subscribe((result) => {
        this.isMobile = result.matches;
      });
  }
  ngAfterViewInit(): void {
    // Ensure focus works on initial load
    setTimeout(() => {
      this.focusOnFirstInput();
    }, 0);
  }

  ngAfterViewChecked(): void {
    // Focus the first input when forms switch
    if (this.formChanged) {
      this.formChanged = false; // Reset the flag
      this.focusOnFirstInput();
    }
  }

  focusOnFirstInput(): void {
    if (this.firstInput) {
      this.firstInput.nativeElement.focus();
    }
  }

  allowOnlyNumbers(event: KeyboardEvent): void {
    const charCode = event.key.charCodeAt(0);

    // Allow only numeric characters (0-9)
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
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

  checkFormValidity(): void {
    const pin = Object.values(this.pinForm.value).join('');
    if (pin && pin.length !== 6) {
      this.messageService.showMessage(
        'El PIN debe tener 6 dígitos ',
        'warning'
      );
    } else if (pin && !/^\d+$/.test(pin)) {
      this.messageService.showMessage('El PIN debe ser numérico ', 'warning');
    } else {
      this.warningMessage = null;
    }
  }

  arrowBack(): void {
    if (this.confirmPinForm) {
      this.diffPinConfirm = false;
      this.confirmPinForm = false; // Switch back to pinForm
      this.formChanged = true; // Mark that the form has switched
    } else {
      this.authService.restartPasswordCompleted();
    }
  }
  submitPin() {
    if (this.pinForm.valid) {
      console.log('set pin');
      this.isProcessing = true;
      const pin = Object.values(this.pinForm.value).join('');
      this.setPin = pin;
      this.confirmPinForm = true; // Switch to confirm form
      this.formChanged = true; // Mark that the form has switched
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
      } else {
        this.pinCodeService.setPinCode(Number(pinConfirmed)).subscribe(
          () => {
            console.log('pin code OK');
            this.router.navigate(['/onboarding']);
          },
          (error: any) => {
            console.error('Failed to update step:', error);
            this.snackbarService.openError('Error al generar PIN', true);
            this.isProcessing = false;
          }
        );
      }
    } else {
      this.checkFormValidity();
    }
  }
}
