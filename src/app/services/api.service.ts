import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { CookieService } from './cookie.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = environment.apiUrl; // Base URL of the API

  constructor(
    private http: HttpClient,
    private router: Router,
    private cookieService: CookieService
  ) {}

  /**
   * Creates HTTP headers with tokens from cookies.
   * @returns A HttpHeaders instance.
   */
  private createHeaders(skipAuth: boolean = false): HttpHeaders {
    if (skipAuth) {
      // Skip adding authentication headers
      return new HttpHeaders();
    }

    // Retrieve tokens from cookies using CookieService
    const accessToken = this.cookieService.getCookie('access_token');
    const idToken = this.cookieService.getCookie('id_token');

    if (!accessToken || !idToken) {
      console.error('Missing authentication tokens in cookies.');
      this.router.navigate(['/auth/login']);
      throw new Error('Missing authentication tokens.');
    }

    // Create headers with tokens
    return new HttpHeaders()
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Wibond-Id', idToken);
  }

  /**
   * Sends a GET request to the specified endpoint.
   * @param endpoint API endpoint.
   * @param skipAuth Indicates if authentication cookies should be skipped.
   * @returns Observable of the HTTP response.
   */
  get<T>(endpoint: string, skipAuth: boolean = false): Observable<T> {
    const url = `${this.apiUrl}${endpoint}`;
    const headers = this.createHeaders(skipAuth);

    return this.http
      .get<T>(url, { headers })
      .pipe(catchError((error) => this.handleError(error)));
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
    skipAuth: boolean = false
  ): Observable<T> {
    const url = `${this.apiUrl}${endpoint}`;
    const headers = this.createHeaders(skipAuth);

    return this.http
      .post<T>(url, body, { headers })
      .pipe(catchError((error) => this.handleError(error)));
  }

  /**
   * Sends a PATCH request to the specified endpoint.
   * @param endpoint API endpoint.
   * @param body Payload to be sent.
   * @returns Observable of the HTTP response.
   */
  patch<T>(endpoint: string, body: any): Observable<T> {
    const url = `${this.apiUrl}${endpoint}`;
    const headers = this.createHeaders();

    return this.http
      .patch<T>(url, body, { headers })
      .pipe(catchError((error) => this.handleError(error)));
  }

  /**
   * Sends a PUT request to the specified endpoint.
   * @param endpoint API endpoint.
   * @param body Payload to be sent.
   * @returns Observable of the HTTP response.
   */
  put<T>(endpoint: string, body: any): Observable<T> {
    const url = `${this.apiUrl}${endpoint}`;
    const headers = this.createHeaders();

    return this.http
      .put<T>(url, body, { headers })
      .pipe(catchError((error) => this.handleError(error)));
  }

  /**
   * Sends a DELETE request to the specified endpoint.
   * @param endpoint API endpoint.
   * @param body Optional payload to be sent.
   * @returns Observable of the HTTP response.
   */
  delete<T>(endpoint: string, body: any = null): Observable<T> {
    const url = `${this.apiUrl}${endpoint}`;
    const headers = this.createHeaders();
    const options = {
      headers,
      body, // Include payload if provided
    };

    return this.http
      .delete<T>(url, options)
      .pipe(catchError((error) => this.handleError(error)));
  }

  /**
   * Handles HTTP errors.
   * @param error The error response.
   * @returns An observable that throws the error.
   */
  private handleError(error: any): Observable<never> {
    if (error.status === 403) {
      console.error('Access denied. Redirecting to login.');
      // Redirect user to login or handle 403 errors appropriately
    }
    console.error('HTTP request error:', error);
    return throwError(() => error);
  }
}
