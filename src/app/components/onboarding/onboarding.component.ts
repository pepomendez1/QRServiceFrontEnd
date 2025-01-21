import { Component, EventEmitter, Output } from '@angular/core';
import { ONBOARDING_STEPS } from 'src/app/consts/onboarding-steps';
import { USER_STATUS } from 'src/app/consts/user-status';
import { UserService } from 'src/app/services/user.service';
import { OnboardingService } from 'src/app/services/onboarding.service';
import { SnackBarMessage } from '../common/snackbar/snackbar';

@Component({
  selector: 'app-onboarding-wrapper',
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.scss'],
})
export class OnboardingComponent {
  @Output() stageCompleted = new EventEmitter<void>();
  isLoading: boolean = true;
  errorMessage: string | null = null;
  isProcessing = false; // Tracks the processing state
  constructor(
    private onboardingService: OnboardingService,
    private snackBarMessage: SnackBarMessage,
    private userService: UserService
  ) {}

  ONBOARDING_STEPS = ONBOARDING_STEPS; // Make the constants accessible in the template
  currentStep: string = ONBOARDING_STEPS.START;

  ngOnInit(): void {
    this.goToStep();
  }

  startOnboarding(): void {
    this.currentStep = ONBOARDING_STEPS.KYC_CONTINUE; // return the getOnboardingStatus
  }

  goToStep(): void {
    //this.currentStep = ONBOARDING_STEPS.START; // return the getOnboardingStatus
    this.onboardingService.getOnboardingStatus().subscribe({
      next: (response) => {
        console.log('onboarding status ', response);
        if (response.status == ONBOARDING_STEPS.COMPLETED) {
          this.isProcessing = true;
          const intervalId = setInterval(() => {
            console.log('polling user status...');
            this.userService.getUserStatus().subscribe({
              next: (response: any) => {
                const status = response; // Adjust according to your API response format
                console.log('status: ', status);
                if (status === USER_STATUS.PIN) {
                  clearInterval(intervalId); // Stop the interval
                  this.isProcessing = false;
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
        this.currentStep = response.status; // return the getOnboardingStatus
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.error.message;
        this.isLoading = false;
        console.error('Error:', error);
        this.snackBarMessage.showSnackbar(
          'Error fetching onboarding status',
          'error'
        );
      },
    });
  }

  finishOnb(): void {
    this.stageCompleted.emit(); // Call stepCompleted method
  }
}
