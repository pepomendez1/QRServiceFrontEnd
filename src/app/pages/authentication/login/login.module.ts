import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { LoginRoutingModule } from './login-routing.module';
import { MaterialModule } from '@fe-treasury/shared/material-components.module';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { OnbFooterComponent } from '@fe-treasury/shared/onb-footer/onb-footer.component';
import { ReactiveInputComponent } from '@fe-treasury/shared/form-input/form-input.component';
@NgModule({
  declarations: [LoginComponent],
  imports: [
    ReactiveInputComponent,
    OnbFooterComponent,
    MatProgressBarModule,
    CommonModule,
    LoginRoutingModule,
    MaterialModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
  ],
  exports: [LoginComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LoginModule {}
