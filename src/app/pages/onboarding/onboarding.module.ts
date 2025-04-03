import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OnboardingComponent } from './onboarding.component';
import { OnboardingRoutingModule } from './onboarding-routing.module';

// common modules
import { MaterialModule } from '@fe-treasury/shared/material-components.module';
import { ReactiveFormsModule } from '@angular/forms';
import { LineStepperModule } from '@fe-treasury/shared/lines-stepper/line-stepper.module';
import { OnHoldScreenModule } from '@fe-treasury/shared/on-hold-screen/on-hold-screen.module';
import { CustomHeaderOnbModule } from '@fe-treasury/shared/custom-header-onb/custom-header-onb.module';
import { OnbFooterComponent } from '@fe-treasury/shared/onb-footer/onb-footer.component';
import { HelpSectionComponent } from 'src/app/components/help-section/help-section.component';
// Onboarding Components
import { KycValidationComponent } from './kyc-validation/kyc-validation.component';
import { VerificationDirective } from './kyc-validation/verification.directive';
import { AddressFormComponent } from './address-form/address-form.component';
import { AffidavitTermsComponent } from './affidavit-terms/affidavit-terms.component';
import { EndOnboardingSuccessComponent } from './end-onb-success/end-onb-succes.component';
@NgModule({
  declarations: [
    OnboardingComponent,
    KycValidationComponent,
    VerificationDirective,
    AddressFormComponent,
    AffidavitTermsComponent,
    EndOnboardingSuccessComponent,
  ],
  imports: [
    CommonModule,
    OnbFooterComponent,
    HelpSectionComponent,
    CustomHeaderOnbModule,
    OnboardingRoutingModule,
    MaterialModule,
    ReactiveFormsModule,
    OnHoldScreenModule,
    LineStepperModule,
  ],
  providers: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [OnboardingComponent],
})
export class OnboardingModule {}
