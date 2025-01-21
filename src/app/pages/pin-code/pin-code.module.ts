import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '@fe-treasury/shared/material-components.module';
import { LineStepperModule } from '@fe-treasury/shared/lines-stepper/line-stepper.module';
import { PinCodeRoutingModule } from './pin-code-routing.module';
import { PinCodeComponent } from './pin-code.component';
import { CustomHeaderOnbModule } from '@fe-treasury/shared/custom-header-onb/custom-header-onb.module';
import { OnbFooterComponent } from '@fe-treasury/shared/onb-footer/onb-footer.component';
@NgModule({
  declarations: [PinCodeComponent],
  imports: [
    OnbFooterComponent,
    CommonModule,
    PinCodeRoutingModule,
    CustomHeaderOnbModule,
    MaterialModule,
    LineStepperModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [],
  exports: [PinCodeComponent],
})
export class PinCodeModule {}
