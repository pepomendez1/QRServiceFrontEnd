import { Injectable, Injector } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private injector: Injector, // Use Angular's Injector
    private router: Router
  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const skipAuth = req.headers.get('X-Skip-Auth');
    if (skipAuth) {
      const clonedRequest = req.clone({
        headers: req.headers.delete('X-Skip-Auth'),
      });
      return next.handle(clonedRequest);
    }

    // Lazily retrieve the AuthService
    const authService = this.injector.get(AuthService);

    const accessToken = authService.getAccessToken(); // Assume AuthService provides this method
    let clonedRequest = req;

    if (accessToken) {
      clonedRequest = req.clone({
        setHeaders: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    }

    return next.handle(clonedRequest).pipe(
      catchError((error) => {
        if (error.status === 401) {
          // Handle token refresh using AuthService
          return authService.refreshToken().pipe(
            switchMap(() => {
              const newAccessToken = authService.getAccessToken();
              const newRequest = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${newAccessToken}`,
                },
              });
              return next.handle(newRequest);
            }),
            catchError((refreshError) => {
              console.error(
                'Token refresh failed. Logging out...',
                refreshError
              );
              authService.logOut(); // Log the user out
              this.router.navigate(['/auth/login']);
              return throwError(() => refreshError);
            })
          );
        }

        return throwError(() => error);
      })
    );
  }
}
