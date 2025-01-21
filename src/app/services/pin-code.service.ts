import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { TokenService } from './token.service';
import { ConfigService } from './config.service';
import { AuthService } from './auth.service';
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
} from 'amazon-cognito-identity-js';
import { Observable, of, throwError, BehaviorSubject } from 'rxjs';
export interface AuthResponse {
  access_token: string;
  expires_in: number;
  id_token: string;
  refresh_token: string;
  token_type: string;
}

@Injectable({
  providedIn: 'root',
})
export class PinCodeService {
  private cognitoUser: CognitoUser | null = null;
  private userPoolId: string | null = null;
  private clientId: string | null = null;
  private setPinEndpoint = '/public/wibond-connect/user/auth/pin';
  private validatePinEndpoint =
    '/public/wibond-connect/user/auth/validate-pin';
  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private tokenService: TokenService,
    private configService: ConfigService
  ) {}

  setPinCode(pinCode: number): any {
    const data = { pin: String(pinCode) };
    //const data = { pin: '1234' };
    console.log('pin code:', data);
    return this.apiService.post<any>(this.setPinEndpoint, data);
  }

  resetPinCode(pinCode: number): Observable<any> {
    const data = { pin: String(pinCode) };
    //const data = { pin: '1234' };
    console.log('pin code:', data);
    return this.apiService.post<any>(this.setPinEndpoint, data);
  }
  // Método para validar el PIN, ahora recibe pin, email y clientId como query params en un GET
  validatePinCode(pinCode: string, email: string, clientId: string): any {
    const url = `${this.validatePinEndpoint}`;
    const body = {
      pin: pinCode,
      email: email,
      clientId: clientId,
    };

    return this.apiService.post<any>(url, body, true); // Perform the POST request without authentication
  }
}
