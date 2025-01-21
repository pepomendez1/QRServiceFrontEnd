import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { CognitoUser } from 'amazon-cognito-identity-js';
import { AuthResponse } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class MFAService {
  private cognitoUser: CognitoUser | null = null;
  private session: string | null = null;

  constructor() {}

  setCognitoUser(cognitoUser: CognitoUser) {
    this.cognitoUser = cognitoUser;
  }

  setSession(session: string) {
    this.session = session;
  }

  handleMFA(challengeName: string, challengeParameters: any, observer: any) {
    observer.next({
      mfaRequired: true,
      challengeName,
      challengeParameters,
    });
  }

  verifyMFA(credentials: { mfaCode: string }): Observable<any> {
    if (!this.cognitoUser) {
      console.error('Error: Usuario no encontrado');
      return throwError('User not found');
    }
    console.log ('ACAAAAAAAAAAAAA verifyMFA')
    return new Observable((observer) => {
      this.cognitoUser!.sendMFACode(
        credentials.mfaCode,
        {
          onSuccess: (result) => {
            const authData: AuthResponse = {
              access_token: result.getAccessToken().getJwtToken(),
              id_token: result.getIdToken().getJwtToken(),
              refresh_token: result.getRefreshToken().getToken(),
              expires_in: result.getAccessToken().getExpiration(),
              token_type: 'Bearer',
            };
            observer.next(authData);
            observer.complete();
          },
          onFailure: (err) => {
            observer.error(err);
          },
        },
        'SOFTWARE_TOKEN_MFA'
      );
    });
  }

  setupMFA(credentials: { mfaType: string }): Observable<any> {
    return new Observable((observer) => {
      this.cognitoUser!.associateSoftwareToken({
        onFailure: (err) => {
          observer.error(err);
        },
        associateSecretCode: (secretCode: string) => {
          this.session = secretCode; // Guardar la sesión devuelta
          observer.next({ secretCode });
          observer.complete();
        },
      });
    });
  }

  verifySoftwareToken(token: string, deviceName: string): Observable<any> {
    return new Observable((observer) => {
      if (!this.cognitoUser) {
        observer.error('User not found');
        return;
      }

      this.cognitoUser.verifySoftwareToken(
        token,
        deviceName,
        {
          onSuccess: (result) => {
            observer.next(result);
            observer.complete();
          },
          onFailure: (err) => {
            observer.error(err);
          },
        }
      );
    });
  }
}
