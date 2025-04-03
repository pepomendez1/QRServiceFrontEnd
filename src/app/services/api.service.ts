import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { CookieService } from './cookie.service';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { AuthService } from './auth.service';
import { StoreDataService } from './store-data.service';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
    private authService: AuthService,
    private tokenService: TokenService,
    private storeDataService: StoreDataService
  ) {}

  /**
   * Sends a GET request to the specified endpoint.
   * @param endpoint API endpoint.
   * @param skipAuth Indicates if authentication cookies should be skipped.
   * @returns Observable of the HTTP response.
   */
  get<T>(
    endpoint: string,
    skipAuth: boolean = false,
    otpTokens?: boolean
  ): Observable<T> {
    const url = `${this.apiUrl}${endpoint}`;
    if (otpTokens) {
      return this.createHeadersOTP(skipAuth).pipe(
        switchMap((headers) =>
          this.http.get<T>(url, { headers }).pipe(
            catchError((error) => this.handleError(error)) // Now properly catches errors
          )
        ),
        catchError((error) => this.handleError(error)) // Also catches errors from createHeadersOTP()
      );
    } else {
      return this.createHeaders(skipAuth).pipe(
        switchMap((headers) =>
          this.http
            .get<T>(url, { headers })
            .pipe(catchError((error) => this.handleError(error)))
        )
      );
    }
  }

  /**
   * Sends a POST request to the specified endpoint.
   * @param endpoint API endpoint.
   * @param body Payload to be sent.
   * @param skipAuth Indicates if authentication cookies should be skipped.
   * @returns Observable of the HTTP response.
   */
  post<T>(
    endpoint: string,
    body: any,
    skipAuth: boolean = false,
    otpTokens?: boolean
  ): Observable<T> {
    const url = `${this.apiUrl}${endpoint}`;
    if (otpTokens) {
      return this.createHeadersOTP(skipAuth).pipe(
        switchMap((headers) =>
          this.http.post<T>(url, body, { headers }).pipe(
            catchError((error) => this.handleError(error)) // Now properly catches errors
          )
        ),
        catchError((error) => this.handleError(error)) // Also catches errors from createHeadersOTP()
      );
    } else {
      return this.createHeaders(skipAuth).pipe(
        switchMap((headers) =>
          this.http
            .post<T>(url, body, { headers })
            .pipe(catchError((error) => this.handleError(error)))
        ),
        catchError((error) => this.handleError(error)) // Also catches errors from createHeaders()
      );
    }
  }

  /**
   * Sends a PATCH request to the specified endpoint.
   * @param endpoint API endpoint.
   * @param body Payload to be sent.
   * @returns Observable of the HTTP response.
   */
  patch<T>(endpoint: string, body: any): Observable<T> {
    const url = `${this.apiUrl}${endpoint}`;

    return this.createHeaders().pipe(
      switchMap((headers) =>
        this.http
          .patch<T>(url, body, { headers })
          .pipe(catchError((error) => this.handleError(error)))
      )
    );
  }

  /**
   * Sends a PUT request to the specified endpoint.
   * @param endpoint API endpoint.
   * @param body Payload to be sent.
   * @returns Observable of the HTTP response.
   */
  put<T>(endpoint: string, body: any): Observable<T> {
    const url = `${this.apiUrl}${endpoint}`;

    return this.createHeaders().pipe(
      switchMap((headers) =>
        this.http
          .put<T>(url, body, { headers })
          .pipe(catchError((error) => this.handleError(error)))
      )
    );
  }

  /**
   * Sends a DELETE request to the specified endpoint.
   * @param endpoint API endpoint.
   * @param body Optional payload to be sent.
   * @returns Observable of the HTTP response.
   */
  delete<T>(endpoint: string, body: any = null): Observable<T> {
    const url = `${this.apiUrl}${endpoint}`;

    return this.createHeaders().pipe(
      switchMap((headers) => {
        const options = {
          headers,
          body,
        };
        return this.http
          .delete<T>(url, options)
          .pipe(catchError((error) => this.handleError(error)));
      })
    );
  }

  /**
   * Creates HTTP headers with tokens from cookies or refreshes tokens if needed.
   * @param skipAuth Indicates if authentication cookies should be skipped.
   * @returns Observable of HttpHeaders.
   */
  private createHeaders(skipAuth: boolean = false): Observable<HttpHeaders> {
    if (skipAuth) {
      return of(new HttpHeaders());
    }

    const accessToken = this.cookieService.getCookie('access_token');
    const idToken = this.cookieService.getCookie('id_token');

    if (
      !accessToken ||
      !idToken ||
      this.tokenService.isTokenExpired(accessToken) ||
      this.tokenService.isTokenExpired(idToken)
    ) {
      console.warn(
        'Tokens are missing, invalid, or expired. Attempting to refresh...'
      );
      // Check if the app is in iframe mode
      if (this.storeDataService.checkIframe()) {
        return this.handleIframeToken().pipe(
          map(({ accessToken, idToken }) =>
            new HttpHeaders()
              .set('Authorization', `Bearer ${accessToken}`)
              .set('Wibond-Id', idToken)
          )
        );
      } else {
        return this.refreshTokens().pipe(
          map(({ accessToken, idToken }) =>
            new HttpHeaders()
              .set('Authorization', `Bearer ${accessToken}`)
              .set('Wibond-Id', idToken)
          )
        );
      }
    }
    // console.log('headers: ', `Bearer ${accessToken}`, 'Wibond-Id', idToken);
    // Tokens are valid, return headers
    return of(
      new HttpHeaders()
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Wibond-Id', idToken)
    );
  }

  private createHeadersOTP(skipAuth: boolean = false): Observable<HttpHeaders> {
    if (skipAuth) {
      return of(new HttpHeaders());
    }

    const accessTokenOTP = this.cookieService.getCookie('access_token_otp');
    const idTokenOTP = this.cookieService.getCookie('id_token_otp');

    // Use TokenService's isTokenExpired method to check token validity
    if (
      !accessTokenOTP ||
      !idTokenOTP ||
      this.tokenService.isTokenExpired(accessTokenOTP) ||
      this.tokenService.isTokenExpired(idTokenOTP)
    ) {
      console.log('Invalid access token for OTP challenge');
      return throwError(() => new Error('Token inválido para uso de OTP')); // Return Observable error
    }

    return of(
      new HttpHeaders()
        .set('Authorization', `Bearer ${idTokenOTP}`)
        .set('Wibond-Id', idTokenOTP)
    );
  }

  private refreshTokens(): Observable<{
    accessToken: string;
    idToken: string;
  }> {
    return this.authService.refreshToken().pipe(
      switchMap(() => {
        const refreshedAccessToken =
          this.cookieService.getCookie('access_token');
        const refreshedIdToken = this.cookieService.getCookie('id_token');

        if (!refreshedAccessToken || !refreshedIdToken) {
          throw new Error('Failed to retrieve refreshed tokens.');
        }

        return of({
          accessToken: refreshedAccessToken,
          idToken: refreshedIdToken,
        });
      }),
      catchError((err) => {
        console.error('Token refresh failed, logging out...', err);
        this.authService.logoutUser();
        return throwError(() => err);
      })
    );
  }

  /**
   * Handles token fetching in iframe mode.
   * @returns Observable containing access and ID tokens.
   */
  private handleIframeToken(): Observable<{
    accessToken: string;
    idToken: string;
  }> {
    return this.authService.getTokenFromParent().pipe(
      map((authData) => {
        if (!authData || !authData.access_token || !authData.id_token) {
          throw new Error('Failed to fetch tokens from parent.');
        }
        return {
          accessToken: authData.access_token,
          idToken: authData.id_token,
        };
      }),
      catchError((error) => {
        console.error('Error fetching tokens from parent:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Handles HTTP errors.
   * @param error The error response.
   * @returns An observable that throws the error.
   */
  private handleError(error: any): Observable<never> {
    if (error.status === 403) {
      console.error('Access denied. Redirecting to login.');
      this.authService.logoutUser();
    }
    console.error('HTTP request error:', error);
    return throwError(() => error);
  }
}
