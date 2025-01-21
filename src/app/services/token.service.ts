import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthResponse } from './auth.service';
import { jwtDecode } from 'jwt-decode';
import { CookieService } from './cookie.service';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  constructor(private router: Router, private cookieService: CookieService) {}

  /**
   * Stores authentication data in cookies
   */
  setAuthData(authData: AuthResponse): void {
    // Store tokens in cookies with appropriate expiration
    this.cookieService.setCookie('access_token', authData.access_token, 1); // 1 day
    this.cookieService.setCookie('id_token', authData.id_token, 1); // 1 day
    this.cookieService.setCookie('refresh_token', authData.refresh_token, 7); // 7 days

    this.cleanUrl();
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
}
