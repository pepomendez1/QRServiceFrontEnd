import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '@fe-treasury/shared/material-components.module';
import { RecoverySelectionComponent } from './recovery-selection/recovery-selection.component';
import { PasswordRecoveryComponent } from './password-recovery.component';
import { MailRecoveryFormComponent } from './mail-form/mail-form.component';
import { NotificationScreenComponent } from './notification-screen/notification-screen.component';
import { InsertOtpScreenComponent } from './insert-otp-screen/insert-otp-screen.component';
import { OtpFormModule } from '@fe-treasury/shared/otp-form/otp-form.module';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { PinCodeModule } from '../../pin-code/pin-code.module';
import { MessagesModule } from '@fe-treasury/shared/messages/messages.module';
import { SecondsToTimeStringPipe } from 'src/app/pipes/seconds-to-time-string.pipe';
import { BiometricValidationModule } from '@fe-treasury/shared/biometric-validation/biometric-validation.module';
@NgModule({
  imports: [
    CommonModule,
    OtpFormModule,
    FormsModule,
    PinCodeModule,
    MessagesModule,
    ReactiveFormsModule,
    BiometricValidationModule,
    MaterialModule,
    SecondsToTimeStringPipe,
  ],
  declarations: [
    RecoverySelectionComponent,
    PasswordRecoveryComponent,
    ResetPasswordComponent,
    MailRecoveryFormComponent,
    InsertOtpScreenComponent,
    NotificationScreenComponent,
  ],
  exports: [PasswordRecoveryComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PasswordRecoveryModule {}
