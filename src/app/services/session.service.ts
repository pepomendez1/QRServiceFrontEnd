import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from './cookie.service';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  constructor(private router: Router, private cookieService: CookieService) {}

  /**
   * Logs out the user by clearing cookies and session data, then redirects to login.
   */
  logoutUser(): void {
    console.log('Logging out user...');
    this.cookieService.deleteCookie('access_token');
    this.cookieService.deleteCookie('id_token');
    this.cookieService.deleteCookie('refresh_token');
    sessionStorage.removeItem('auth_data');
    this.router.navigate(['/auth']);
  }
}
