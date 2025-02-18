import { Injectable } from '@angular/core';
import { catchError, finalize, map, Observable, throwError } from 'rxjs';
import { ApiService } from './api.service';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root',
})
export class InvoiceService {
  // TODO: cambiar flag de mock data para probar con datos reales
  private useMockData: boolean = true;
  //TODO: cambiar por el endpoint correcto
  private endpoint = '/public/wibond-connect/invoice';

  constructor(private apiService: ApiService) {}

  /**
   * Método para obtener el todas las facturas
   * @returns un observable con las facturas.
   */
  getInvoices(): Observable<any> {
    return this.apiService.get<any>(`${this.endpoint}`);
  }
}
