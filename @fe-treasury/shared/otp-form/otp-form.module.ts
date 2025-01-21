import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { OtpFormComponent } from './otp-form.component';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { SecondsToTimeStringPipe } from 'src/app/pipes/seconds-to-time-string.pipe';
@NgModule({
  declarations: [OtpFormComponent], // Declare your component here
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatIconModule,
    SecondsToTimeStringPipe,
    ReactiveFormsModule, // Required for using reactive forms
  ],
  exports: [OtpFormComponent], // Export the component so it can be used elsewhere
})
export class OtpFormModule {}
