import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class BankAccountService {
  private bankAccountEndpoint = '/public/wibond-connect/bank-account';

  constructor(private apiService: ApiService) {}

  /**
   * Método para obtener la información de la cuenta bancaria
   * @param userAccountId El ID de la cuenta del usuario
   * @returns Un observable con la información de la cuenta bancaria
   */
  getAccount(userAccountId: string): Observable<any> {
    // Generamos la URL con los parámetros de la cuenta
    const params = `user_account_id=${userAccountId}`;

    // Realizamos la petición a la API
    return this.apiService.get<any>(`${this.bankAccountEndpoint}/account?${params}`);
  }
}
