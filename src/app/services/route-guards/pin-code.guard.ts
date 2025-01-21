import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../auth.service';
import { Observable, of } from 'rxjs';

export const pinCodeGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService); // Inject AuthService
  const router = inject(Router); // Inject the Router

  if (window.self !== window.top) {
    return of(true);
  } else {
    // Check if the password completion flag is true
    if (authService.isPasswordCompleted()) {
      return of(true);
    } else {
      // Redirect to login or another route if the user tries to access pin-code directly
      router.navigate(['/auth/login']);
      return of(false);
    }
  }
};
