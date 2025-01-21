// cookie.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root', // This makes it available globally
})
export class CookieService {
  /**
   * Establecer una cookie
   * @param name Nombre de la cookie
   * @param value Valor de la cookie
   * @param days Tiempo de expiración en días
   */
  setCookie(name: string, value: string, days: number): void {
    let expires = '';
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = `; expires=${date.toUTCString()}`;
    }
    document.cookie = `${name}=${
      value || ''
    }${expires}; path=/; Secure; SameSite=Strict`;
  }

  /**
   * Obtener el valor de una cookie
   * @param name Nombre de la cookie
   * @returns Valor de la cookie o null si no existe
   */
  getCookie(name: string): string | null {
    const nameEQ = `${name}=`;
    const cookiesArray = document.cookie.split(';');
    for (let i = 0; i < cookiesArray.length; i++) {
      let cookie = cookiesArray[i].trim();
      if (cookie.indexOf(nameEQ) === 0) {
        return cookie.substring(nameEQ.length, cookie.length);
      }
    }
    return null;
  }

  /**
   * Eliminar una cookie
   * @param name Nombre de la cookie
   */
  deleteCookie(name: string): void {
    document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; Secure; SameSite=Strict`;
  }
}
