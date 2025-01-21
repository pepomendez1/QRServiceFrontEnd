import { Component, EventEmitter, Output, Input } from '@angular/core';
import { ThemeService } from 'src/app/services/layout/theme-service';

import { OnboardingService } from 'src/app/services/onboarding.service';
import { StoreDataService } from 'src/app/services/store-data.service';

@Component({
  selector: 'app-biometric-validation',
  templateUrl: './biometric-validation.component.html',
  styleUrl: './biometric-validation.component.scss',
})
export class BiometricValidationComponent {
  ownerId: string | null = null;
  metadata: string | null = null;
  public primaryColor: string = '#0000CC'; // Default color or get from the theme
  isProcessing = false; // Tracks the processing state
  theme: string | null = null;
  isDarkMode: boolean = false;
  @Input() isMobile: boolean = false;
  @Output() verificationCompleted = new EventEmitter<boolean>(); // Emit when verification is finished
  @Output() returnToEmailForm = new EventEmitter<void>(); // Emit when verification is finished
  @Input() debugMode: boolean = false;
  validationOK: boolean = false;
  validationFailed: boolean = false;
  showMetamapButton: boolean = false;
  constructor(
    private themeService: ThemeService,
    private storeDataService: StoreDataService,
    private onboardingService: OnboardingService
  ) {}

  forceOK(): void {
    this.validationOK = true;
    this.validationFailed = false;
  }
  forceFail(): void {
    this.validationOK = false;
    this.validationFailed = true;
  }

  returnToMail(): void {
    this.returnToEmailForm.emit();
  }
  ngOnInit() {
    this.theme = this.themeService.getCurrentTheme();
    this.isDarkMode = this.theme === 'app-dark';
    this.storeDataService.getStore().subscribe((data) => {
      if (data.init_config) {
        this.primaryColor = data.init_config.primary_color || '#0000CC';
      }
    });

    if (this.debugMode) {
      this.metadata = JSON.stringify({
        owner_id: 'test123',
        fixedLanguage: 'es',
      });
    } else {
      this.onboardingService.getOnboardingStatus().subscribe({
        next: (response) => {
          //console.log('onboarding status ', response);
          this.ownerId = response.owner_id; // return the getOnboardingStatus
          this.metadata = JSON.stringify({
            owner_id: this.ownerId,
            fixedLanguage: 'es',
          });
          //this.validateMetamapVerification();
          console.log('metada: ', this.metadata);
          //this.isLoading = false;
        },
        error: (error) => {
          console.error('Error:', error);
        },
      });
    }
  }

  validateMetamapVerification() {
    this.onboardingService.startKycHistoryRegister().subscribe({
      next: (response: any) => {
        if (response.is_sucessful) {
          console.log('verification kyc history started', response);
          this.isProcessing = false;
          this.showMetamapButton = true;
        } else {
          console.error('Error iniciando kyc history', response);
        }
      },
      error: (error: any) => {
        console.error('Error:', error);
      },
    });
  }
  onVerificationFinished() {
    this.isProcessing = true;
    // El usuario tiene ya un onboarding hecho client owner user
    // Polling para esperar a que termine la validación de metamap
    // Login con token para acceder a los endpoints (db)
    // no es onboarding es una validación biométrica aislada voy a esperar el resultado
    // si quiero hago un get onboarding y puedo acceder al onboarding de esta persona
    if (this.debugMode) {
      const intervalId = setInterval(() => {
        console.log('polling status...');
        if (this.validationOK) {
          console.log('Validación OK');
          clearInterval(intervalId); // Stop the interval
          this.isProcessing = false; // Stop processing state
          this.verificationCompleted.emit(true);
        } else if (this.validationFailed) {
          console.error('Error obteniendo el estado');
          clearInterval(intervalId);
          this.isProcessing = false;
          this.verificationCompleted.emit(false);
        }
      }, 2000); // Poll every 2 seconds
    } else {
      const intervalId = setInterval(() => {
        console.log('polling status...');

        this.onboardingService.getKycHistoryRegister().subscribe({
          next: (response: any) => {
            if (response.status === 'Verified') {
              console.log('Termina validación confirma usuario', response);
              clearInterval(intervalId); // Stop the interval
              this.isProcessing = false; // Stop processing state
              this.verificationCompleted.emit(true);
            } else if (response.status === 'Error') {
              console.log('Termina validación usuario no válido', response);
              clearInterval(intervalId); // Stop the interval
              this.isProcessing = false; // Stop processing state
              this.verificationCompleted.emit(false);
            }
          },
          error: (error: any) => {
            console.log('Error validando identidad');
            clearInterval(intervalId);
            this.isProcessing = false;
            this.verificationCompleted.emit(false);
          },
        });
      }, 2000); // Poll every 2 seconds
    }
  }

  onVerificationStarted() {
    console.log('Verification started');
    this.validateMetamapVerification();
    //this.isProcessing = true;
  }
}
