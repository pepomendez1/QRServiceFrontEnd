import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthComponent } from './auth.component'; // Main wrapper component

const routes: Routes = [
  {
    path: '',
    component: AuthComponent, // This component serves as the wrapper for auth routes
    children: [
      {
        path: 'login',
        loadChildren: () =>
          import('../login/login.module').then((m) => m.LoginModule),
      },
      {
        path: 'register',
        loadChildren: () =>
          import('../register/register.module').then((m) => m.RegisterModule),
      },
      {
        path: 'password-recovery',
        loadChildren: () =>
          import('../password-recovery/password-recovery.module').then(
            (m) => m.PasswordRecoveryModule
          ),
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthRoutingModule {}
