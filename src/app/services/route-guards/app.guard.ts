const USER_STATUS = {
  ONBOARDING: 'onboarding_pending', // onboarding wrapper (all onboarding screens)
  PIN: 'pin_code_pending',
  TREASURY: 'treasury_pending',
  COMPLETED: 'completed',
};

import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../auth.service';
import { UserService } from '../user.service';
import { OnboardingService } from '../onboarding.service';
import { Observable, EMPTY, of, forkJoin, BehaviorSubject } from 'rxjs';
import { switchMap, map, catchError, finalize } from 'rxjs/operators';
import { StoreDataService } from '../store-data.service';

const isGuardProcessing$ = new BehaviorSubject<boolean>(false); // Observable to track guard status

export const getGuardProcessingState = (): Observable<boolean> => {
  return isGuardProcessing$.asObservable();
};

export const appGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const userService = inject(UserService);
  const onboardingService = inject(OnboardingService);
  const storeDataService = inject(StoreDataService);

  console.log('App Guard Triggered for Route:', state.url);
  isGuardProcessing$.next(true); // Notify that guard is processing

  // Prevents refresh-loop issue on /on-hold
  if (state.url === '/on-hold') {
    console.log('Page reloaded on /on-hold, keeping user here.');
    isGuardProcessing$.next(false);
    return of(true);
  }

  if (state.url === '/invalid-token') {
    console.log('Invalid token redirection ');
    isGuardProcessing$.next(false);
    return of(true);
  }

  return storeDataService.getStore().pipe(
    switchMap((store) => {
      const isIframe = store.isIframe ?? false;
      console.log('🔍 Checking Mode in appGuard - isIframe:', isIframe);

      return authService.isAuthenticated().pipe(
        switchMap((isAuthenticated) => {
          console.log('User Authenticated:', isAuthenticated);

          if (!isAuthenticated) {
            if (isIframe) {
              console.log(
                'User not authenticated in iframe mode, staying in iframe'
              );
              isGuardProcessing$.next(false); // Ensure guard processing is marked as done
              return of(false);
            } else {
              console.log('User not authenticated, redirecting to /auth/login');
              router.navigate(['/auth/login']);
              isGuardProcessing$.next(false); // Ensure guard processing is marked as done
              return of(false);
            }
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
                if (currentRoute.startsWith('/on-hold')) {
                  return true; // Allow access to '/on-hold'
                } else {
                  console.log(
                    'Treasury is not completed, redirecting to /on-hold'
                  );
                  router.navigate(['/on-hold']);
                  return false;
                }
              }

              if (userStatus === USER_STATUS.COMPLETED) {
                if (metamapStatus !== 'Completed') {
                  if (currentRoute.startsWith('/on-hold')) {
                    return true; // Allow access to '/on-hold'
                  } else {
                    console.log(
                      'Metamap is InProgress, redirecting to /on-hold'
                    );
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

              // Default fallback to login (only for non-iframe mode)
              if (!isIframe) {
                console.log('Unexpected case, redirecting to /auth/login');
                router.navigate(['/auth/login']);
              }
              return false;
            }),
            catchError((error) => {
              console.error('Error obtaining user status:', error);
              if (!isIframe) {
                router.navigate(['/auth/login']);
              }
              isGuardProcessing$.next(false); // Ensure guard processing is marked as done
              return of(false);
            }),
            finalize(() => {
              isGuardProcessing$.next(false); // Notify that guard processing is done
            })
          );
        }),
        catchError((error) => {
          console.error('Error in authentication check:', error);
          isGuardProcessing$.next(false); // Ensure guard processing is marked as done
          return of(false);
        })
      );
    })
  );
};
