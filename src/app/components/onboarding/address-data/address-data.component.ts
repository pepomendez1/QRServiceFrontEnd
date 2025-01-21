import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OnboardingService } from 'src/app/services/onboarding.service';
import {
  maritalStatusList,
  SimpleSelectValues,
  SimpleSelectValuesId,
  provinceList,
} from 'src/app/utils/onboarding-lists';
import { SnackBarMessage } from '../../common/snackbar/snackbar';

@Component({
  selector: 'app-address-data',
  templateUrl: './address-data.component.html',
  styleUrls: ['./address-data.component.scss'],
})
export class AddressDataFormComponent {
  @Output() stepCompleted = new EventEmitter<void>();
  isLoading: boolean = true;
  addressForm: FormGroup;
  warningMessage: string | null = null;
  errorMessage: string | null = null;
  onboardingType: string | null = null;
  titleText: string | null = null;
  maritalStatusList: SimpleSelectValues[] = maritalStatusList;
  provinceList: SimpleSelectValuesId[] = provinceList;
  isProcessing = false; // Tracks the processing state

  constructor(
    private fb: FormBuilder,
    private onboardingService: OnboardingService,
    private snackBarMessage: SnackBarMessage
  ) {
    this.addressForm = fb.group({
      street: ['', Validators.required],
      city: ['', Validators.required],
      streetNumber: ['', Validators.pattern(/^\d+$/)], //number
      flatNumber: [''],
      state: ['', Validators.required],
      zipCode: ['', Validators.pattern(/^\d+$/)], //number
      maritalStatus: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.fetchOnboardingStatus();
  }

  fetchOnboardingStatus(): void {
    this.onboardingService.getOnboardingStatus().subscribe({
      next: (response) => {
        console.log('onboarding status ', response);
        this.onboardingType = response.tipo_persona; // return the getOnboardingStatus
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.error.message;
        this.isLoading = false;
        console.error('Error:', error);
      },
    });
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
