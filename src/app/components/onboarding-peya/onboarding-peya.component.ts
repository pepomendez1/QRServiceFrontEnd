import {
  Component,
  EventEmitter,
  Output,
  ChangeDetectorRef,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ONBOARDING_STEPS } from 'src/app/consts/onboarding-steps';
import { OnboardingService } from 'src/app/services/onboarding.service';
import { SnackBarMessage } from '../common/snackbar/snackbar';
import { UserService } from 'src/app/services/user.service';
import { USER_STATUS } from 'src/app/consts/user-status';
@Component({
  selector: 'app-onboarding-wrapper-peya',
  templateUrl: './onboarding-peya.component.html',
  styleUrls: ['./onboarding-peya.component.scss'],
})
export class OnboardingPeYaComponent {
  @Output() stageCompleted = new EventEmitter<void>();
  isLoading: boolean = true;
  isOnboardingRoute: boolean = true;
  errorMessage: string | null = null;
  isProcessing = false; // Tracks the processing state
  onboardingFinished: boolean = false;
  onHoldStatus: boolean = false;

  constructor(
    private onboardingService: OnboardingService,
    private snackBarMessage: SnackBarMessage,
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}
  ONBOARDING_STEPS = ONBOARDING_STEPS; // Make the constants accessible in the template
  currentStep: string = ONBOARDING_STEPS.START;
  metamapStatus: string = '';
  onboardingType: string = '';

  ngOnInit(): void {
    this.goToStep();
  }

  startOnboarding(): void {
    this.currentStep = ONBOARDING_STEPS.KYC_CONTINUE; // return the getOnboardingStatus
  }
  handleMetamap(status: string) {
    if (status == 'metamap_completed') {
      console.log('handle metamap: ', status);
      this.currentStep = 'address_pending';
    }
  }
  goToStep(): void {
    // this.currentStep = ONBOARDING_STEPS.ADDRESS; // return the getOnboardingStatus
    // console.log(this.currentStep, this.onboardingFinished);
    console.log('onboardingFinished', this.onboardingFinished);
    this.isLoading = true;
    this.onboardingService.getOnboardingStatus().subscribe({
      next: (response) => {
        console.log('onboarding status ', response);

        const onboardingStatus = response.status;
        const metamapStatus = response.metamap_status;

        if (onboardingStatus === ONBOARDING_STEPS.COMPLETED) {
          if (metamapStatus === 'Completed') {
            this.onboardingFinished = true;
          } else {
            this.onboardingFinished = false;
            this.stageCompleted.emit(); //exit onboarding
          }
        }

        this.currentStep = response.status; // return the getOnboardingStatus
        this.isLoading = false;
        this.cdr.detectChanges();
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
  // this.router.events.subscribe(() => {
  //   this.isOnboardingRoute = this.router.url === '/onboarding-peya';
  // });
  // }
}

// if (onboardingStatus == ONBOARDING_STEPS.COMPLETED) {
//   if (this.metamapStatus === 'Completed') {
//     this.isProcessing = true;
//     const intervalId = setInterval(() => {
//       console.log('polling user status...');
//       this.userService.getUserStatus().subscribe({
//         next: (response: any) => {
//           const status = response;
//           console.log('status: ', status);
//           if (status === USER_STATUS.PIN) {
//             clearInterval(intervalId); // Stop the interval
//             this.isProcessing = false;
//           }
//         },
//         error: (error: any) => {
//           console.error('Error obteniendo el estado:', error);
//           this.isProcessing = false;
//           clearInterval(intervalId);
//         },
//       });
//     }, 2000); // Poll every 2 seconds
//   } else if (this.metamapStatus != 'Completed') {
//     this.onHoldStatus = true;
//   }
// }
