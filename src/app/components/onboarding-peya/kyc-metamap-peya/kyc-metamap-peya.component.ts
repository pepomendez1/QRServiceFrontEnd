import { Component, EventEmitter, Output } from '@angular/core';
import { OnboardingService } from 'src/app/services/onboarding.service';

@Component({
  selector: 'app-kyc-peya',
  templateUrl: './kyc-metamap-peya.component.html',
  styleUrls: ['./kyc-metamap-peya.component.scss'],
})
export class KycPeYaComponent {
  ownerId: string | null = null;
  metadata: string | null = null;
  currentStep: number = 3;
  isProcessing = false; // Tracks the processing state
  @Output() stepCompleted = new EventEmitter<string>();

  constructor(private onboardingService: OnboardingService) {}

  ngOnInit() {
    this.onboardingService.getOnboardingStatus().subscribe({
      next: (response) => {
        //console.log('onboarding status ', response);
        this.ownerId = response.owner_id; // return the getOnboardingStatus
        this.metadata = JSON.stringify({
          owner_id: this.ownerId,
          fixedLanguage: 'es',
        });
        console.log('metada: ', this.metadata);
        //this.isLoading = false;
      },
      error: (error) => {
        console.error('Error:', error);
      },
    });
  }
  goToParent() {
    this.stepCompleted.emit('metamap_completed'); // Call stepCompleted method
  }
  onVerificationFinishedPeya() {
    // onboarding_status = address_pending
    this.isProcessing = true;
    const intervalId = setInterval(() => {
      console.log('polling status...');
      this.onboardingService.getOnboardingStatus().subscribe({
        next: (response: any) => {
          const metamap_status = response.metamap_status; // Adjust according to your API response format
          console.log('status: ', metamap_status);
          if (metamap_status === 'InProgress') {
            // address_pending
            clearInterval(intervalId); // Stop the interval
            this.stepCompleted.emit('metamap_completed'); // Call stepCompleted method
          }
        },
        error: (error: any) => {
          console.error('Error obteniendo el estado:', error);
          this.isProcessing = false;
          clearInterval(intervalId);
        },
      });
    }, 2000); // Poll every 2 seconds
  }
}
