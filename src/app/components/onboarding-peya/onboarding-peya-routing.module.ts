import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OnboardingPeYaComponent } from './onboarding-peya.component';
//import { AuthComponentPeYa } from '../auth/register/auth-peya.component';
//import { StartOnbPeyaComponent } from '../auth/start-onb-peya/start-onb-peya.component';
import { KycPeYaComponent } from './kyc-metamap-peya/kyc-metamap-peya.component';
import { AffidavitComponent } from '../onboarding/affidavit/affidavit.component';
import { AffidavitPeYaComponent } from './affidavit-peya/affidavit-peya.component';
import { AddressPeYaComponent } from './address-peya/address-peya.component';
import { TermsCondPeYaComponent } from './terms-cond-peya/terms-cond-peya.component';
import { EndOnbPeyaComponent } from './end-onb-peya/end-onb-peya.component';
import { PinCodePeYaComponent } from '../pin-code-peya/pin-code.component';
import { OnHoldScreenComponent } from '../../../../@fe-treasury/shared/on-hold-screen/on-hold-screen.component';
//import { LoginComponent } from '../auth/login/login.component';
const routes: Routes = [
  {
    path: '',
    component: OnboardingPeYaComponent,
  },
  // children: [
  // { path: 'auth', component: AuthComponentPeYa }, // Default start onboarding page
  // { path: 'login', component: LoginComponent },
  // { path: 'address', component: AddressPeYaComponent },
  // { path: 'kyc-onb', component: KycPeYaComponent },
  // { path: 'affidavit-peya', component: AffidavitPeYaComponent },
  // { path: 'terms-cond', component: TermsCondPeYaComponent },
  // { path: 'end-onb', component: EndOnbPeyaComponent },
  // { path: 'pin-code', component: PinCodePeYaComponent },
  // { path: 'on-hold', component: OnHoldScreenComponent },
  // { path: 'start', component: StartOnbPeyaComponent },
  //  ],
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OnboardingPeYaRoutingModule {}
