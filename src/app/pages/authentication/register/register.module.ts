import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RegisterComponent } from './register.component';
import { WelcomeSliderComponent } from './welcome-slider/welcome-slider.component';
import { MaterialModule } from '@fe-treasury/shared/material-components.module';
import { RegisterRoutingModule } from './register-routing.module';
import { LineStepperModule } from '@fe-treasury/shared/lines-stepper/line-stepper.module';
import { NewPasswordComponent } from './new-password/new-password.component';
//import { SwiperSlideComponent } from './welcome-slider/slides/swiper-slide.component';
import { CustomHeaderOnbModule } from '@fe-treasury/shared/custom-header-onb/custom-header-onb.module';
import { OnbFooterComponent } from '@fe-treasury/shared/onb-footer/onb-footer.component';

@NgModule({
  declarations: [
    RegisterComponent,
    NewPasswordComponent,
    WelcomeSliderComponent,
  ],
  imports: [
    OnbFooterComponent,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    LineStepperModule,
    CustomHeaderOnbModule,
    RegisterRoutingModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [RegisterComponent],
})
export class RegisterModule {}
