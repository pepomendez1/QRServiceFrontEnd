import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AppLayoutModule } from 'src/app/app-layout/app-layout.module';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '@fe-treasury/shared/material-components.module';
import { LineStepperModule } from '@fe-treasury/shared/lines-stepper/line-stepper.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CodeInputModule } from 'angular-code-input';
import { MainRoutingModule } from './main-routing.module';
import { MainComponent } from './main.component';
import { OnboardingModule } from '../onboarding/onboarding.module';
import { TreasuryPendingScreen } from './treasury-pending/treasury-pending.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { OnboardingPeYaModule } from '../onboarding-peya/onboarding-peya.module';
import { PinCodeModule } from '../pin-code/pin-code.module';
//import { OnHoldScreenModule } from '@fe-treasury/shared/on-hold-screen/on-hold-screen.module';
import { InvestmentModule } from '../investment/investment.module';
// Colores para los avatares
const avatarColors = [
  '#64A3C7',
  '#A71FAA',
  '#3D7B9E',
  '#BF5C5C',
  '#F4BE80',
  '#A5A8AA',
];

const COMPONENTS = [MainComponent, TreasuryPendingScreen];

@NgModule({
  imports: [
    PinCodeModule,
    CommonModule,
    RouterModule,
    MainRoutingModule,
    MaterialModule,
    AppLayoutModule,
    OnboardingModule,
    // OnHoldScreenModule,
    LineStepperModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    FormsModule,
    CodeInputModule,
    OnboardingPeYaModule,
    InvestmentModule,
    // AvatarModule.forRoot({ colors: avatarColors }),  // Descomentado si es necesario
  ],
  declarations: [...COMPONENTS],
})
export class MainModule {}
