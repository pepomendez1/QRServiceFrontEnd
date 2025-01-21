const USER_STATUS = {
  ONBOARDING: 'onboarding_pending', //onboarding wrapper (todas las pantallas de ob)
  PIN: 'pin_code_pending',
  TREASURY: 'treasury_pending',
  COMPLETED: 'completed',
};

import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../auth.service';
import { UserService } from '../user.service';
import { OnboardingService } from '../onboarding.service';
import { Observable, EMPTY, of, forkJoin } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';

export const appGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const userService = inject(UserService);
  const onboardingService = inject(OnboardingService);

  console.log('App Guard Triggered for Route:', state.url);

  // Check if on /on-hold page; if so, redirect to login on refresh
  if (state.url === '/on-hold') {
    console.log('Page reloaded on /on-hold, redirecting to /auth/login');
    return of(true); //
  }

  return authService.isAuthenticated().pipe(
    switchMap((isAuthenticated) => {
      console.log('User Authenticated:', isAuthenticated);

      if (!isAuthenticated) {
        console.log('User not authenticated, redirecting to /auth/login');
        router.navigate(['/auth/login']);
        return of(false);
      }

      return forkJoin({
        userStatus: userService.getUserStatus(),
        metamapStatus: onboardingService.getMetamapStatus(),
      }).pipe(
        map(({ userStatus, metamapStatus }) => {
          console.log('User Status Retrieved:', userStatus);
          console.log('Metamap Status Retrieved:', metamapStatus);

          const currentRoute = state.url;

          // Handle specific status cases
          if (userStatus === USER_STATUS.PIN) {
            if (currentRoute.startsWith('/pin-code')) {
              return true; // Allow access to '/pin-code'
            } else {
              console.log('Redirecting to /pin-code for PIN setup');
              router.navigate(['/pin-code']);
              return false;
            }
          }

          if (userStatus === USER_STATUS.ONBOARDING) {
            if (currentRoute.startsWith('/onboarding')) {
              return true; // Allow access to '/onboarding'
            } else {
              console.log(
                'Redirecting to /onboarding for ongoing onboarding process'
              );
              router.navigate(['/onboarding']);
              return false;
            }
          }

          if (userStatus === USER_STATUS.COMPLETED) {
            if (metamapStatus !== 'Completed') {
              if (currentRoute.startsWith('/on-hold')) {
                return true; // Allow access to '/on-hold'
              } else {
                console.log('Metamap is InProgress, redirecting to /on-hold');
                router.navigate(['/on-hold']);
                return false;
              }
            } else {
              if (currentRoute.startsWith('/app')) {
                return true; // Allow access to '/app'
              } else {
                console.log('Metamap Completed, redirecting to /app');
                router.navigate(['/app']);
                return false;
              }
            }
          }

          // Default fallback to login
          console.log('Unexpected case, redirecting to /auth/login');
          router.navigate(['/auth/login']);
          return false;
        }),
        catchError((error) => {
          console.error(
            'Error obtaining user status or metamap status:',
            error
          );
          router.navigate(['/auth/login']);
          return of(false);
        })
      );
    })
  );
};
