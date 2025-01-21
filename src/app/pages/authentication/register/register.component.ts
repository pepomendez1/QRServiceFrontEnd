import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { SvgLibraryService } from 'src/app/services/svg-library.service';
import { SafeHtml } from '@angular/platform-browser';

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

  constructor(
    private svgLibrary: SvgLibraryService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private breakpointObserver: BreakpointObserver
  ) {}

  ngOnInit(): void {
    this.svgLibrary.getSvg('problem').subscribe((svgContent) => {
      this.problemImg = svgContent; // SafeHtml type to display SVG dynamically
    });
    // Observe breakpoints for responsiveness
    this.logoUrl = this.svgLibrary.getLogo();
    //console.log('logo Url', this.logoUrl);
    this.breakpointObserver
      .observe(['(max-width: 840px)'])
      .subscribe((result) => {
        this.isMobile = result.matches;
      });

    console.log('register -- ');

    const magicLinkParam = 'code';
    let processingLink = false; // Track if processing the link

    // Handle navigation state for SET_PASSWORD
    const navigationState = history.state;
    console.log('navigation state : ', navigationState);
    if (
      navigationState &&
      navigationState.currentStep === RegisterSteps.SET_PASSWORD
    ) {
      console.log('Navigating to SET_PASSWORD step');
      this.currentStep = RegisterSteps.SET_PASSWORD; // Directly set the step
      return; // Skip further processing
    }

    // Handle query parameters for magic link
    this.route.queryParams.subscribe((params) => {
      const hashedData = params[magicLinkParam];
      if (hashedData) {
        console.log('dato: ', hashedData);
        processingLink = true; // Start processing
        if (this.debugMode) {
          console.log('set password --- debug mode');
          this.currentStep = RegisterSteps.START_AUTH; // Welcome slider
          processingLink = false;
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
                processingLink = false;
              },
              error: (error: any) => {
                console.error(
                  'Error en el inicio de sesión - link expirado o utilizado:',
                  error
                );
                this.errorMessage = error;
                this.currentStep = RegisterSteps.EXPIRED_LINK; // Link expired
                processingLink = false;
              },
            });
        }
      }
    });
  }
  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
  goToSetPassword(): void {
    this.currentStep = RegisterSteps.SET_PASSWORD;
  }
  gotToWelcomeSwiper(): void {
    this.currentStep = RegisterSteps.START_AUTH;
  }
}
