import {
  Component,
  ChangeDetectorRef,
  EventEmitter,
  Output,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  maritalStatusList,
  SimpleSelectValues,
  SimpleSelectValuesId,
  provinceList,
} from 'src/app/utils/onboarding-lists';
import { OnboardingService } from 'src/app/services/onboarding.service';
import { SnackBarMessage } from '../../common/snackbar/snackbar';
@Component({
  selector: 'app-address-peya',
  templateUrl: './address-peya.component.html',
  styleUrls: ['./address-peya.component.scss'],
})
export class AddressPeYaComponent {
  @Output() stepCompleted = new EventEmitter<void>();
  currentStep: number = 4;
  addressForm: FormGroup;
  maritalStatusList: SimpleSelectValues[] = maritalStatusList;
  provinceList: SimpleSelectValuesId[] = provinceList;
  isProcessing = false; // Tracks the processing state
  metamapAddress: boolean = true;
  userName: string = 'María Rodriguez'; //TODO: get this value from db

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
      zipCode: [''],
    });
    this.addressForm.valueChanges.subscribe(() => {
      this.updateFormValidity();
      //this.checkValidity();
    });
  }

  onCheckboxChange(event: any): void {
    if (event.checked) {
      // When the checkbox is checked, show the form and enable the button
      this.metamapAddress = true;
    }
    this.updateFormValidity();
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
  onShowForm(): void {
    // Show the additional form when the button is clicked
    this.metamapAddress = false;
    this.updateFormValidity();
  }

  onSubmit() {
    this.isProcessing = true;
    console.log('Form submitted', this.addressForm.value);
    //transformation to send to onboarding Patch endpoint
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
