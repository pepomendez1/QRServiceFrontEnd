import { Injectable, Injector } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { SessionService } from './session.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<string | null> =
    new BehaviorSubject<string | null>(null);

  constructor(
    private injector: Injector,
    private sessionService: SessionService
  ) {}

  private get authService(): AuthService {
    return this.injector.get(AuthService); // Lazily inject AuthService
  }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const accessToken = this.authService.getAccessTokenFromCookies(); // Ensure tokens are cookie-based

    const clonedRequest = accessToken
      ? req.clone({ setHeaders: { Authorization: `Bearer ${accessToken}` } })
      : req;

    return next.handle(clonedRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && !this.isRefreshing) {
          this.isRefreshing = true;
          this.refreshTokenSubject.next(null);

          return this.authService.refreshToken().pipe(
            switchMap((newAuthData) => {
              this.isRefreshing = false;
              this.refreshTokenSubject.next(newAuthData.access_token);

              const newRequest = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${newAuthData.access_token}`,
                },
              });
              return next.handle(newRequest);
            }),
            catchError(() => {
              this.isRefreshing = false;
              this.sessionService.logoutUser(); // Use SessionService for logout
              return throwError(() => error);
            })
          );
        } else if (error.status === 401 && this.isRefreshing) {
          return this.refreshTokenSubject.pipe(
            filter((token) => token !== null),
            take(1),
            switchMap((token) => {
              const newRequest = req.clone({
                setHeaders: { Authorization: `Bearer ${token}` },
              });
              return next.handle(newRequest);
            })
          );
        }
        return throwError(() => error);
      })
    );
  }
}
