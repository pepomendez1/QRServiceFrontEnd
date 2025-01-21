import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PasswordRecoveryComponent } from './password-recovery.component';

const routes: Routes = [
  { path: '', component: PasswordRecoveryComponent }, // Main component for the password recovery route
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PasswordRecoveryRoutingModule {}
