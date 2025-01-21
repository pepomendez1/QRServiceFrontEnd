import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '@fe-treasury/shared/material-components.module';
import { LineStepperModule } from '@fe-treasury/shared/lines-stepper/line-stepper.module';
import { PinCodeComponent } from './pin-code.component';
import { PinCodePeYaComponent } from '../pin-code-peya/pin-code.component';
import { PinCodeReadyComponent } from '../pin-code-peya/pin-code-ready/pin-code-ready.component';

@NgModule({
  declarations: [PinCodeComponent, PinCodePeYaComponent, PinCodeReadyComponent],
  imports: [
    CommonModule,
    LineStepperModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [],
  exports: [PinCodeComponent],
})
export class PinCodeModule {}
