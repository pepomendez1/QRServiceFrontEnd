import { Injectable } from '@angular/core';
import { catchError, finalize, map, Observable, throwError } from 'rxjs';
import { ApiService } from './api.service';
import { CookieService } from './cookie.service';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root',
})
export class InsuranceService {
  private endpoint = '/public/wibond-connect/insurance';

  constructor(
    private tokenService: TokenService,
    private apiService: ApiService
  ) {}

  /**
   * Método para obtener los contratos de seguros de la cuenta
   * @returns Un observable con los contratos.
   */
  getContracts(): Observable<any> {
    return this.apiService.get<any>(`${this.endpoint}`);
  }
}
