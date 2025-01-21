import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AuthWrapperComponent } from './auth-wrapper/auth-wrapper.component';
import { AuthComponentPeYa } from './register/auth-peya.component';
import { PasswordRecoveryComponent } from './password-recovery/password-recovery.component';
import { AuthComponent } from './auth.component';

const routes: Routes = [
  {
    path: 'auth-old',
    component: AuthComponent,
    //children: [
    //   { path: 'auth', component: AuthWrapperComponent },
    //   { path: 'login', component: LoginComponent },
    //   { path: 'register', component: AuthComponentPeYa },
    //   { path: 'recover-password', component: PasswordRecoveryComponent },
    // ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthRoutingModule {}
