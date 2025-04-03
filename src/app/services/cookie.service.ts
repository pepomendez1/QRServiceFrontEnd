import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class CookieService {
  /**
   * Retorna true si el script se ejecuta dentro de un iframe.
   */
  private isInIframe(): boolean {
    return window.self !== window.top;
  }

  /**
   * Genera la cadena de opciones para la cookie según si se está en un iframe o no.
   * - En iframe: Usa SameSite=None.
   * - Fuera de iframe: Usa SameSite=Strict.
   *
   * Nota: Esta función ya **no** incluye el atributo path, para evitar duplicación.
   */
  private getCookieOptions(): string {
    let options = 'Secure; ';

    if (this.isInIframe()) {
      options += 'SameSite=None; Partitioned;';
    } else {
      options += 'SameSite=Strict;';
    }

    return options.trim();
  }

  /**
   * Establece una cookie con expiración en días.
   * @param name Nombre de la cookie.
   * @param value Valor de la cookie.
   * @param days Tiempo de expiración en días.
   */
  setCookie(name: string, value: string, days: number): void {
    let expires = '';
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = `; expires=${date.toUTCString()}`;
    }
    // Se añade explícitamente el path y luego las opciones restantes.
    document.cookie = `${name}=${
      value || ''
    }${expires}; path=/; ${this.getCookieOptions()}`;
  }

  /**
   * Establece una cookie con expiración basada en el claim `exp` de un JWT.
   * @param name Nombre de la cookie.
   * @param token JWT que contiene el claim `exp`.
   */
  setCookieWithTokenExpiration(name: string, token: string): void {
    try {
      // Decodifica el token para obtener el tiempo de expiración
      const decodedToken: { exp: number } = jwtDecode(token);

      // Calcula la expiración en milisegundos
      const expirationTime = decodedToken.exp * 1000; // `exp` en segundos
      const currentTime = Date.now();
      const timeLeft = expirationTime - currentTime; // Tiempo restante en milisegundos

      if (timeLeft > 0) {
        const expiresDate = new Date(currentTime + timeLeft);
        document.cookie = `${name}=${token}; expires=${expiresDate.toUTCString()}; path=/; ${this.getCookieOptions()}`;
        console.log(
          `${name} cookie set to expire at ${expiresDate.toUTCString()}.`
        );
      } else {
        console.error(`Token for ${name} is already expired.`);
      }
    } catch (error) {
      console.error(`Invalid token for ${name}:`, error);
    }
  }

  /**
   * Recupera el valor de una cookie.
   * @param name Nombre de la cookie.
   * @returns Valor de la cookie o null si no existe.
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
   * Elimina una cookie por su nombre.
   * @param name Nombre de la cookie.
   */
  deleteCookie(name: string): void {
    // Se añade explícitamente el path y luego las opciones restantes.
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/; ${this.getCookieOptions()}`;
  }
}
