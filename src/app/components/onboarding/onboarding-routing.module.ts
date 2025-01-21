import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthAfipComponent } from './auth-afip/auth-afip.component';
import { MetamapOnboarding } from './kyc_metamap/kwc-meta-start.component';
import { AddressDataFormComponent } from './address-data/address-data.component';
import { AffidavitComponent } from './affidavit/affidavit.component';
import { TermsAndCondComponent } from './terms-cond/terms-cond.component';
import { OnboardingComponent } from './onboarding.component';

const routes: Routes = [
  {
    path: 'onboarding',
    component: OnboardingComponent,
  },
  {
    path: 'auth-afip',
    component: AuthAfipComponent,
  },
  {
    path: 'kwc-meta-start',
    component: MetamapOnboarding,
  },
  {
    path: 'address-data',
    component: AddressDataFormComponent,
  },
  {
    path: 'affidavit',
    component: AffidavitComponent,
  },
  {
    path: 'terms-cond',
    component: TermsAndCondComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class OnboardingRoutingModule {}
