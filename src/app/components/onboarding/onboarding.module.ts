import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { AuthAfipComponent } from './auth-afip/auth-afip.component';
import { MetamapOnboarding } from './kyc_metamap/kwc-meta-start.component';
import { AddressDataFormComponent } from './address-data/address-data.component';
import { AffidavitComponent } from './affidavit/affidavit.component';
import { TermsAndCondComponent } from './terms-cond/terms-cond.component';
import { TermsDialogComponent } from 'src/app/utils/terms-dialog';
import { OnboardingComponent } from './onboarding.component';
import { VerificationDirective } from './kyc_metamap/verification.directive';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
//import { OnboardingPeYaModule } from '../onboarding-peya/onboarding-peya.module';
@NgModule({
  declarations: [
    OnboardingComponent,
    AuthAfipComponent,
    MetamapOnboarding,
    AddressDataFormComponent,
    AffidavitComponent,
    TermsAndCondComponent,
    VerificationDirective,
  ],
  imports: [
    TermsDialogComponent,
    CommonModule,
    HttpClientModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    MatRadioModule,
    MatCheckboxModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
  ],
  providers: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [OnboardingComponent],
})
export class OnboardingModule {}
