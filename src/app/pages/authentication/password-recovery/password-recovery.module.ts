import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { MaterialModule } from '@fe-treasury/shared/material-components.module';
import { BiometricValidationModule } from '@fe-treasury/shared/biometric-validation/biometric-validation.module';
import { CustomHeaderOnbModule } from '@fe-treasury/shared/custom-header-onb/custom-header-onb.module';
import { MessagesModule } from '@fe-treasury/shared/messages/messages.module';
import { OtpFormModule } from '@fe-treasury/shared/otp-form/otp-form.module';
import { SecondsToTimeStringPipe } from 'src/app/pipes/seconds-to-time-string.pipe';

import { RecoverySelectionComponent } from './recovery-selection/recovery-selection.component';
import { PasswordRecoveryRoutingModule } from './password-recovery-routing.module';
import { PasswordRecoveryComponent } from './password-recovery.component';
import { MailRecoveryFormComponent } from './mail-form/mail-form.component';
import { NotificationScreenComponent } from './notification-screen/notification-screen.component';
import { InsertOtpScreenComponent } from './insert-otp-screen/insert-otp-screen.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { ResetPinComponent } from './reset-pin/reset-pin.component';
import { OnbFooterComponent } from '@fe-treasury/shared/onb-footer/onb-footer.component';
import { PasswordValidationComponent } from './password-validation/password-validation.component';
import { PinCodeValidationComponent } from './pin-code-validation/pin-code-validation.component';
@NgModule({
  imports: [
    CommonModule,
    OnbFooterComponent,
    OtpFormModule,
    FormsModule,
    PasswordRecoveryRoutingModule,
    MessagesModule,
    ReactiveFormsModule,
    BiometricValidationModule,
    MaterialModule,
    CustomHeaderOnbModule,
    SecondsToTimeStringPipe,
  ],
  declarations: [
    RecoverySelectionComponent,
    PasswordRecoveryComponent,
    ResetPinComponent,
    ResetPasswordComponent,
    MailRecoveryFormComponent,
    InsertOtpScreenComponent,
    NotificationScreenComponent,
    PasswordValidationComponent,
    PinCodeValidationComponent,
  ],
  exports: [PasswordRecoveryComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PasswordRecoveryModule {}
