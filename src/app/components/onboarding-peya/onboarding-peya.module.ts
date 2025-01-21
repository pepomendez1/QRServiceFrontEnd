import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { OnboardingPeYaComponent } from './onboarding-peya.component';
import { OnboardingPeYaRoutingModule } from './onboarding-peya-routing.module';
//import { AuthComponentPeYa } from '../auth/auth-peya/auth-peya.component';
import { KycPeYaComponent } from './kyc-metamap-peya/kyc-metamap-peya.component';
import { LineStepperModule } from '@fe-treasury/shared/lines-stepper/line-stepper.module';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { AddressPeYaComponent } from './address-peya/address-peya.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AffidavitPeYaComponent } from './affidavit-peya/affidavit-peya.component';
import { TermsCondPeYaComponent } from './terms-cond-peya/terms-cond-peya.component';
import { MatRadioButton } from '@angular/material/radio';
import { VerificationDirectivePeya } from './kyc-metamap-peya/verification.directive';
import { EndOnbPeyaComponent } from './end-onb-peya/end-onb-peya.component';
import { OnHoldScreenModule } from '@fe-treasury/shared/on-hold-screen/on-hold-screen.module';
//import { PinCodePeYaComponent } from '../pin-code-peya/pin-code.component';
//import { PinCodeReadyComponent } from '../pin-code-peya/pin-code-ready/pin-code-ready.component';
//import { OnHoldScreenComponent } from '../../../../@fe-treasury/shared/on-hold-screen/on-hold-screen.component';
//import { LoginComponent } from '../auth/login/login.component';
@NgModule({
  declarations: [
    OnboardingPeYaComponent,
    //AuthComponentPeYa,
    KycPeYaComponent,
    AddressPeYaComponent,
    AffidavitPeYaComponent,
    TermsCondPeYaComponent,
    EndOnbPeyaComponent,
    VerificationDirectivePeya,
    //PinCodePeYaComponent,
    //PinCodeReadyComponent,
    //OnHoldScreenComponent,
    //LoginComponent,
  ],
  imports: [
    CommonModule,
    MatIconModule,
    OnboardingPeYaRoutingModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatRadioModule,
    MatRadioButton,
    OnHoldScreenModule,
    LineStepperModule,
    MatCheckboxModule,
  ],
  providers: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [OnboardingPeYaComponent],
})
export class OnboardingPeYaModule {}
