import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of, throwError, BehaviorSubject, forkJoin } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoRefreshToken,
  CognitoAccessToken,
  CognitoIdToken,
  CognitoUserSession,
} from 'amazon-cognito-identity-js';
import { environment } from 'src/environments/environment';
import { ConfigService } from './config.service';
import { IntegrationService } from './integration.service';
import { TokenService } from './token.service';
import { MFAService } from './mfa.service';
import { ErrorHandlingService } from './error-handling.service';
import { StoreDataService } from './store-data.service';
import { SnackbarService } from '@fe-treasury/shared/snack-bar/snackbar.service';
import { RegisterSteps } from '../pages/authentication/register/register.component';
import { CookieService } from './cookie.service';
import { SessionManagementService } from './session.service';
function toSnakeCaseKeys(obj: any): any {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(toSnakeCaseKeys);
  }

  return Object.keys(obj).reduce((result: any, key) => {
    // Solo agregar un guion bajo antes de las mayúsculas, y no si es la primera letra
    const snakeKey = key
      .replace(/([A-Z])/g, '_$1')
      .toLowerCase()
      .replace(/^_/, '');
    result[snakeKey] = toSnakeCaseKeys(obj[key]);
    return result;
  }, {});
}

export interface AuthResponse {
  access_token: string;
  id_token: string;
  refresh_token: string;
  expires_in?: number; // Make it optional
  token_type: string;
}

export interface AuthResponseOTP {
  access_token_otp: string;
  id_token_otp: string;
  expires_in?: number; // Make it optional
  token_type: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrlAuth = `${environment.apiUrl}/auth`;
  private cognitoUser: CognitoUser | null = null;
  private userPoolId: string | null = null;
  private apiUrl = environment.apiUrl;
  private passwordCompleted = false;
  private clientId: string | null = null;
  private challengeName: string | null = null;
  private challengeParameters: any = null;
  public isIframe: boolean = false;
  public authDataSubject: BehaviorSubject<AuthResponse | null>;
  private checkMagiLink = '/public/wibond-connect/user/auth/magic_token';
  constructor(
    private sessionManagementService: SessionManagementService,
    private cookieService: CookieService,
    private http: HttpClient,
    private snackBarService: SnackbarService,
    private configService: ConfigService,
    private integrationService: IntegrationService,
    private tokenService: TokenService,
    private mfaService: MFAService,
    private errorHandlingService: ErrorHandlingService,
    private route: ActivatedRoute,
    private router: Router,
    private storeDataService: StoreDataService
  ) {
    this.authDataSubject = new BehaviorSubject<AuthResponse | null>(
      this.tokenService.getAuthData()
    );
    this.initializeConfig();
    // Subscribe to the logout event
    this.sessionManagementService.onLogout.subscribe(() => {
      this.logoutUser();
    });
  }

  // Método para manejar errores 403
  handle403Error(): void {
    // Redirigir a una página de acceso denegado, o mostrar un mensaje
    this.router.navigate(['/auth/login']); // Página de acceso denegado
  }

  private initializeConfig(): void {
    console.log('initialize auth service... ');
    this.isIframe = this.storeDataService.checkIframe();
    this.userPoolId = this.storeDataService.getUserPoolId();
    this.clientId = this.storeDataService.getClientId();
  }

  public initializeAuth(): void {
    const authData = this.tokenService.getAuthData();
    if (authData && !this.tokenService.isTokenExpired(authData.access_token)) {
      this.authDataSubject.next(authData);
      return;
    } else if (
      authData &&
      this.tokenService.isTokenExpired(authData.access_token)
    ) {
      /* this.refreshToken().subscribe(
        (newAuthData) => {
          this.authDataSubject.next(newAuthData);
        },
        (error) => {
          console.error('Error refreshing token:', error);
          this.tokenService.removeAuthData();
          this.startAuthFlow();
        }
      ); */
    } else {
      this.startAuthFlow();
    }
  }

  private startAuthFlow(): void {
    this.route.queryParams.subscribe((params) => {
      const code = params['code'];
      if (code) {
        // this.exchangeCodeForToken(code);
      } else {
        this.integrationService
          .getIntegrationMethod()
          .subscribe((method: string) => {
            if (method === 'iframe') {
              window.addEventListener(
                'message',
                this.receiveMessage.bind(this),
                false
              );
              window.parent.postMessage({ action: 'requestToken' }, '*');
            } else if (method === 'portal') {
              this.router.navigate(['/auth']);
            }
          });
      }
    });
  }

  signIn(credentials: {
    username: string;
    password: string;
    pinCode?: string;
  }): Observable<any> {
    const authDetails = new AuthenticationDetails({
      Username: credentials.username,
      Password: credentials.password,
    });

    const userPool = new CognitoUserPool({
      UserPoolId: this.userPoolId!,
      ClientId: this.clientId!,
    });

    this.cognitoUser = new CognitoUser({
      Username: credentials.username,
      Pool: userPool,
    });

    this.mfaService.setCognitoUser(this.cognitoUser);

    return new Observable((observer) => {
      this.cognitoUser!.authenticateUser(authDetails, {
        onSuccess: (result) => {
          const authData: AuthResponse = {
            access_token: result.getAccessToken().getJwtToken(),
            id_token: result.getIdToken().getJwtToken(),
            refresh_token: result.getRefreshToken().getToken(),
            expires_in: result.getAccessToken().getExpiration(),
            token_type: 'Bearer',
          };

          this.tokenService.setAuthData(authData);
          this.storeDataService.updateStore({
            cognitoUser: this.cognitoUser,
          });
          const decodedToken = this.tokenService.decodeToken(
            authData.access_token
          );

          this.cookieService.setCookie('username', decodedToken.username, 1);
          // After successfully authenticating, get the device key
          this.cognitoUser!.getDevice({
            onSuccess: (device: any) => {
              if (device) {
                sessionStorage.setItem(
                  'currentDeviceKey',
                  device.Device.DeviceKey
                );
              }
            },
            onFailure: (err) => {
              console.error('Failed to get device key:', err);
            },
          });

          observer.next(authData);
          observer.complete();
        },
        onFailure: (err) => {
          console.error('Error en la autenticación:', err);
          if (err.code === 'PasswordResetRequiredException') {
            observer.next({ tempPassword: true });
          } else {
            observer.error(err);
          }
        },
        mfaRequired: (challengeName, challengeParameters) => {
          console.log(
            'Autenticación MFA requerida:',
            challengeName,
            challengeParameters
          );
          this.challengeName = challengeName;
          this.challengeParameters = challengeParameters;
          //this.setSession(this.cognitoUser!.getSignInUserSession()); // Establecer la sesión
          //this.mfaService.setCognitoUser(this.cognitoUser!);
          this.mfaService.handleMFA(
            challengeName,
            challengeParameters,
            observer
          );
        },
        newPasswordRequired: (userAttributes, requiredAttributes) => {
          console.log(
            'Nueva contraseña requerida:',
            userAttributes,
            requiredAttributes
          );
          observer.next({
            newPasswordRequired: true,
            userAttributes,
            requiredAttributes,
          });
        },
        mfaSetup: (challengeName, challengeParameters) => {
          console.log(
            'Configuración de MFA requerida:',
            challengeName,
            challengeParameters
          );
          this.mfaService.setCognitoUser(this.cognitoUser!);
          //this.setSession(this.cognitoUser!.getSignInUserSession()); // Establecer la sesión
          this.mfaService.setupMFA({ mfaType: challengeName }).subscribe(
            (result) =>
              observer.next({
                mfaSetup: true,
                challengeName,
                challengeParameters,
                ...result,
              }),
            (error) => observer.error(error)
          );
        },
        totpRequired: (challengeName, challengeParameters) => {
          this.challengeName = challengeName;
          this.challengeParameters = challengeParameters;
          this.mfaService.setCognitoUser(this.cognitoUser!);
          /* const session = this.cognitoUser!.getSignInUserSession();

          this.setSession(session); // Establecer la sesión */
          observer.next({
            totpRequired: true,
            challengeName,
            challengeParameters,
          });
        },
        customChallenge: (challengeParameters) => {
          observer.next({ customChallenge: true, challengeParameters });
        },
        selectMFAType: (challengeName, challengeParameters) => {
          console.log(
            'Seleccionar tipo de MFA:',
            challengeName,
            challengeParameters
          );
          observer.next({
            selectMFAType: true,
            challengeName,
            challengeParameters,
          });
        },
      });
    });
  }

  receiveMessage(event: MessageEvent): void {
    if (event.data.action === 'deliverToken') {
      const authData: AuthResponse = event.data.authData;
      if (typeof authData.access_token === 'string') {
        this.tokenService.setAuthData(authData);
        this.authDataSubject.next(authData);
      } else {
        console.error('Invalid token format:', authData);
      }
    }
  }

  verifyMFA(credentials: { mfaCode: string }): Observable<any> {
    if (!this.cognitoUser) {
      console.error('Error: Usuario no encontrado');
      return throwError('User not found');
    }

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
            this.tokenService.setAuthData(authData);
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

  verifyTotpToken(token: string, deviceName: string): Observable<any> {
    if (!this.cognitoUser) {
      return throwError('CognitoUser is not set');
    }
    this.mfaService.setCognitoUser(this.cognitoUser!);
    return this.mfaService.verifySoftwareToken(token, deviceName).pipe(
      tap((result) => {}),
      catchError(this.errorHandlingService.handleError('verifyTotpToken'))
    );
  }

  completeNewPassword(credentials: {
    username: string;
    newPassword: string;
  }): Observable<any> {
    const url = `${this.apiUrl}/public/wibond-connect/user/auth/set_password `; // URL de tu backend

    // Obtener el token de la sesión actual
    const authData = this.tokenService.getAuthData();
    if (!authData) {
      return throwError('No auth data available');
    }

    // Crear los headers, incluyendo el token de autorización y el Wibond-Id
    const headers = new HttpHeaders({
      Authorization: `Bearer ${authData.access_token}`,
      'Content-Type': 'application/json',
      'Wibond-Id': `${authData.id_token}`, // Aquí agregamos el Wibond-Id con el id_token
    });

    // Crear el cuerpo de la solicitud
    const body = {
      newPassword: credentials.newPassword,
    };

    // Realizar el POST al backend
    return this.http.post<any>(url, body, { headers }).pipe(
      tap((response) => {
        this.passwordCompleted = true;
        // En este punto, puedes proceder a la pantalla de configuración del PIN.
        // this.router.navigate(['/set-pin']); // Navegar a la pantalla de configuración del PIN
      }),
      catchError((error) => {
        console.error('Error configurando nueva contraseña:', error);
        return throwError(error);
      })
    );
  }

  refreshToken(): Observable<void> {
    console.log('refreshing the token..........................');

    // If CognitoUser is not set, reinitialize it
    if (!this.cognitoUser) {
      console.log('CognitoUser not set. Attempting to reinitialize...');

      // Get the username from cookies
      const username = this.cookieService.getCookie('username');
      if (!username) {
        console.error(
          'Username not found in cookies. Cannot reinitialize CognitoUser.'
        );
        return throwError(() => new Error('Username not found.'));
      }

      // Get the refresh token from cookies
      const refreshTokenValue = this.tokenService.getToken('refresh_token');
      if (!refreshTokenValue) {
        console.error('Refresh token is missing.');
        return throwError(() => new Error('Refresh token is missing.'));
      }

      // Reinitialize CognitoUser
      return this.reinitializeCognitoUser(username, refreshTokenValue).pipe(
        switchMap((cognitoUser) => {
          this.cognitoUser = cognitoUser;
          console.log('CognitoUser reinitialized successfully.');

          // Now refresh the session
          const refreshToken = new CognitoRefreshToken({
            RefreshToken: refreshTokenValue,
          });

          return new Observable<void>((observer) => {
            this.cognitoUser!.refreshSession(refreshToken, (err, session) => {
              if (err) {
                console.error('Error refreshing token:', err);
                observer.error(err);
                return;
              }

              console.log('Token refreshed successfully:');

              // Extract new tokens
              const accessToken = session.getAccessToken().getJwtToken();
              const idToken = session.getIdToken().getJwtToken();
              const newRefreshToken = session.getRefreshToken().getToken();

              // Update tokens using TokenService
              this.tokenService.setAuthData({
                access_token: accessToken,
                id_token: idToken,
                refresh_token: newRefreshToken,
                expires_in: session.getAccessToken().getExpiration(),
                token_type: 'Bearer',
              });

              observer.next();
              observer.complete();
            });
          });
        }),
        catchError((err) => {
          console.error('Error reinitializing CognitoUser:', err);
          return throwError(
            () => new Error('Failed to reinitialize CognitoUser.')
          );
        })
      );
    }

    // If CognitoUser is already set, proceed with refreshing the token
    const refreshTokenValue = this.tokenService.getToken('refresh_token');
    if (!refreshTokenValue) {
      console.error('Refresh token is missing.');
      return throwError(() => new Error('Refresh token is missing.'));
    }

    const refreshToken = new CognitoRefreshToken({
      RefreshToken: refreshTokenValue,
    });

    return new Observable<void>((observer) => {
      this.cognitoUser!.refreshSession(refreshToken, (err, session) => {
        if (err) {
          console.error('Error refreshing token:', err);
          observer.error(err);
          return;
        }

        console.log('Token refreshed successfully:');

        // Extract new tokens
        const accessToken = session.getAccessToken().getJwtToken();
        const idToken = session.getIdToken().getJwtToken();
        const newRefreshToken = session.getRefreshToken().getToken();

        // Update tokens using TokenService
        this.tokenService.setAuthData({
          access_token: accessToken,
          id_token: idToken,
          refresh_token: newRefreshToken,
          expires_in: session.getAccessToken().getExpiration(),
          token_type: 'Bearer',
        });

        observer.next();
        observer.complete();
      });
    });
  }

  private reinitializeCognitoUser(
    username: string,
    refreshToken: string
  ): Observable<CognitoUser> {
    return new Observable((observer) => {
      // Get the user pool and client ID from configuration
      this.configService.getConfig().subscribe((config) => {
        if (!config) {
          observer.error('Configuration is missing');
          return;
        }

        this.userPoolId = config.user_pool;
        this.clientId = config.portal_client_id;

        console.log('Reinitializing CognitoUser with username:', username);

        // Create a new CognitoUser object
        const userPool = new CognitoUserPool({
          UserPoolId: this.userPoolId!,
          ClientId: this.clientId!,
        });

        this.cognitoUser = new CognitoUser({
          Username: username,
          Pool: userPool,
        });

        // Set up the session using the refresh token
        const cognitoRefreshToken = new CognitoRefreshToken({
          RefreshToken: refreshToken,
        });

        // Refresh the session to validate the refresh token
        this.cognitoUser.refreshSession(cognitoRefreshToken, (err, session) => {
          if (err) {
            console.error(
              'Error refreshing session during reinitialization:',
              err
            );
            observer.error(err);
            return;
          }

          console.log('CognitoUser reinitialized successfully.');

          // Update tokens in cookies
          const authData: AuthResponse = {
            access_token: session.getAccessToken().getJwtToken(),
            id_token: session.getIdToken().getJwtToken(),
            refresh_token: session.getRefreshToken().getToken(),
            expires_in: session.getAccessToken().getExpiration(),
            token_type: 'Bearer',
          };

          this.tokenService.setAuthData(authData);

          observer.next(this.cognitoUser!);
          observer.complete();
        });
      });
    });
  }

  getTokenFromLink(linkData: { code: string }): Observable<AuthResponse> {
    return new Observable((observer) => {
      // First, fetch the configuration
      this.configService.getConfig().subscribe(
        (config) => {
          this.userPoolId = config.user_pool;
          this.clientId = config.portal_client_id;

          console.log(
            'pool id: ',
            this.userPoolId,
            'client id ',
            this.clientId
          );
          const urlEndpoint =
            this.checkMagiLink +
            `?code=${encodeURIComponent(linkData.code)}&client_id=${
              this.clientId
            }`;

          // Now, make the request to get the token
          this.http
            .get<AuthResponse>(`${this.apiUrl}${urlEndpoint}`, {})
            .pipe(
              tap((result) => {
                const authData: AuthResponse = {
                  access_token: result.access_token,
                  id_token: result.id_token,
                  refresh_token: result.refresh_token,
                  expires_in: result.expires_in,
                  token_type: result.token_type,
                };

                this.tokenService.setAuthData(authData);
                // Decode the token using TokenService
                const decodedToken = this.tokenService.decodeToken(
                  result.access_token
                );
                const username = decodedToken.username; // Use 'username' as email

                const userPool = new CognitoUserPool({
                  UserPoolId: this.userPoolId!,
                  ClientId: this.clientId!,
                });

                this.cognitoUser = new CognitoUser({
                  Username: username,
                  Pool: userPool,
                });
                console.log(
                  'Configuración del user cognito:',
                  this.cognitoUser
                );

                // Send the result to the observer
                observer.next(authData);
                observer.complete();
              }),
              catchError((error) => {
                console.error('Error during magic link process:', error);
                observer.error(error); // Pass the error to the observer so it can be caught in subscribe
                return of(null); // Handle the error gracefully
              })
            )
            .subscribe();
        },
        (error) => {
          console.error('Error fetching configuration:', error);
          observer.error(error); // Pass the error if config fetching fails
        }
      );
    });
  }

  getTokenFromParent(): Observable<AuthResponse> {
    return new Observable((observer) => {
      // Flag to track if the token has been processed
      let isTokenProcessed = false;

      // Function to handle the message event
      const handleMessage = (event: MessageEvent) => {
        if (event.data.action === 'deliverToken' && event.data.authData) {
          const authData: AuthResponse = toSnakeCaseKeys(event.data.authData);

          // Validate if the token is valid
          if (authData && authData.access_token) {
            // Check if the token is expired
            if (this.tokenService.isTokenExpired(authData.access_token)) {
              console.error('Token has expired');
              console.log('Attempting to redirect to /invalid-token');

              // Mark the token as processed
              isTokenProcessed = true;

              // Remove the event listener to prevent further processing
              window.removeEventListener('message', handleMessage);

              // Redirect to /invalid-token
              this.router
                .navigate(['/invalid-token'])
                .then((success) => {
                  if (success) {
                    console.log('✅ Successfully redirected to /invalid-token');
                  } else {
                    console.error('❌ Failed to redirect to /invalid-token');
                    // Fallback to window.location.href if router.navigate fails
                    window.location.href = '/invalid-token';
                  }
                })
                .catch((error) => {
                  console.error('Error during redirection:', error);
                  // Fallback to window.location.href if router.navigate fails
                  window.location.href = '/invalid-token';
                });

              observer.error('Token has expired');
              return; // Stop further execution
            }

            // Token is valid, proceed with setting up the user
            this.tokenService.setAuthData(authData);
            this.authDataSubject.next(authData);

            const decodedToken = this.tokenService.decodeToken(
              authData.access_token
            );
            const username = decodedToken.username;

            console.log('user pool : ', this.userPoolId);
            console.log('ClientId : ', this.clientId);
            const userPool = new CognitoUserPool({
              UserPoolId: this.userPoolId!,
              ClientId: this.clientId!,
            });

            this.cognitoUser = new CognitoUser({
              Username: username,
              Pool: userPool,
            });

            console.log('Token received and configured');
            // this.router.navigateByUrl('/app');

            // Mark the token as processed
            isTokenProcessed = true;

            // Remove the event listener to prevent further processing
            window.removeEventListener('message', handleMessage);

            observer.next(authData);
            observer.complete();
          } else {
            console.error('Invalid token format:', authData);
            observer.error('Invalid token format');
          }
        }
      };

      // Add the event listener
      window.addEventListener('message', handleMessage);

      // Send a message to the parent to request the token
      window.parent.postMessage({ action: 'requestToken' }, '*');

      // Cleanup logic for the Observable
      return () => {
        // Remove the event listener when the Observable is unsubscribed
        window.removeEventListener('message', handleMessage);
      };
    });
  }

  resetPassword(credentials: {
    newPassword: string;
    confirmPassword: string;
  }): Observable<any> {
    const url = `${this.apiUrl}/public/wibond-connect/user/auth/reset_password`; // URL de tu backend
    const authData = this.tokenService.getAuthDataOTP();

    if (authData) {
      // Crear los headers, incluyendo el token de autorización y el Wibond-Id
      const headers = new HttpHeaders({
        Authorization: `Bearer ${authData.id_token_otp}`,
        'Content-Type': 'application/json',
        'Wibond-Id': `${authData.id_token_otp}`, // Aquí agregamos el Wibond-Id con el id_token
      });

      // Crear el cuerpo de la solicitud
      const body = {
        newPassword: credentials.newPassword,
      };

      // Realizar el POST al backend
      return this.http.post<any>(url, body, { headers }).pipe(
        tap((response) => {
          // Emit the response back to the observer caller instead of navigating.
        }),
        catchError((error) => {
          console.error('Error configurando nueva contraseña:', error);
          return throwError(
            () => new Error('Error en la creación de nueva contraseña')
          );
        })
      );
    } else {
      return throwError(() => new Error('Error en la autenticación por OTP'));
    }
  }
  // Método para obtener el token
  // getToken(): Observable<string> {
  //   /* return this.authDataSubject.pipe(
  //     switchMap((authData) => {
  //       if (authData && authData.access_token) {
  //         return of(authData.access_token);
  //       } else {
  //         return throwError('No token available');
  //       }
  //     })
  //   ); */
  //   const authDataString = sessionStorage.getItem('auth_data'); // Obtener el string del localStorage
  //   if (authDataString) {
  //     const authData = JSON.parse(authDataString); // Parsear el string JSON
  //     // Ahora puedes acceder a la propiedad "access_token"
  //     return of(authData.access_token); // Retornar la propiedad que necesitas
  //   } else {
  //     return throwError('No token available'); // O manejar el caso en que no haya auth_data
  //   }
  // }

  // Método para obtener el ID token
  getIdToken(): Observable<string> {
    // Obtener el string del localStorage
    const authDataString = sessionStorage.getItem('auth_data');

    if (authDataString) {
      const authData = JSON.parse(authDataString); // Parsear el string JSON
      // Verificar el valor del id_token

      if (authData.id_token) {
        return of(authData.id_token); // Retornar la propiedad id_token si existe
      } else {
        return throwError('No ID token available'); // Si no existe el id_token
      }
    } else {
      return throwError('No token available'); // O manejar el caso en que no haya auth_data
    }
  }

  isAuthenticated(): Observable<boolean> {
    console.log('Verificando autenticación...');
    let authData = this.tokenService.getAuthData(); // Fetch token data from cookies

    // 1️⃣ Check if authData is available and token is still valid
    if (authData && authData.access_token) {
      console.log('AuthData disponible');
      if (!this.tokenService.isTokenExpired(authData.access_token)) {
        return of(true); // Token is valid, user is authenticated
      }

      console.log('Token expirado, intentando refrescar...');
      return this.refreshToken().pipe(
        map((newTokens) => {
          console.log('Tokens refrescados exitosamente:', newTokens);
          return true; // Successfully refreshed, user remains authenticated
        }),
        catchError((err) => {
          console.error('Error al refrescar el token, cerrando sesión...', err);
          this.logoutUser();
          return of(false);
        })
      );
    }

    // 2️⃣ If authData is missing, check if running inside an iframe
    if (window.self !== window.top) {
      console.log(
        'No hay authData, estamos en un iframe, solicitando token del parent.'
      );

      return new Observable((observer) => {
        this.getTokenFromParent().subscribe(
          (authData) => {
            console.log('Token recibido desde el parent (iframe):', authData);
            observer.next(true); // El usuario está autenticado si recibimos el token
            observer.complete();
          },
          (error) => {
            console.error('Error obteniendo el token desde el parent:', error);
            observer.next(false); // No autenticado si no podemos obtener el token
            observer.complete();
          }
        );
      });
    }

    // 3️⃣ If not inside an iframe, check if refresh_token exists
    const refreshToken = this.cookieService.getCookie('refresh_token');
    if (refreshToken) {
      console.log(
        'AuthData no disponible, pero hay refresh_token. Intentando refrescar...'
      );
      return this.refreshToken().pipe(
        map((newTokens) => {
          console.log('Tokens refrescados exitosamente:', newTokens);
          return true; // Successfully refreshed, user remains authenticated
        }),
        catchError((err) => {
          console.error('Error al refrescar el token, cerrando sesión...', err);
          this.logoutUser();
          return of(false);
        })
      );
    }

    // 4️⃣ No access_token, no refresh_token, and not in an iframe → User is not authenticated
    console.log('No hay authData ni refresh_token, usuario no autenticado.');
    return of(false);
  }

  // Method to check if the password is completed
  isPasswordCompleted(): boolean {
    return this.passwordCompleted;
    //return true;
  }

  restartPasswordCompleted(): void {
    this.passwordCompleted = false;
    //console.log('state: ', RegisterSteps.SET_PASSWORD);
    this.router.navigate(['/auth/register'], {
      state: { currentStep: RegisterSteps.SET_PASSWORD },
    });
  }
  getEmail(): string | null {
    const authData = this.tokenService.getAuthData();
    if (authData && authData.id_token) {
      const decodedToken = this.tokenService.decodeToken(authData.id_token);
      if (decodedToken && decodedToken.email) {
        return decodedToken.email;
      }
    }
    return null;
  }

  private initializeCognitoUser(): Observable<CognitoUser> {
    console.log('initializing cognito user....');
    return new Observable((observer) => {
      this.storeDataService.getStore().subscribe((store) => {
        const storedCognitoUser = store.cognitoUser;

        if (storedCognitoUser) {
          console.log('Using stored cognitoUser:', storedCognitoUser);

          //this.setupCognitoUserSession(authData);

          observer.next(storedCognitoUser);
          observer.complete();
        } else {
          // If no cognitoUser in the store, generate a new one
          this.createCognitoUser().subscribe({
            next: (cognitoUser) => {
              observer.next(cognitoUser);
              observer.complete();
            },
            error: (error) => observer.error(error),
          });
        }
      });
    });
  }

  private createCognitoUser(): Observable<CognitoUser> {
    return new Observable((observer) => {
      this.configService.getConfig().subscribe((config) => {
        if (!config) {
          observer.error('Configuration is missing');
          return;
        }

        this.userPoolId = config.user_pool;
        this.clientId = config.portal_client_id;

        console.log('Initialized data:', this.userPoolId, this.clientId);
        const authData = this.tokenService.getAuthData();
        if (!authData) {
          observer.error('No authentication data found');
          return;
        }
        console.log('Auth data:', authData);

        const decodedToken = this.tokenService.decodeToken(
          authData.access_token
        );
        const username = decodedToken?.username;
        console.log('Username:', username);
        if (!username) {
          observer.error('Failed to decode token or username not found');
          return;
        }
        const userPool = new CognitoUserPool({
          UserPoolId: this.userPoolId!,
          ClientId: this.clientId!,
        });

        this.cognitoUser = new CognitoUser({
          Username: username,
          Pool: userPool,
        });

        this.setupCognitoUserSession(authData);

        // Store the newly created cognitoUser in StoreDataService
        this.storeDataService.updateStore({
          cognitoUser: this.cognitoUser,
        });

        // Add a delay before using the session to list devices
        // this.listDevicesWithDelay();

        observer.next(this.cognitoUser!);
        observer.complete();
      });
    });
  }

  private setupCognitoUserSession(authData: AuthResponse): void {
    const accessToken = new CognitoAccessToken({
      AccessToken: authData.access_token,
    });
    const idToken = new CognitoIdToken({ IdToken: authData.id_token });
    const refreshToken = new CognitoRefreshToken({
      RefreshToken: authData.refresh_token,
    });

    const cognitoUserSession = new CognitoUserSession({
      IdToken: idToken,
      AccessToken: accessToken,
      RefreshToken: refreshToken,
    });

    this.cognitoUser!.setSignInUserSession(cognitoUserSession);
    console.log('session: ', cognitoUserSession);
    console.log('cognito User: ', this.cognitoUser!);

    // Check if the session is set properly
    console.log('Updated Session: ', this.cognitoUser!.getSignInUserSession());
  }
  // Helper method to initialize the CognitoUser if it’s not set

  // List devices method
  public listActiveDevices(
    limit: number = 10,
    paginationToken: string | null = null
  ): Observable<any> {
    console.log('list active devices....');
    return new Observable((observer) => {
      // Check if the user is authenticated (and refresh token if necessary)
      this.isAuthenticated().subscribe({
        next: (isAuthenticated) => {
          if (!isAuthenticated) {
            // If not authenticated, throw an error
            observer.error('User is not authenticated');
            return;
          }

          // User is authenticated, proceed to initialize Cognito user
          this.initializeCognitoUser().subscribe({
            next: (cognitoUser) => {
              console.log('cognito user: ', cognitoUser);

              // List devices
              cognitoUser.listDevices(limit, paginationToken, {
                onSuccess: (result) => {
                  console.log('Devices:', result.Devices);
                  // Pass the devices list and pagination token to the observer
                  observer.next({
                    devices: result.Devices,
                    paginationToken: result.PaginationToken,
                  });
                  observer.complete();
                },
                onFailure: (error) => {
                  console.error('Failed to list devices:', error);
                  observer.error(error);
                },
              });
            },
            error: (err) => observer.error(err),
          });
        },
        error: (err) => {
          console.error('Authentication check failed:', err);
          observer.error(err);
        },
      });
    });
  }

  public logoutCognitoDevice(deviceKey: string): Observable<void> {
    return new Observable((observer) => {
      this.isAuthenticated().subscribe({
        next: (isAuthenticated) => {
          if (!isAuthenticated) {
            // If not authenticated, throw an error
            observer.error('User is not authenticated');
            return;
          }

          // User is authenticated, proceed to initialize Cognito user
          this.initializeCognitoUser().subscribe({
            next: (cognitoUser) => {
              console.log('cognito user: ', cognitoUser);

              cognitoUser.forgetSpecificDevice(deviceKey, {
                onSuccess: () => {
                  console.log(
                    `Successfully logged out from device: ${deviceKey}`
                  );

                  observer.next();
                  observer.complete();
                },
                onFailure: (err: any) => {
                  console.error('Failed to log out from the device:', err);
                  observer.error(err);
                },
              });
            },
            error: (err) => observer.error(err),
          });
        },
        error: (err) => {
          console.error('Authentication check failed:', err);
          observer.error(err);
        },
      });
    });
  }

  /**
   * Logs out the user by clearing authentication data and redirecting to the login page.
   */

  logoutUser(): void {
    const isIframe = this.storeDataService.checkIframe();

    this.snackBarService.close();
    this.sessionManagementService.stopInactivityMonitoring();
    this.sessionManagementService.stopTokenExpirationMonitoring();
    if (isIframe) {
      console.log(
        '🖼️ Iframe mode detected, showing session expired message...'
      );
      this.router.navigate(['/auth/pin-validation']);
      return;
    }
    // Clear authentication cookies
    this.cookieService.deleteCookie('access_token');
    this.cookieService.deleteCookie('id_token');
    this.cookieService.deleteCookie('refresh_token');
    this.cookieService.deleteCookie('username');
    // Clear other session data if applicable
    sessionStorage.removeItem('auth_data');
    localStorage.clear();
    this.router.navigate(['/auth/login']);
  }

  public logoutAllDevices(): Observable<any> {
    const logoutAllUrl = `${this.apiUrl}/public/wibond-connect/user/auth/global-sign-out`;
    const authData = this.tokenService.getAuthData();

    if (this.isAuthenticated() && authData) {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${authData.access_token}`,
        'Content-Type': 'application/json',
        'Wibond-Id': `${authData.id_token}`,
      });

      // Step 1: Forget all devices
      return this.forgetAllDevices().pipe(
        switchMap(() => {
          // Step 2: Perform global sign-out (revoke all tokens)
          return this.http.post<any>(logoutAllUrl, {}, { headers });
        }),
        tap(() => {
          console.log('All devices forgotten and sessions logged out');
        }),
        catchError((error) => {
          console.error(
            'Error during forgetting devices or global sign-out:',
            error
          );
          return throwError(() => new Error('Error during global sign-out'));
        })
      );
    } else {
      return throwError(() => new Error('User not authenticated'));
    }
  }

  public forgetAllDevices(): Observable<void> {
    return new Observable((observer) => {
      this.listActiveDevices(60).subscribe({
        next: (result) => {
          const devices = result.devices;
          if (devices.length === 0) {
            observer.next(); // No devices to forget
            observer.complete();
            return;
          }

          // Forget each device
          const forgetDeviceObservables = devices.map((device: any) => {
            return new Observable<void>((deviceObserver) => {
              this.cognitoUser!.forgetSpecificDevice(device.DeviceKey, {
                onSuccess: () => {
                  console.log(`Forgot device: ${device.DeviceKey}`);
                  deviceObserver.next();
                  deviceObserver.complete();
                },
                onFailure: (err) => {
                  console.error(
                    `Failed to forget device: ${device.DeviceKey}`,
                    err
                  );
                  deviceObserver.error(err);
                },
              });
            });
          });

          // Wait for all devices to be forgotten
          forkJoin(forgetDeviceObservables).subscribe({
            next: () => {
              observer.next();
              observer.complete();
            },
            error: (err) => {
              observer.error(err);
            },
          });
        },
        error: (err) => {
          observer.error(err);
        },
      });
    });
  }
}
