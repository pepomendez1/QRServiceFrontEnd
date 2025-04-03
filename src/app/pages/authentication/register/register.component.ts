import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { SvgLibraryService } from 'src/app/services/svg-library.service';
import { SafeHtml } from '@angular/platform-browser';
import { SessionManagementService } from 'src/app/services/session.service';

export enum RegisterSteps {
  START_AUTH = 'startAuth',
  EXPIRED_LINK = 'expiredLink',
  SET_PASSWORD = 'setPassword',
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  currentStep: RegisterSteps | null = null;
  logoUrl: SafeHtml | null = null;
  errorMessage: string | null = null;
  debugMode: boolean = false;
  public RegisterSteps = RegisterSteps;
  isMobile: boolean = false;
  problemImg: SafeHtml | null = null;
  isLoading: boolean = true; // Loading flag
  private isMagicLinkProcessed: boolean = false; // Track if magic link is processed

  constructor(
    private svgLibrary: SvgLibraryService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private breakpointObserver: BreakpointObserver,
    private sessionManagementService: SessionManagementService
  ) {}

  ngOnInit(): void {
    this.svgLibrary.getSvg('problem').subscribe((svgContent) => {
      this.problemImg = svgContent; // SafeHtml type to display SVG dynamically
    });

    // Observe breakpoints for responsiveness
    this.logoUrl = this.svgLibrary.getLogo();
    this.breakpointObserver
      .observe(['(max-width: 840px)'])
      .subscribe((result) => {
        this.isMobile = result.matches;
      });

    console.log('register -- ');

    const magicLinkParam = 'code';

    // Handle navigation state for SET_PASSWORD
    const navigationState = history.state;
    console.log('navigation state : ', navigationState);
    if (
      navigationState &&
      navigationState.currentStep === RegisterSteps.SET_PASSWORD
    ) {
      console.log('Navigating to SET_PASSWORD step');
      this.currentStep = RegisterSteps.SET_PASSWORD; // Directly set the step
      this.isLoading = false; // Stop loader
      return; // Skip further processing
    }

    // Handle query parameters for magic link
    this.route.queryParams.subscribe((params) => {
      const hashedData = params[magicLinkParam];
      if (hashedData) {
        console.log('dato: ', hashedData);
        this.isMagicLinkProcessed = true; // Mark magic link as processed
        if (this.debugMode) {
          console.log('set password --- debug mode');
          this.currentStep = RegisterSteps.START_AUTH; // Welcome slider
          this.isLoading = false;
        } else {
          this.authService
            .getTokenFromLink({
              code: hashedData,
            })
            .subscribe({
              next: (response: any) => {
                console.log('token---> ', response);
                console.log('Step: START AUTH-----');
                this.currentStep = RegisterSteps.START_AUTH; // Welcome slider
                this.isLoading = false; // Stop loader

                // Start token expiration monitoring
                this.sessionManagementService.startTokenExpirationMonitoring();
              },
              error: (error: any) => {
                console.error(
                  'Error en el inicio de sesión - link expirado o utilizado:',
                  error
                );
                this.errorMessage = error;
                this.currentStep = RegisterSteps.EXPIRED_LINK; // Link expired
                this.isLoading = false; // Stop loader
              },
            });
        }
      } else if (!this.isMagicLinkProcessed) {
        // Only redirect to login if no magic link was processed
        console.log('No magic link, redirecting to /auth/login');
        this.isLoading = false; // Stop loader
        this.router.navigate(['/auth/login']);
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  goToSetPassword(): void {
    this.isLoading = true; // Start loader
    setTimeout(() => {
      this.currentStep = RegisterSteps.SET_PASSWORD;
      this.isLoading = false; // Stop loader
    }, 1000); // Simulate loading delay
  }

  gotToWelcomeSwiper(): void {
    this.isLoading = true; // Start loader
    setTimeout(() => {
      this.currentStep = RegisterSteps.START_AUTH;
      this.isLoading = false; // Stop loader
    }, 1000); // Simulate loading delay
  }
}
