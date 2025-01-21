import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ApiService } from './api.service';
import { environment } from 'src/environments/environment';
import { Observable, throwError } from 'rxjs';
import { AuthResponse, AuthService } from './auth.service';
import { TokenService } from './token.service';

import { catchError, switchMap, tap } from 'rxjs/operators';
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
} from 'amazon-cognito-identity-js';

@Injectable({
  providedIn: 'root',
})
export class OTPService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private apiService: ApiService,
    private tokenService: TokenService,
    private authService: AuthService
  ) {}

  sendOtp(email: string | null): Observable<any> {
    if (!email) {
      email = this.authService.getEmail();
    }
    if (!email) {
      return throwError(() => new Error('No email provided'));
    }

    const body: { [key: string]: any } = {};

    body.email = email;
    
    const endpoint =
      environment.apiUrl + '/public/wibond-connect/user/auth/challenge';

    return this.http.post<any>(endpoint, body, {}).pipe(
      tap((response) => {
        console.log('OTP enviado con éxito:', response);
      }),
      catchError((error) => {
        console.error('Error enviando OTP: ', error);
        return error;
      })
    );
  }

  verifyOtp(
    email: string | null,
    otp: string,
    session: string | null,
    challengeName: string
  ): Observable<any> {
    
    if (!email) {
      email = this.authService.getEmail();
    }

    if (!email) {
      return throwError(() => new Error('No email provided'));
    }

    const endpoint =
      environment.apiUrl +
      '/public/wibond-connect/user/auth/challenge/verify';
    const body: { [key: string]: any } = {
      session: session,
      challengeAnswer: otp,
      challengeName: challengeName,
    };

    body.email = email;

    console.log('Payload: ', body);

    return this.http.post<any>(endpoint, body, {}).pipe(
      tap((response) => {
        console.log('OTP Verification successful:', response);

        const authData: AuthResponse = {
          access_token: response.AccessToken,
          id_token: response.IdToken,
          refresh_token: response.RefreshToken,
          expires_in: response.ExpiresIn,
          token_type: response.TokenType || 'Bearer',
        };
        console.log('Authentication data:', authData);
        // Store the token data using TokenService or similar
        this.tokenService.setAuthData(authData);
        return response;
      }),
      catchError((error) => {
        console.error('OTP Verification error:', error);
        return throwError(() => new Error('Código de verificación inválido'));
      })
    );
  }
}
