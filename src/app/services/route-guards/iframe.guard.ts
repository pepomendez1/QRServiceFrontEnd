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

export const iframeGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const userService = inject(UserService);
  const onboardingService = inject(OnboardingService);

  console.log('🛡️ iframeGuard triggered for:', state.url);

  // Prevents refresh-loop issue on /on-hold
  if (state.url === '/on-hold') {
    console.log('Page reloaded on /on-hold, keeping user here.');
    return of(true);
  }

  return authService.isAuthenticated().pipe(
    switchMap((isAuthenticated) => {
      console.log('User Authenticated:', isAuthenticated);

      if (!isAuthenticated) {
        console.log('User not authenticated');
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

          // 🔹 Redirect user based on their status
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

          if (userStatus === USER_STATUS.TREASURY) {
            if (metamapStatus == 'Pending') {
              if (currentRoute.startsWith('/onboarding')) {
                return true; // Allow access to '/on-hold'
              } else {
                console.log('Metamap is InProgress, redirecting to /on-hold');
                router.navigate(['/onboarding']);
                return false;
              }
            } else {
              if (currentRoute.startsWith('/on-hold')) {
                return true; // Allow access to '/on-hold'
              } else {
                console.log('Metamap is InProgress, redirecting to /on-hold');
                router.navigate(['/on-hold']);
                return false;
              }
            }
          }

          if (userStatus === USER_STATUS.COMPLETED) {
            if (metamapStatus == 'Pending') {
              if (currentRoute.startsWith('/onboarding')) {
                return true; // Allow access to '/on-hold'
              } else {
                console.log('Metamap is InProgress, redirecting to /on-hold');
                router.navigate(['/onboarding']);
                return false;
              }
            } else if (metamapStatus !== 'Completed') {
              if (currentRoute.startsWith('/on-hold')) {
                return true; // Allow access to '/on-hold'
              } else {
                console.log('Metamap is InProgress, redirecting to /on-hold');
                router.navigate(['/on-hold']);
                return false;
              }
            } else {
              if (currentRoute.startsWith('/app/')) {
                return true;
              } else {
                console.log('Metamap Completed, redirecting to home');
                router.navigate(['/app']);
                return false;
              }
            }
          }
          // Default fallback to login
          console.log('Unexpected case ...');
          return false;
        }),
        catchError((error) => {
          console.error('Error obtaining user status:', error);
          return of(false);
        })
      );
    })
  );
};
