const ONBOARDING_STEPS = {
  KYC: 'kyc_kyb_pending',
  ADDRESS: 'address_pending',
  AFFIDAVIT: 'affidavit_terms_pend',
  COMPLETED: 'onboarding_completed',
};

import { Component, OnInit, OnDestroy } from '@angular/core';
import { OnboardingService } from 'src/app/services/onboarding.service';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { SvgLibraryService } from 'src/app/services/svg-library.service';
import { SafeHtml } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.scss'],
})
export class OnboardingComponent implements OnInit {
  logoUrl: SafeHtml | null = null;
  currentStep$: any;
  isLoading$: any;
  onboardingFinished$: any;
  ONBOARDING_STEPS = ONBOARDING_STEPS; // Expose constants to the template
  isMobile: boolean = false;
  breakpointSubscription!: Subscription;

  constructor(
    private svgLibrary: SvgLibraryService,
    public onboardingService: OnboardingService,
    private breakpointObserver: BreakpointObserver
  ) {
    this.currentStep$ = this.onboardingService.currentStep$;
    this.isLoading$ = this.onboardingService.isLoading$;
    this.onboardingFinished$ = this.onboardingService.onboardingFinished$;
  }

  ngOnInit(): void {
    this.logoUrl = this.svgLibrary.getLogo();
    this.breakpointObserver;
    this.breakpointSubscription = this.breakpointObserver
      .observe(['(max-width: 840px)'])
      .subscribe((result: BreakpointState) => {
        this.isMobile = result.matches;
      });
    this.onboardingService.checkOnboardingStatus();
  }

  ngOnDestroy(): void {
    if (this.breakpointSubscription) {
      this.breakpointSubscription.unsubscribe();
    }
  }
}
