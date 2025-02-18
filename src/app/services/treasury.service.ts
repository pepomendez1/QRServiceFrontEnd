import { Injectable } from '@angular/core';
import { catchError, finalize, map, Observable, throwError } from 'rxjs';
import { ApiService } from './api.service';
import { CookieService } from './cookie.service';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root',
})
export class TreasuryService {
  private endpoint = '/public/wibond-connect/treasury';
  private bankAccountEndpoint = '/public/wibond-connect/bank-account';

  constructor(
    private tokenService: TokenService,
    private apiService: ApiService
  ) {}

  /**
   * Método para obtener el saldo de la cuenta
   * @returns Un observable con el balance de la cuenta.
   */
  getBalance(): Observable<any> {
    return this.apiService.get<any>(`${this.endpoint}/account`);
  }

  /**
   * Método para obtener lista de contactos del usuario
   * @returns Un observable con la lista de contactos.
   */
  getContacts(): Observable<any> {
    return this.apiService.get<any>(`${this.endpoint}/account/contacts`).pipe(
      map((response: any) => {
        const uniqueContacts = new Map();
        response.contacts.forEach((contact: any) => {
          uniqueContacts.set(contact.id, contact);
        });
        return { contacts: Array.from(uniqueContacts.values()) };
      })
    );
  }

  /**
   * Método para eliminar un contacto de la lista de contactos de un usuario
   * @returns Un observable con la respuesta de la eliminación.
   */
  deleteContact(contactId: number): Observable<any> {
    const endpoint = `${this.endpoint}/account/contacts`;
    const body = { contact_id: contactId };
    return this.apiService.delete<any>(endpoint, body);
  }

  /**
   * Método para agregar un contacto de la lista de favoritos de un usuario
   * @returns Un observable con la respuesta de la acción.
   */
  toggleFavoriteContact(
    contactId: number,
    favoriteStatus: boolean
  ): Observable<any> {
    const endpoint = `${this.endpoint}/account/favorites`;
    const body = { contact_id: contactId, favorite: favoriteStatus };
    return this.apiService.put<any>(endpoint, body);
  }

  /**
   * Método para validar una cuenta
   * @returns Un observable con la información de la cuenta si es válida.
   */
  getAccountOwner(alias_cvu: string): Observable<any> {
    return this.apiService.get<any>(
      `${this.bankAccountEndpoint}/account/owner?alias_cvu=${alias_cvu}`
    );
  }

  /**
   * Método para realizar una transferencia
   * @param data Los datos de la transferencia
   * @returns Un observable con la respuesta de la transferencia.
   */
  // Emulate error transfer
  // makeTransfer(data: any): Observable<any> {
  //   return throwError(() => new Error('Error en la transferencia'));
  // }

  makeTransfer(data: any): Observable<any> {
    console.log('Transfiriendo .... ', data);

    return this.apiService
      .post<any>(`${this.endpoint}/cash-out`, data, false, true)
      .pipe(
        catchError((error) => {
          console.error('Error en la transferencia:', error);

          // Return a formatted error response
          return throwError(
            () => new Error('Error al realizar la transferencia.')
          );
        }),
        finalize(() => {
          console.log('Finalizando transferencia: Eliminando cookies OTP');
          this.tokenService.removeOTPcookies(); // Ensures OTP cookies are always removed
        })
      );
  }

  /**
   * Método para obtener las transacciones de la cuenta
   * @returns Un observable con las transacciones.
   */
  getTransactions(): Observable<any> {
    return this.apiService.get<any>(`${this.endpoint}/account/movements`);
  }

  /**
   * Método para obtener las transacciones de la cuenta por periodo
   * @param period El periodo de las transacciones
   * @returns Un observable con las transacciones.
   */
  getTransactionsByPeriod(period: string): Observable<any> {
    const params = `filter=${period}`;
    return this.apiService.get<any>(
      `${this.endpoint}/account/movements?${params}`
    );
  }

  /**
   * Método para obtener los detalles de una transacción por ID
   * @param id El ID de la transacción
   * @returns Un observable con los detalles de la transacción.
   */
  getTransactionsDetailById(id: string): Observable<any> {
    const params = `movement_id=${id}`;
    return this.apiService.get<any>(
      `${this.endpoint}/account/movements/detail?${params}`
    );
  }

  /**
   * Método para cambiar el alias
   * @param data Los datos para el cambio de alias
   * @returns Un observable con la respuesta de la operación.
   */
  updateAlias(data: any): Observable<any> {
    return this.apiService.put<any>(`${this.endpoint}/account/alias`, data);
  }
}
