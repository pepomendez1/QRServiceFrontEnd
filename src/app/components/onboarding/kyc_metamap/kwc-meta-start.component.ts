import { Component, EventEmitter, Output } from '@angular/core';
import { OnboardingService } from 'src/app/services/onboarding.service';

@Component({
  selector: 'app-kwc-meta-start',
  templateUrl: './kwc-meta-start.component.html',
  styleUrls: ['./kwc-meta-start.component.scss'],
})
export class MetamapOnboarding {
  ownerId: string | null = null;
  metadata: string | null = null;
  isProcessing = false; // Tracks the processing state
  @Output() stepCompleted = new EventEmitter<void>();

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

  onVerificationFinished() {
    this.isProcessing = true;
    const intervalId = setInterval(() => {
      console.log('polling status...');
      this.onboardingService.getOnboardingStatus().subscribe({
        next: (response: any) => {
          const status = response.status; // Adjust according to your API response format
          console.log('status: ', status);
          if (status === 'address_pending') {
            clearInterval(intervalId); // Stop the interval
            this.stepCompleted.emit(); // Call stepCompleted method
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
