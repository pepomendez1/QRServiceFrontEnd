import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms'; // Ensure this is imported
import { OtpFormComponent } from './otp-form/otp-form.component';
import { OtpInputComponent } from './otp-input.component';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { SecondsToTimeStringPipe } from 'src/app/pipes/seconds-to-time-string.pipe';

@NgModule({
  declarations: [
    OtpInputComponent,
    OtpFormComponent, // Declare OtpFormComponent here
  ],
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatIconModule,
    SecondsToTimeStringPipe,
    ReactiveFormsModule, // Ensure ReactiveFormsModule is imported here
  ],
  exports: [OtpInputComponent], // Export the component so it can be used elsewhere
})
export class OtpInputModule {}
