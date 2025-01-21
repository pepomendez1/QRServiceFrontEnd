import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { WaitingResultsScreenComponent } from './waiting-results/waiting.results.component';
import { MatButtonModule } from '@angular/material/button';
import { BiometricValidationDirective } from './verification.directive';
import { BiometricValidationComponent } from './biometric-validation.component';
import { CustomHeaderOnbModule } from '../custom-header-onb/custom-header-onb.module';
@NgModule({
  declarations: [
    BiometricValidationComponent,
    WaitingResultsScreenComponent,
    BiometricValidationDirective,
  ],
  imports: [
    CommonModule,
    CustomHeaderOnbModule,
    MatButtonModule,
    MatProgressBarModule,
    MatIconModule,
  ],
  exports: [BiometricValidationComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class BiometricValidationModule {}
