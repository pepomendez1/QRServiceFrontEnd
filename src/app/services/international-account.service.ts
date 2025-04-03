import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class InternationalAccountService {
  private useMockData: boolean = true;
  private endpoint = '/public/wibond-connect/international-account';

  // ✅ Mock Account Data
  mockAccount: any = {
    user_account_id: 151,
    balance: 1000,
    status: 'active',
    accounts: [
      {
        id: 87,
        cvu: '1572876217728758017251',
        alias: 'TEST.123456',
      },
    ],
  };

  //  Mock Operations Data
  private mockOperations: any[] = [
    {
      id: 485,
      type: 'cash_out',
      amount: 100,
      description: 'Dinero enviado',
      balance: 1000,
      currency: 'USD',
      source: 'transfer',
      status: 'processing',
      created_at: '2025-01-31T19:48:27.892Z',
      updated_at: '2025-01-31T19:48:29.982Z',
      contact_name: 'Diaz, Bruno',
    },
    {
      id: 471,
      type: 'cash_out',
      amount: 100,
      description: 'Dinero Enviado',
      balance: 1100,
      currency: 'USD',
      source: 'transfer',
      status: 'processed',
      created_at: '2025-01-30T21:22:36.566Z',
      updated_at: '2025-01-30T21:22:37.979Z',
      contact_name: 'Parker, Peter',
    },
    {
      id: 445,
      type: 'cash_in',
      amount: 200,
      description: 'Pago recibido',
      balance: 1200,
      currency: 'USD',
      source: 'transfer',
      status: 'processed',
      created_at: '2025-01-27T00:53:53.968Z',
      updated_at: '2025-01-27T00:53:54.597Z',
      contact_name: 'Stark, Tony',
    },
    {
      id: 444,
      type: 'cash_in',
      amount: 126.3,
      description: 'Pago recibido',
      balance: 1326.3,
      currency: 'USD',
      source: 'transfer',
      status: 'processed',
      created_at: '2025-01-20T00:53:53.968Z',
      updated_at: '2025-01-20T00:53:54.597Z',
      contact_name: 'Stark, Tony',
    },
    {
      id: 443,
      type: 'cash_in',
      amount: 352.5,
      description: 'Pago recibido',
      balance: 1678.8,
      currency: 'USD',
      source: 'transfer',
      status: 'processed',
      created_at: '2025-01-18T00:53:53.968Z',
      updated_at: '2025-01-18T00:53:54.597Z',
      contact_name: 'Díaz, Bruno',
    },
    {
      id: 442,
      type: 'cash_out',
      amount: 286.2,
      description: 'Dinero enviado',
      balance: 1392.6,
      currency: 'USD',
      source: 'transfer',
      status: 'rejected',
      created_at: '2025-01-18T00:53:53.968Z',
      updated_at: '2025-01-18T00:53:54.597Z',
      contact_name: 'Parker, Peter',
    },
    {
      id: 441,
      type: 'cash_in',
      amount: 600,
      description: 'Pago recibido',
      balance: 1992.6,
      currency: 'USD',
      source: 'transfer',
      status: 'processed',
      created_at: '2024-12-10T00:53:53.968Z',
      updated_at: '2024-12-10T00:53:54.597Z',
      contact_name: 'Parker, Peter',
    },
  ];

  mockDataContacts: any[] = [
      {
        id: 3,
        name: 'Parker, Peter',
        accountNumber: '3220001805000040970014',
        initials: '',
        bank_name: 'BANCO INDUSTRIAL S.A.',
        additional_info: '',
        favorite: true,
        currency: 'USD',
        country: 'USA',
      },
      {
        id: 4,
        name: 'Stark, Tony',
        accountNumber: '3220004782023055910025',
        initials: '',
        bank_name: 'BANCO INDUSTRIAL S.A.',
        additional_info: '',
        favorite: false,
        currency: 'ARS',
        country: 'Argentina',
      },
      {
        id: 2,
        name: 'Diaz, Bruno',
        accountNumber: '3220001823000055910025',
        initials: '',
        bank_name: 'BANCO INDUSTRIAL S.A.',
        additional_info: '',
        favorite: false,
        currency: 'USD',
        country: 'USA',
      },
      {
        id: 5,
        name: 'Rogers, Steve',
        accountNumber: '3220001823000099776025',
        initials: '',
        bank_name: 'BANCO INDUSTRIAL S.A.',
        additional_info: '',
        favorite: false,
        currency: 'ARS',
        country: 'Argentina',
      },
      {
        id: 6,
        name: 'Grimm, Ben',
        accountNumber: '3220001823765455910025',
        initials: '',
        bank_name: 'BANCO INDUSTRIAL S.A.',
        additional_info: '',
        favorite: false,
        currency: 'USD',
        country: 'USA',
      },
      {
        id: 7,
        name: 'García, Pepe',
        accountNumber: '3220001823765466910025',
        initials: '',
        bank_name: 'BANCO INDUSTRIAL S.A.',
        additional_info: '',
        favorite: false,
        currency: 'ARS',
        country: 'Argentina',
      },
      {
        id: 8,
        name: 'Perez, Juan',
        accountNumber: '3220001828865455910025',
        initials: '',
        bank_name: 'BANCO INDUSTRIAL S.A.',
        additional_info: '',
        favorite: false,
        currency: 'USD',
        country: 'USA',
      },
      {
        id: 9,
        name: 'Castro, Ana',
        accountNumber: '32200018237654559100012',
        initials: '',
        bank_name: 'BANCO INDUSTRIAL S.A.',
        additional_info: '',
        favorite: false,
        currency: 'ARS',
        country: 'Argentina',
      },
    ];

  constructor(private apiService: ApiService) {}

  /**
   * Método para obtener el saldo de la cuenta
   * @returns Un observable con el balance de la cuenta.
   */
  getBalance(): Observable<any> {
    if (this.useMockData) {
      return new Observable<any>((subscriber) => {
        setTimeout(() => {
          subscriber.next(this.mockAccount);
          subscriber.complete();
        }, 1000);
      });
    } else {
      return this.apiService.get<any>(`${this.endpoint}/account`).pipe(
        catchError((error: any) => {
          console.log(error);
          return throwError(
            () => new Error('Error obteniendo datos de la cuenta')
          );
        })
      );
    }
  }

  /**
   * Método para obtener todas las transacciones de la cuenta
   * @returns Un observable con todas las transacciones.
   */
  getOperations(): Observable<any> {
    if (this.useMockData) {
      return new Observable<any>((subscriber) => {
        setTimeout(() => {
          subscriber.next({ movements: this.mockOperations });
          subscriber.complete();
        }, 1000);
      });
    } else {
      return this.apiService.get<any>(`${this.endpoint}/operations`).pipe(
        catchError((error: any) => {
          console.log(error);
          return throwError(() => new Error('Error obteniendo operaciones'));
        })
      );
    }
  }

    /**
   * Método para obtener todos los contactos de la cuenta
   * @returns Un observable con todos contactos.
   */
    getContacts(): Observable<any> {
      if (this.useMockData) {
        return new Observable<any>((subscriber) => {
          setTimeout(() => {
            subscriber.next({ contacts: this.mockDataContacts });
            subscriber.complete();
          }, 1000);
        });
      } else {
        return this.apiService.get<any>(`${this.endpoint}/contacts`).pipe(
          catchError((error: any) => {
            console.log(error);
            return throwError(() => new Error('Error obteniendo contactos'));
          })
        );
      }
    }


    /**
   * Método para agregar un contacto de la lista de favoritos de un usuario
   * @returns Un observable con la respuesta de la acción.
   */
  toggleFavoriteContact(
    contactId: number,
    favoriteStatus: boolean
  ): Observable<any> {
    if(this.useMockData) {
      return new Observable<any>((subscriber) => {
        setTimeout(() => {
          subscriber.next({ result: true });
          subscriber.complete();
        }, 1000);
      });
    } else {
      const endpoint = `${this.endpoint}/account/favorites`;
      const body = { contact_id: contactId, favorite: favoriteStatus };
      return this.apiService.put<any>(endpoint, body);
    }
  }


  /**
   * Método para eliminar un contacto de la lista de contactos de un usuario
   * @returns Un observable con la respuesta de la eliminación.
   */
  deleteContact(contactId: number): Observable<any> {
    if(this.useMockData) {
      return new Observable<any>((subscriber) => {
        setTimeout(() => {
          subscriber.next({ result: true });
          subscriber.complete();
        }, 1000);
      });
    } else {
      const endpoint = `${this.endpoint}/account/contacts`;
      const body = { contact_id: contactId };
      return this.apiService.delete<any>(endpoint, body);
    }
  }

  /**
   * Método para obtener las transacciones de la cuenta por periodo
   * @param period El periodo de las transacciones en formato YYYY-MM
   * @returns Un observable con las transacciones filtradas por fecha.
   */
  getOperationsByPeriod(period: string): Observable<any> {
    if (this.useMockData) {
      const today = new Date();
      let startDate: Date;

      switch (period) {
        case 'Hoy':
          startDate = new Date(today.setHours(0, 0, 0, 0)); // Today at 00:00:00
          break;
        case 'Última semana':
          startDate = new Date(today.setDate(today.getDate() - 7)); // 7 days ago
          break;
        case 'Último mes':
          startDate = new Date(today.setMonth(today.getMonth() - 1)); // 1 month ago
          break;
        case 'Último año':
          startDate = new Date(today.setFullYear(today.getFullYear() - 1)); // 1 year ago
          break;
        default:
          startDate = new Date(0); // Default to all transactions if period is unknown
          break;
      }

      const filteredMovements = this.mockOperations.filter((movement) => {
        const createdAt = new Date(movement.created_at);
        return createdAt >= startDate;
      });

      return new Observable<any>((subscriber) => {
        setTimeout(() => {
          subscriber.next({ movements: filteredMovements }); //  Return `movements` as expected
          subscriber.complete();
        }, 1000);
      });
    } else {
      const params = `filter=${period}`;
      return this.apiService
        .get<any>(`${this.endpoint}/operations?${params}`)
        .pipe(
          catchError((error: any) => {
            console.log(error);
            return throwError(
              () => new Error('Error obteniendo operaciones por periodo')
            );
          })
        );
    }
  }
}
