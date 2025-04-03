import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthResponse, AuthResponseOTP } from './auth.service';
import { jwtDecode } from 'jwt-decode';
import { CookieService } from './cookie.service';
import { AuthDataOTP } from './otp.service';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  constructor(private router: Router, private cookieService: CookieService) {}

  /**
   * Stores authentication data in cookies
   */
  setAuthData(authData: AuthResponse): void {
    console.log('auth data : ', authData);
    // Store tokens in cookies with appropriate expiration
    this.cookieService.setCookieWithTokenExpiration(
      'access_token',
      authData.access_token
    ); // 1 day
    this.cookieService.setCookieWithTokenExpiration(
      'id_token',
      authData.id_token
    ); // 1 day
    this.cookieService.setCookie('refresh_token', authData.refresh_token, 1); // 1 days expiration

    this.cleanUrl();
  }

  setAuthDataOtp(authData: AuthDataOTP): void {
    console.log('auth data : ', authData);
    // Store tokens in cookies with appropriate expiration
    this.cookieService.setCookieWithTokenExpiration(
      'access_token_otp',
      authData.access_token_otp
    );
    this.cookieService.setCookieWithTokenExpiration(
      'id_token_otp',
      authData.id_token_otp
    );
  }

  /**
   * Removes the `code` query parameter from the URL
   */
  cleanUrl(): void {
    const currentUrl = this.router.url;
    if (currentUrl.includes('code')) {
      this.router.navigate([], {
        queryParams: { code: null },
        queryParamsHandling: 'merge',
      });
      console.log('Cleaned URL by removing code parameter');
    }
  }

  /**
   * Retrieves authentication data from cookies.
   */
  getAuthData(): AuthResponse | null {
    const accessToken = this.cookieService.getCookie('access_token');
    const idToken = this.cookieService.getCookie('id_token');
    const refreshToken = this.cookieService.getCookie('refresh_token');

    if (accessToken && idToken && refreshToken) {
      return {
        access_token: accessToken,
        id_token: idToken,
        refresh_token: refreshToken,
        // expires_in: null, // Managed by cookie expiration
        token_type: 'Bearer', // Default type
      };
    }

    return null;
  }

  getAuthDataOTP(): AuthResponseOTP | null {
    const accessToken = this.cookieService.getCookie('access_token_otp');
    const idToken = this.cookieService.getCookie('id_token_otp');

    if (accessToken && idToken) {
      return {
        access_token_otp: accessToken,
        id_token_otp: idToken,
        // expires_in: null, // Managed by cookie expiration
        token_type: 'Bearer', // Default type
      };
    }

    return null;
  }

  /**
   * Retrieves a specific token from cookies.
   * @param name The name of the token to retrieve (e.g., 'access_token', 'id_token', 'refresh_token').
   * @returns The token value or null if not found.
   */
  getToken(name: string): string | null {
    const token = this.cookieService.getCookie(name);
    if (!token) {
      console.warn(`Token "${name}" not found in cookies.`);
    }
    // console.log('token requested ... ', name, 'token returned: ', token);
    // const accessToken = this.cookieService.getCookie('access_token');
    // const idToken = this.cookieService.getCookie('id_token');
    // const refreshToken = this.cookieService.getCookie('refresh_token');
    // const username = this.cookieService.getCookie('username');

    // console.log(
    //   'coookiesss ..... ',
    //   accessToken,
    //   '  ',
    //   idToken,
    //   '  ',
    //   refreshToken,
    //   '  ',
    //   username
    // );
    return token;
  }

  /**
   * Decodes a JWT token.
   */
  decodeToken(token: string): any {
    try {
      return jwtDecode(token);
    } catch (e) {
      console.error('Invalid token', e);
      return null;
    }
  }

  /**
   * Checks if a token is expired.
   */
  isTokenExpired(token: string): boolean {
    const decodedToken = this.decodeToken(token);
    if (!decodedToken) {
      return true;
    }
    const exp = decodedToken.exp;
    const currentTime = Math.floor(Date.now() / 1000);
    return currentTime >= exp;
  }

  /**
   * Removes authentication data by clearing cookies.
   */
  removeAuthData(): void {
    this.cookieService.deleteCookie('access_token');
    this.cookieService.deleteCookie('id_token');
    this.cookieService.deleteCookie('refresh_token');
  }
  /**
   * Retrieves and decodes the access token from cookies.
   */
  getDecodedToken(): any {
    const accessToken = this.cookieService.getCookie('access_token');
    if (accessToken) {
      return this.decodeToken(accessToken);
    }
    return null;
  }
  /**
   * Retrieves authentication data from cookies for compatibility.
   */
  getStoredAuthData(): AuthResponse | null {
    return this.getAuthData();
  }

  removeOTPcookies(): void {
    this.cookieService.deleteCookie('access_token_otp');
    this.cookieService.deleteCookie('id_token_otp');
  }
}
