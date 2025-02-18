import { Component, EventEmitter, Output, Input } from '@angular/core';
import { ThemeService } from 'src/app/services/layout/theme-service';
import { OnboardingService } from 'src/app/services/onboarding.service';
import { StoreDataService } from 'src/app/services/store-data.service';
@Component({
  selector: 'app-kyc-validation',
  templateUrl: './kyc-validation.component.html',
  styleUrls: ['./kyc-validation.component.scss'],
})
export class KycValidationComponent {
  ownerId: string | null = null;
  public primaryColor: string = '#507CDD'; // Default color or get from the theme
  metadata: string | null = null;
  currentStep: number = 3;
  theme: string | null = null;
  public flowId: string = '';
  isDarkMode: boolean = false;
  @Input() isMobile: boolean = false;
  isProcessing = false; // Tracks the processing state
  @Output() stepCompleted = new EventEmitter<string>();

  constructor(
    private themeService: ThemeService,
    private storeDataService: StoreDataService,
    private onboardingService: OnboardingService
  ) {}

  ngOnInit() {
    this.theme = this.themeService.getCurrentTheme();
    this.isDarkMode = this.theme === 'app-dark';
    console.log('is dark mode ', this.isDarkMode);
    this.storeDataService.getStore().subscribe((data) => {
      if (data.init_config) {
        this.primaryColor = data.init_config.primary_color || '#507CDD';
        this.flowId =
          data.init_config.metamap_flow_id || '6692be9aa8d43a001cdc9a74';
      }
    });
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
  onVerificationFinishe() {
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
