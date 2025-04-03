import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  fromEvent,
  merge,
  Subject,
  Subscription,
  timer,
} from 'rxjs';
import { debounceTime, mapTo, switchMap, takeUntil, tap } from 'rxjs/operators';
import { SnackbarService } from '@fe-treasury/shared/snack-bar/snackbar.service';
import { TokenService } from './token.service';
import { Router } from '@angular/router';
@Injectable({
  providedIn: 'root',
})
export class SessionManagementService {
  private inactivityTimeout = 5 * 60 * 1000; // 5 minutes
  private warningDuration = 30 * 1000; // 30 seconds before logout

  // less time for testing purposes
  //private inactivityTimeout = 10 * 1000; // 10 seg
  //private warningDuration = 30 * 1000; // 30 seconds before logout

  private userActivity$ = new Subject<void>();
  private logoutTimer$ = new Subject<void>();
  private warningTimer$ = new Subject<void>();
  private sessionMonitorActive = false; // Flag to manage monitoring state

  public onLogout = new Subject<void>(); // Observable for notifying logout
  private logoutReason$ = new BehaviorSubject<string | null>(null); // BehaviorSubject for logout reason

  private activitySubscription?: Subscription;
  private inactivitySubscription?: Subscription;
  private warningSubscription?: Subscription;
  private logoutSubscription?: Subscription;

  private tokenExpirationTimer$ = new Subject<void>(); // Timer for token expiration
  private tokenExpirationTime: number | null = null; // Stores the token expiration time
  private isTokenMonitoringActive = false; // Flag to track if token monitoring is active

  constructor(
    private snackbarService: SnackbarService,
    private tokenService: TokenService,
    private router: Router
  ) {}

  // Expose the logoutReason$ as an observable
  getLogoutReason() {
    return this.logoutReason$.asObservable();
  }

  // Set the logout reason
  // Allow external components to set the logout reason
  public setLogoutReason(reason: string): void {
    this.logoutReason$.next(reason);
  }

  // Clear the logout reason (e.g., after successful login)
  public resetLogoutReason(): void {
    this.logoutReason$.next(null);
  }
  /**
   * Starts monitoring user activity and handles session timeout logic.
   */
  startInactivityMonitoring(): void {
    this.resetLogoutReason();
    if (this.sessionMonitorActive) {
      return; // Prevent multiple starts
    }
    this.sessionMonitorActive = true;
    console.log('Session monitoring started.');

    // Listen for user activity
    const activity$ = merge(
      fromEvent(window, 'mousemove'),
      fromEvent(window, 'keydown'),
      fromEvent(window, 'click')
    ).pipe(
      debounceTime(500), // Debounce rapid events
      mapTo(true),
      tap(() => this.userActivity$.next()) // Notify of user activity
    );

    // Subscribe to activity tracking
    this.activitySubscription = activity$.subscribe();

    this.startInactivityTimer();

    // Ensure snackbar closes when session expires
    this.logoutSubscription = this.onLogout.subscribe(() => {
      console.warn('Session expired. Closing snackbar.');
      this.snackbarService.close();
      this.stopInactivityMonitoring();
    });
  }

  /**
   * Starts monitoring token expiration (for /auth/register, /pin-code, /onboarding routes).
   */
  startTokenExpirationMonitoring(): void {
    console.log('running token monitor......');
    const accessToken = this.tokenService.getToken('access_token');
    console.log('access token monitoring: ', accessToken);
    if (!accessToken) {
      console.error('Access token not found.');
      return;
    }

    // Decode the access token to get the expiration time
    const decodedToken = this.tokenService.decodeToken(accessToken);
    console.log('decoded token: ....... ', decodedToken);
    if (!decodedToken || !decodedToken.exp) {
      console.error('Invalid access token.');
      return;
    }

    // Calculate exactly when token expires
    const expirationTime = decodedToken.exp * 1000; // Convert to ms
    const currentTime = Date.now();
    const timeUntilExpiration = expirationTime - currentTime;

    // Show warning exactly 30s before expiration
    const warningTime = Math.max(timeUntilExpiration - 30000, 0);

    console.log(`Token expires in: ${timeUntilExpiration / 1000}s`);

    console.log('Token expiration time:', new Date(expirationTime));
    console.log('Current time:', new Date(currentTime));
    console.log('Time until expiration (ms):', timeUntilExpiration);

    if (timeUntilExpiration <= 0) {
      this.handleTokenExpired();
      return;
    }

    // Set up the 30s warning
    timer(warningTime)
      .pipe(takeUntil(this.tokenExpirationTimer$))
      .subscribe(() => {
        this.showTokenExpirationWarning(
          'la sesión cerrará en 30 segundos, para seguir tenés que volver a ingresar o solicitar un nuevo link',
          30000
        );
      });

    // Set up the expiration handler
    timer(timeUntilExpiration)
      .pipe(takeUntil(this.tokenExpirationTimer$))
      .subscribe(() => {
        this.handleTokenExpired();
      });
  }
  private handleTokenExpired(): void {
    console.warn('Token expired - logging out');
    this.onLogout.next();

    const route = this.router.url;
    if (route === '/onboarding') {
      this.setLogoutReason('token_expired_onb');
    } else if (route === '/auth/register' || route === '/pin-code') {
      this.setLogoutReason('token_expired_credentials');
    } else {
      this.setLogoutReason('token_expired');
    }
  }
  /**
   * Stops token expiration monitoring.
   */
  stopTokenExpirationMonitoring(): void {
    console.log('Token expiration monitoring stopped.');
    this.tokenExpirationTimer$.next(); // Stop the token expiration timer
    this.tokenExpirationTimer$.complete();
  }

  /**
   * Shows a warning snackbar for token expiration.
   */
  private showTokenExpirationWarning(message: string, duration: number): void {
    this.snackbarService.openWarning(
      message,
      false, // Show close button
      duration // Duration for the warning
    );
  }

  /**
   * Starts the inactivity timer.
   */
  private startInactivityTimer(): void {
    this.inactivitySubscription = this.userActivity$
      .pipe(
        switchMap(() =>
          timer(this.inactivityTimeout).pipe(takeUntil(this.userActivity$))
        ),
        tap(() => this.showWarningSnackbar())
      )
      .subscribe();
  }

  /**
   * Stops monitoring user activity.
   */
  stopInactivityMonitoring(): void {
    if (this.sessionMonitorActive) {
      console.log('Session monitoring stopped.');

      // Mark monitoring as inactive
      this.sessionMonitorActive = false;

      // Unsubscribe from all subscriptions
      this.activitySubscription?.unsubscribe();
      this.inactivitySubscription?.unsubscribe();
      this.warningSubscription?.unsubscribe();
      this.logoutSubscription?.unsubscribe();

      // Complete or reset Subjects to ensure no stale emissions
      this.userActivity$.complete();
      this.logoutTimer$.complete();
      this.warningTimer$.complete();

      // Reinitialize Subjects for future monitoring
      this.userActivity$ = new Subject<void>();
      this.logoutTimer$ = new Subject<void>();
      this.warningTimer$ = new Subject<void>();
    }
  }

  /**
   * Shows a snackbar warning the user about session timeout.
   */
  private showWarningSnackbar(): void {
    console.warn('User inactive. Showing session warning snackbar.');

    // Open the custom snackbar
    this.snackbarService.openWarning(
      'Debido a inactividad en la cuenta, la sesión se cerrará en 30 segundos.',
      false, // Show close button
      this.warningDuration, // Duration for the warning
      'Seguir en la sesión', // Action button label
      () => {
        console.log('User chose to stay logged in.');
        this.userActivity$.next(); // Reset the timer
      }
    );

    // Prevent logout if user logs out before the timer expires
    this.warningSubscription?.unsubscribe();

    // Logout after warning duration if no activity
    this.warningSubscription = timer(this.warningDuration)
      .pipe(takeUntil(this.userActivity$))
      .subscribe(() => {
        this.snackbarService.close();
        console.warn('User did not respond. Logging out...');
        this.onLogout.next();
        this.setLogoutReason('timeout');
      });
  }
}
