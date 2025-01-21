import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OnboardingComponent } from './onboarding.component';
import { KycValidationComponent } from './kyc-validation/kyc-validation.component';
import { AddressFormComponent } from './address-form/address-form.component';
import { AffidavitTermsComponent } from './affidavit-terms/affidavit-terms.component';
import { EndOnboardingSuccessComponent } from './end-onb-success/end-onb-succes.component';

const routes: Routes = [
  {
    path: '',
    component: OnboardingComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OnboardingRoutingModule {}
