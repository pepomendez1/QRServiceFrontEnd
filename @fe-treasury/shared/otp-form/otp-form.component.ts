import {
  Component,
  EventEmitter,
  Output,
  OnInit,
  ViewChild,
  Input,
  ElementRef,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-otp-form',
  templateUrl: './otp-form.component.html',
  styleUrl: './otp-form.component.scss',
})
export class OtpFormComponent implements OnInit {
  otpForm!: FormGroup;
  @Input() gap: string = ''; // Default gap
  @Input() squareInputSize: string = ''; // Default size for the OTP inputs (both width and height)
  @Input() timeLeft: number = 0;
  @Input() resetTimer: boolean = false; // Reset pulse to restart the timer
  @Input() clearForm: boolean = false; // Reset form
  @Input() incorrectOTP: boolean = false; // Reset form
  @Output() otpSubmit = new EventEmitter<string>();
  @ViewChild('formElement') formElement!: ElementRef;

  // Event to emit when the form validity changes (to enable or disable the submit button)
  @Output() enableButton = new EventEmitter<boolean>();
  @Output() timeOut = new EventEmitter<boolean>();
  public timeLeftValue: number = 0;
  public counterFinished: boolean = false;
  constructor(private fb: FormBuilder) {}

  private interval: any; // To store the timer interval

  ngOnInit(): void {
    this.timeLeftValue = this.timeLeft; // Set the initial time left value
    this.initOtpForm();
    this.startTimer(); // Start the timer when the component is initialized
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['resetTimer'] && changes['resetTimer'].currentValue) {
      this.restartTimer(); // Restart the timer when reset pulse is triggered
      this.incorrectOTP = false;
    }
    if (changes['clearForm'] && changes['clearForm'].currentValue) {
      this.otpForm.reset();
      this.incorrectOTP = false;
    }
  }
  startTimer(): void {
    console.log('start Timer: ', this.timeLeftValue);
    this.interval = setInterval(() => {
      if (this.timeLeftValue > 0) {
        this.timeLeftValue--;
      } else {
        this.counterFinished = true;
        clearInterval(this.interval);
        this.timeOut.emit(true); // Emit timeOut event when time reaches 0
      }
    }, 1000);
  }

  restartTimer(): void {
    if (this.interval) {
      clearInterval(this.interval); // Clear the previous interval
    }
    this.timeLeftValue = this.timeLeft;
    this.counterFinished = false;
    this.startTimer(); // Start the timer again
  }

  initOtpForm(): void {
    this.otpForm = this.fb.group({
      digit1: ['', [Validators.required, Validators.pattern('[0-9]')]],
      digit2: ['', [Validators.required, Validators.pattern('[0-9]')]],
      digit3: ['', [Validators.required, Validators.pattern('[0-9]')]],
      digit4: ['', [Validators.required, Validators.pattern('[0-9]')]],
      digit5: ['', [Validators.required, Validators.pattern('[0-9]')]],
      digit6: ['', [Validators.required, Validators.pattern('[0-9]')]],
      digit7: ['', [Validators.required, Validators.pattern('[0-9]')]],
      digit8: ['', [Validators.required, Validators.pattern('[0-9]')]],
    });

    // Listen for form changes and emit whether the form is valid or not
    this.otpForm.statusChanges.subscribe((status) => {
      this.incorrectOTP = false;
      if (this.otpForm.valid) {
        this.enableButton.emit(true);
        this.otpSubmit.emit(this.otpForm.value);
      } else {
        this.enableButton.emit(false);
      }
    });
  }
  moveToNextField(event: Event, nextField?: HTMLInputElement): void {
    const currentField = event.target as HTMLInputElement | null;

    if (currentField && currentField.value.length >= currentField.maxLength) {
      nextField?.focus();
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
  handlePaste(event: ClipboardEvent) {
    const clipboardData = event.clipboardData;
    const pastedText = clipboardData?.getData('text');

    if (pastedText && pastedText.length === 8 && /^\d+$/.test(pastedText)) {
      // Prevent the default paste behavior
      event.preventDefault();

      // Set each digit form control with the corresponding character
      this.otpForm.controls['digit1'].setValue(pastedText.charAt(0));
      this.otpForm.controls['digit2'].setValue(pastedText.charAt(1));
      this.otpForm.controls['digit3'].setValue(pastedText.charAt(2));
      this.otpForm.controls['digit4'].setValue(pastedText.charAt(3));
      this.otpForm.controls['digit5'].setValue(pastedText.charAt(4));
      this.otpForm.controls['digit6'].setValue(pastedText.charAt(5));
      this.otpForm.controls['digit7'].setValue(pastedText.charAt(6));
      this.otpForm.controls['digit8'].setValue(pastedText.charAt(7));
    }
  }
  onSubmit(): void {
    if (this.otpForm.valid) {
      const otp = Object.values(this.otpForm.value).join('');
      this.otpSubmit.emit(otp);
    }
  }

  triggerFormSubmission(): void {
    this.onSubmit(); // Calls the onSubmit method which is already bound to the form's submit event
  }
}
