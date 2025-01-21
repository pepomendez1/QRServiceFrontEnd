import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '@fe-treasury/shared/material-components.module';
import { AuthComponent } from './auth.component';
import { SwiperSlideComponent } from './slides/swiper-slide.component';
import { AuthComponentPeYa } from './register/auth-peya.component';
import { LoginComponent } from './login/login.component';
import { StartOnbPeyaComponent } from './start-onb-peya/start-onb-peya.component';
import { QRCodeModule } from 'angularx-qrcode';
import { AuthRoutingModule } from './auth-routing.module';
import { AuthWrapperComponent } from './auth-wrapper/auth-wrapper.component';
import { LineStepperModule } from '@fe-treasury/shared/lines-stepper/line-stepper.module';
import { PasswordRecoveryModule } from './password-recovery/password-recovery.module';
@NgModule({
  declarations: [
    AuthComponent,
    AuthComponentPeYa,
    LoginComponent,
    StartOnbPeyaComponent,
    SwiperSlideComponent,
    AuthWrapperComponent,
  ],
  imports: [
    CommonModule,
    QRCodeModule,
    FormsModule,
    PasswordRecoveryModule,
    AuthRoutingModule,
    ReactiveFormsModule,
    LineStepperModule,
    MaterialModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [AuthComponent],
})
export class AuthModule {}
