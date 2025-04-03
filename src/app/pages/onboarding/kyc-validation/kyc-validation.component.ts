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
          data.init_config.metamap_flow_id || '67b5bdb1792a57001c386496';
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
  onVerificationFinished() {
    // onboarding_status = address_pending
    this.isProcessing = false;
    this.stepCompleted.emit('metamap_completed'); // Call stepCompleted method
    this.onboardingService.checkOnboardingStatus(true); // Pass true to indicate metamap_completed
  }
}
