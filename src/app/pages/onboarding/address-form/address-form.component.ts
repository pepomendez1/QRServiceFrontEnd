import {
  Component,
  ChangeDetectorRef,
  EventEmitter,
  Output,
  Input,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  maritalStatusList,
  SimpleSelectValues,
  SimpleSelectValuesId,
  provinceList,
} from 'src/app/utils/onboarding-lists';
import { OnboardingService } from 'src/app/services/onboarding.service';
import { SnackBarMessage } from 'src/app/components/common/snackbar/snackbar';
@Component({
  selector: 'app-address-form',
  templateUrl: './address-form.component.html',
  styleUrls: ['./address-form.component.scss'],
})
export class AddressFormComponent {
  @Output() stepCompleted = new EventEmitter<void>();
  @Input() isMobile: boolean = false;
  currentStep: number = 4;
  addressForm: FormGroup;
  touchedFields: { [key: string]: boolean } = {};
  maritalStatusList: SimpleSelectValues[] = maritalStatusList;
  provinceList: SimpleSelectValuesId[] = provinceList;
  isProcessing = false; // Tracks the processing state
  metamapAddress: boolean = true;
  errorMessage: string = '';
  isPhoneNumberFocused: boolean = true;
  maritalStatusFocus: boolean = true;
  errorMessages: { [key: string]: string } = {
    required: 'Este campo es obligatorio.',
    pattern: 'Debe contener solo números.',
    minlength: 'Debe tener al menos 10 caracteres.',
    maxlength: 'No debe superar los 15 caracteres.',
  };

  constructor(
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private onboardingService: OnboardingService,
    private snackBarMessage: SnackBarMessage
  ) {
    this.addressForm = fb.group({
      maritalStatus: ['', Validators.required],
      useMetamapAddress: [true], // checkbox initial value
      street: [''],
      streetNumber: [''],
      flatNumber: [''],
      state: [''],
      city: [''],
      zipCode: [''],
      //countryCode: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      // countryCode: ['54', Validators.pattern('^[0-9]+$')], // por ahora fixed
      // areaCode: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      phoneNumber: [
        '',
        [
          Validators.required,
          Validators.pattern('^[0-9]+$'),
          Validators.minLength(10),
        ],
      ],
    });
    this.addressForm.valueChanges.subscribe(() => {
      this.updateFormValidity();
      this.updateErrorMessage();
      //this.checkValidity();
    });
  }
  onPhoneNumberFocus(): void {
    this.isPhoneNumberFocused = true;
  }

  onPhoneNumberBlur(): void {
    this.isPhoneNumberFocused = false; // Reset focus state
  }

  onMaritalStatusFocus(): void {
    this.maritalStatusFocus = true;
  }

  onMaritalStatusBlur(): void {
    this.maritalStatusFocus = false; // Reset focus state
  }

  onFocus(controlName: string): void {
    this.touchedFields[controlName] = true;
  }
  onCheckboxChange(event: any): void {
    if (event.checked) {
      // When the checkbox is checked, show the form and enable the button
      this.metamapAddress = true;
    }
    this.updateFormValidity();
  }
  getErrorMessages(errors: any): string[] {
    return Object.keys(errors).map((errorKey) => this.errorMessages[errorKey]);
  }
  ngOnInit(): void {
    // Initialize form validity on component load
    this.updateFormValidity();
    this.cdr.detectChanges(); // Trigger change detection manually
  }

  ngAfterViewInit(): void {
    // Safe to update the form or validators here
    this.updateFormValidity();
  }

  updateFormValidity(): void {
    /*
     update form validation requirements,
     when metamapAddress is set to true,
     validators for address form will be cleared
     */
    this.toggleFieldValidators('street');
    this.toggleFieldValidators('streetNumber');
    this.toggleFieldValidators('state');
    this.toggleFieldValidators('city');
    this.toggleFieldValidators('zipCode');
  }
  toggleFieldValidators(controlName: string): void {
    if (this.addressForm.get('useMetamapAddress')?.value) {
      this.addressForm.controls[controlName]?.clearValidators();
    } else {
      this.addressForm.get(controlName)?.setValidators([Validators.required]);
    }
    this.addressForm
      .get(controlName)
      ?.updateValueAndValidity({ emitEvent: false });
  }

  updateErrorMessage(): void {
    const addressFields = [
      'street',
      'streetNumber',
      'state',
      'city',
      'zipCode',
    ];

    const invalidFields = addressFields.filter(
      (key) =>
        this.touchedFields[key] && // Only consider touched fields
        this.addressForm.get(key)?.hasError('required')
    );

    if (invalidFields.length > 0) {
      this.errorMessage = 'Los campos indicados son requeridos';
    } else {
      this.errorMessage = ''; // Clear the error message if no fields are invalid
    }
  }
  onShowForm(): void {
    // Show the additional form when the button is clicked
    this.metamapAddress = false;
    this.updateFormValidity();
  }

  onSubmit() {
    this.isProcessing = true;
    console.log('Form submitted', this.addressForm.value);
    if (this.addressForm.valid) {
      this.onboardingService
        .addressOnboarding(this.addressForm.value)
        .subscribe(
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
