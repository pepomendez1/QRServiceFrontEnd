import { Injectable } from '@angular/core';
import { catchError, Observable, of, switchMap, map, throwError } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';

export interface Card {
  id: string;
  provider_id: string;
  type: 'VIRTUAL' | 'PHYSICAL';
  product_type: string;
  status: 'ACTIVE' | 'BLOCKED' | 'DISABLED';
  last_four: string;
  provider: string;
  activated_at: string;
  affinity_group_id: string;
  alias: string;
}

export interface MyServicesAndTaxes {
  serviceIdentifier: string;
  modalityId: string;
  companyCode: string;
  alias: string;
  type: string;
  agendaId: string;
  accounts: number;
}

export interface Expiration {
  description: string;
  merchant_name: string;
  vencido: boolean;
  autodebito: boolean;
  fechaAutodebito: string;
  amount: number;
  checked: boolean;
}

export interface History {
  description: string;
  merchant_name: string;
  vencido: boolean;
  autodebito: boolean;
  fechaAutodebito: string;
  amount: number;
  date: string
}

export interface Cards extends Array<Card> {}
export interface Expirations extends Array<Expiration> {}
export interface Histories extends Array<History> {}
export interface MyServicesAndTaxes extends Array<MyServicesAndTaxes> {}

@Injectable({
  providedIn: 'root',
})
export class ServicesPaymentService {
  private useMockData: boolean = true;
  //private cardsEndpoint = '/public/public/wibond-connect/cards';
  private servicePaymentEndpoint = '/public/public/wibond-connect/services-payment';
  currentCards: Cards = [];

  mockCards: Cards = [
    {
      id: 'crd-2m1zOlAc6uyxjGaBunh0pv16MaD',
      provider_id: 'crd-2m1zOlAc6uyxjGaBunh0pv16MaD',
      type: 'PHYSICAL',
      product_type: 'PREPAID',
      status: 'ACTIVE',
      last_four: '0176',
      provider: 'MASTERCARD',
      activated_at: '2024-09-13T17:20:49.467Z',
      affinity_group_id: '1234',
      alias: 'test_fisica',
    },
    {
      id: 'crd-2m1zJiN0lG5qAMQJS3U6vuhBK48',
      provider_id: 'crd-2m1zOlAc6uyxjGaBunh0pv16MaD',
      type: 'VIRTUAL',
      product_type: 'PREPAID',
      status: 'ACTIVE',
      last_four: '2925',
      provider: 'VISA',
      activated_at: '2024-09-13T17:20:05.507Z',
      affinity_group_id: '123',
      alias: '',
    },
  ];

  mockActivities=  [
    {
      serviceIdentifier: 'Ecogas',
      modalityId: 'uuid',
      companyCode: 'ecogas',
      alias: 'alias ecogas',
      type: 'Gas',
      agendaId: 'agendaId',
      accounts: 1,
    }/*,
    {
      serviceIdentifier: 'EPEC',
      modalityId: 'anotherUuid',
      companyCode: 'anotherCompany',
      alias: 'alias another',
      type: 'Electricidad',
      agendaId: 'anotherAgendaId',
      accounts: 4
    },
    {
      serviceIdentifier: 'Aguas Cordobesas',
      modalityId: 'anotherUuid',
      companyCode: 'anotherCompany',
      alias: 'alias another',
      type: 'Agua',
      agendaId: 'anotherAgendaId',
      accounts: 3
    },
    {
      serviceIdentifier: 'Wee',
      modalityId: 'anotherUuid',
      companyCode: 'anotherCompany',
      alias: 'alias another',
      type: 'Internet',
      agendaId: 'anotherAgendaId',
      accounts: 2
    },
    {
      serviceIdentifier: 'Claro',
      modalityId: 'anotherUuid',
      companyCode: 'anotherCompany',
      alias: 'alias another',
      type: 'Telefonía',
      agendaId: 'anotherAgendaId',
      accounts: 1
    }

    ,

    {
      serviceIdentifier: 'Ecogas',
      modalityId: 'uuid',
      companyCode: 'ecogas',
      alias: 'alias ecogas',
      type: 'Gas',
      agendaId: 'agendaId',
      accounts: 1
    },
    {
      serviceIdentifier: 'EPEC',
      modalityId: 'anotherUuid',
      companyCode: 'anotherCompany',
      alias: 'alias another',
      type: 'Electricidad',
      agendaId: 'anotherAgendaId',
      accounts: 2
    },
    {
      serviceIdentifier: 'Aguas Cordobesas',
      modalityId: 'anotherUuid',
      companyCode: 'anotherCompany',
      alias: 'alias another',
      type: 'Agua',
      agendaId: 'anotherAgendaId',
      accounts: 2
    },
    {
      serviceIdentifier: 'Wee',
      modalityId: 'anotherUuid',
      companyCode: 'anotherCompany',
      alias: 'alias another',
      type: 'Internet',
      agendaId: 'anotherAgendaId',
      accounts: 2
    },
    {
      serviceIdentifier: 'Claro',
      modalityId: 'anotherUuid',
      companyCode: 'anotherCompany',
      alias: 'alias another',
      type: 'Telefonía',
      agendaId: 'anotherAgendaId',
      accounts: 2
    }*/
  ];

  mockExpirations: Expirations =  [
    {
      description: "Telefonía - Nro de Cuenta 123456",
      merchant_name: "Claro",
      vencido: true,
      autodebito: true,
      fechaAutodebito :'20 de enero',
      amount:1000,
      checked: false
    },
    {
      description: "Telefonía - Nro de Cuenta 666899",
      merchant_name: "Personal",
      vencido: false,
      autodebito: true,
      fechaAutodebito :'21 de enero',
      amount:2000,
      checked: false
    },
    {
      description: "Gas - Nro de Cuenta 78544",
      merchant_name: "Ecogas",
      vencido: false,
      autodebito: true,
      fechaAutodebito :'24 de enero',
      amount:3000,
      checked: false
    }
  ];

  mockHistory: Histories=   [
    {
      description: "Telefonía - Nro de Cuenta 123456",
      merchant_name: "Claro",
      vencido: true,
      autodebito: true,
      fechaAutodebito :'20 de enero',
      amount:1000,
      date: '2024-01-01'
    },
    {
      description: "Telefonía - Nro de Cuenta 666899",
      merchant_name: "Claro",
      vencido: false,
      autodebito: true,
      fechaAutodebito :'21 de enero',
      amount:2000,
      date: '2024-12-05'
    },
    {
      description: "Gas - Nro de Cuenta 78544",
      merchant_name: "Ecogas",
      vencido: false,
      autodebito: true,
      fechaAutodebito :'24 de enero',
      amount:3000,
      date: '2025-01-10'
    },
    {
      description: "Luz - Nro de Cuenta 111",
      merchant_name: "EPEC",
      vencido: false,
      autodebito: true,
      fechaAutodebito :'21 de febrero',
      amount:3000,
      date: '2025-02-02'
    }
  ];

  constructor(private apiService: ApiService) {}

  public getCards(): Observable<Cards> {
    console.log('getCards()');

    if (this.useMockData) {
      //MOCK DATA
      if (Math.random() > 0.9) {
        return throwError(() => new Error('Error obteniendo tarjetas'));
      }

      return new Observable<Cards>((subscriber) => {
        setTimeout(() => {
          subscriber.next(this.mockCards);
          subscriber.complete();
        }, 1000);
      });
    } else {
      // response can be null...
      return this.apiService.get<Cards>(this.servicePaymentEndpoint).pipe(
        catchError((error: any) => {
          console.log(error);
          return throwError(() => new Error('Error obteniendo tarjetas'));
        })
      );
    }
  }

  public createCard(
    cardType: 'VIRTUAL' | 'PHYSICAL',
    address?: any
  ): Observable<Cards> {
    console.log(`createCard(${cardType})`);

    // MOCK DATA
    let newMockCard: Card = {
      id:
        'crd-' +
        Array.from({ length: 27 }, () => Math.random().toString(36)[2]).join(
          ''
        ),
      provider_id:
        'crd-' +
        Array.from({ length: 27 }, () => Math.random().toString(36)[2]).join(
          ''
        ),
      type: cardType,
      product_type: 'PREPAID',

      status: 'ACTIVE',
      last_four: Math.floor(1000 + Math.random() * 9000).toString(),
      provider: Math.random() > 0.5 ? 'MASTERCARD' : 'VISA',
      activated_at: new Date().toISOString(),
      affinity_group_id: '123',
      alias: 'test',
    };

    if (this.useMockData) {
      console.log(newMockCard);
      this.mockCards.push(newMockCard);
      return new Observable<Cards>((subscriber) => {
        setTimeout(() => {
          subscriber.next(this.mockCards);
          subscriber.complete();
        }, 1000);
      });
    } else {
      // if cardType is physical and address is not provided, throw an error
      if (cardType === 'PHYSICAL' && !address) {
        console.log('address: ', address);
        return throwError(() => new Error('No se ha encontrado la dirección'));
      }

      // body always has card_type but if it's physical,
      // it also has address and innominate
      let body: any = {
        card_type: cardType,
      };

      if (cardType === 'PHYSICAL') {
        body.address = address;
        body.innominate = true;
      }

      console.warn('creating card');
      console.log('body: ', body);

      return this.apiService.post<Cards>(this.servicePaymentEndpoint, body).pipe(
        catchError((error: any) => {
          console.log(error);
          return throwError(() => new Error('Error creando tarjeta'));
        })
      );
    }
  }

  getCardToken(cardId: string): Observable<string> {
    console.log(`getCardToken(${cardId})`);
    if (this.useMockData) {
      // MOCK DATA
      return new Observable<string>((subscriber) => {
        setTimeout(() => {
          subscriber.next(
            'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InAyOHhHM041MFBiNG93bTBZVHAxaCJ9.eyJodHRwczovL3BvbWVsby5sYS91c2VyX2lkIjoidXNyLTJtMXpJMkxzaDBJUXhqRmlYUXFpOGs1aWlieiIsImh0dHBzOi8vcG9tZWxvLmxhL2NsaWVudF9pZCI6ImNsaS0yYWlrOEdXVFh4M1JWSnVPcFhvaEowNWRvZVIiLCJpc3MiOiJodHRwczovL3BvbWVsby1zdGFnZS51cy5hdXRoMC5jb20vIiwic3ViIjoiRjdqRFh3NkRKV2VaS2p4M1FzQXhHRGpsbm9WZmtUVG1AY2xpZW50cyIsImF1ZCI6Imh0dHBzOi8vYXV0aC1zdGFnaW5nLWVuZC11c2VyLnBvbWVsby5sYSIsImlhdCI6MTcyNjc2OTQ2MSwiZXhwIjoxNzI2NzcwMzYxLCJzY29wZSI6InNlY3VyZS1kYXRhLW1pZGRsZXdhcmU6Z2V0LXNlY3VyZS1kYXRhIHNlY3VyZS1kYXRhLW1pZGRsZXdhcmU6YWN0aXZhdGUtY2FyZCB1c2VyczpnZXQtdXNlciBjYXJkczpnZXQtY2FyZCBjYXJkczpjcmVhdGUtY2FyZCBjYXJkczp1cGRhdGUtY2FyZCBtZGVzLWNvbm5lY3RvcjpnZW5lcmF0ZS1hcHBsZS1wcm92aXNpb25pbmctZGF0YSBtZGVzLWNvbm5lY3RvcjpnZW5lcmF0ZS1nb29nbGUtcHJvdmlzaW9uaW5nLWRhdGEgdnRzLWNvbm5lY3Rvcjpnb29nbGUtcHJvdmlzaW9uaW5nLXBlcm1pc3Npb24iLCJndHkiOiJjbGllbnQtY3JlZGVudGlhbHMiLCJhenAiOiJGN2pEWHc2REpXZVpLangzUXNBeEdEamxub1Zma1RUbSJ9.pOFE9WojFMarfanBjgd2OTIOec9j6a4rRlXcr_8DET2ZyCpTlDLoy9HKafgEdvZ_2LH7mzlJTsJMnbLSJqt7UK5hKFT187E3SWHQ9qlpfaWym5Bj_xkjxMevVkrJT5ocIZEuAMRH4QoqgDt5noN19RTW0arNtdbodLtW6Y71qP21vcxAjRPIdlWDZIUH2T0adqxjC-Y_HzWt8BOuSUZLYEez_i2Oh9WtOMHMN7rMb9oLQj8Jgbu0iAxCLFXzYyFmf8j0oFzMF83WtEnvkktXdY8hXWasq8zmahsIRFZtEbJs_fGky9WxQWqQhJpmwfKk9AveraTOztfV37QfzJ31Og'
          );
          subscriber.complete();
        }, 1000);
      });
    } else {
      return this.apiService.get<string>(this.servicePaymentEndpoint + '/tokens');
    }
  }

  public getCardIframeUrl(cardId: string): Observable<string> {
    console.log(`getCardIframeUrl(${cardId})`);

    return this.getCardToken(cardId).pipe(
      switchMap((response: any) => {
        console.log(response);
        const POMELO_BASE_CARD_TOKEN_URL =
          'https://secure-data-web-stage.pomelo.la/v1/';
        const styles =
          'https://gist.githubusercontent.com/llosio/eb5cb5e4b2ec0b288f08a98b5d5eee86/raw/1caac8e05b4f3d9366d682626a2ad7a47c4e72b9/pomeloGenerico.css';
        const webViewUrl =
          POMELO_BASE_CARD_TOKEN_URL +
          cardId +
          '?auth=' +
          response.access_token +
          '&styles=' +
          styles +
          '&field_list=pan%2Ccode%2Cname%2Cexpiration' +
          '&locale=es';

        return new Observable<string>((subscriber) => {
          console.log(webViewUrl);
          subscriber.next(webViewUrl);
          subscriber.complete();
        });
      }),
      catchError((error: any) => {
        console.log(error);
        return throwError(() => new Error('Error obteniendo token'));
      })
    );
  }

  public pauseCard(card: Card): Observable<boolean> {
    console.log(`pauseCard(${card})`);
    if (this.useMockData) {
      // Update alias directly in mockCards array
      const cardIndex = this.mockCards.findIndex((c) => c.id === card.id);
      if (cardIndex !== -1) {
        this.mockCards[cardIndex].status = 'BLOCKED';
        this.mockCards[cardIndex].affinity_group_id = card.affinity_group_id;

        return of(true); // Return success status
      } else {
        return throwError(() => new Error('Card not found in mock data'));
      }
    } else {
      let body = {
        id: card.id,
        card_update: {
          // affinity_group_id: card.affinity_group_id,
          status: 'BLOCKED',
          status_reason: 'CLIENT_INTERNAL_REASON',
        },
      };

      return this.apiService.put<any>(this.servicePaymentEndpoint, body).pipe(
        map((response) => {
          if (response.is_ok) {
            return true; // Response indicates success, return true
          } else {
            // If the response indicates failure, throw an error with the message
            throw new Error(response.message);
          }
        }),
        catchError((error) => {
          // Log the error and re-throw it for any subscribers to handle
          console.error('Error en pauseCard:', error);
          return throwError(
            () => new Error(error.message || 'Ocurrió un error desconocido')
          );
        })
      );
    }
  }

  public cancelCard(card: Card): Observable<boolean> {
    console.log(`cancelCard(${card})`);
    if (this.useMockData) {
      return new Observable<boolean>((observer) => {
        const cardIndex = this.mockCards.findIndex((c) => c.id === card.id);
        if (cardIndex !== -1) {
          setTimeout(() => {
            this.mockCards[cardIndex].status = 'DISABLED';
            this.mockCards[cardIndex].affinity_group_id =
              card.affinity_group_id;

            console.log(
              `Mock card status updated: ${JSON.stringify(
                this.mockCards[cardIndex]
              )}`
            );
            observer.next(true); // Emit success
            observer.complete(); // Mark as complete
          }, 2000); // Simulate delay
        } else {
          observer.error(new Error('Card not found in mock data')); // Emit error
        }
      });
    } else {
      let body = {
        id: card.id,
        card_update: {
          // affinity_group_id: card.affinity_group_id,
          status: 'DISABLED',
          status_reason: 'CLIENT_INTERNAL_REASON',
        },
      };

      return this.apiService.put<any>(this.servicePaymentEndpoint, body).pipe(
        map((response) => {
          if (response.is_ok) {
            return true; // Response indicates success, return true
          } else {
            // If the response indicates failure, throw an error with the message
            throw new Error(response.message);
          }
        }),
        catchError((error) => {
          // Log the error and re-throw it for any subscribers to handle
          console.error('Error en cancelar Tarjeta:', error);
          return throwError(
            () => new Error(error.message || 'Ocurrió un error desconocido')
          );
        })
      );
    }
  }

  public activateCard(card: Card): Observable<boolean> {
    console.log(`activateCard(${card})`);
    if (this.useMockData) {
      // Update alias directly in mockCards array
      const cardIndex = this.mockCards.findIndex((c) => c.id === card.id);
      if (cardIndex !== -1) {
        this.mockCards[cardIndex].status = 'ACTIVE';
        this.mockCards[cardIndex].affinity_group_id = card.affinity_group_id;
        return of(true); // Return success status
      } else {
        return throwError(() => new Error('Card not found in mock data'));
      }
    } else {
      const body = {
        id: card.id,
        card_update: {
          status: 'ACTIVE',
          status_reason: 'CLIENT_INTERNAL_REASON',
        },
      };

      return this.apiService.put<any>(this.servicePaymentEndpoint, body).pipe(
        map((response) => {
          if (response.is_ok) {
            return true; // Response indicates success
          } else {
            throw new Error(response.message); // Throw error if is_ok is false
          }
        }),
        catchError((error: any) => {
          console.error('Error in activateCard:', error);
          return throwError(
            () => new Error(error.message || 'Error activando tarjeta')
          );
        })
      );
    }
  }

  public getCardTransactions(
    cardId: string,
    page: number = 1,
    pageSize: number = 10
  ): Observable<any> {
    console.log('card id: ', cardId);
    //const endpoint = `/public/public/wibond-connect/cards/transactions?page=${page}&page_size=${pageSize}&card_id=crd-2oa17YAaAeKDIPUU51S2Obshq8N`;
    const endpoint = `/public/public/wibond-connect/cards/transactions?page=${page}&page_size=${pageSize}&card_id=${cardId}`;
    if (this.useMockData) {
      // Mock data for transactions
      const mockResponse = {
        current_page: 1,
        total_pages: 1,
        total_items: 3,
        items: [
          {
            transaction_id: '02297598-69cb-4ac9-859d-f7d818382544',
            amount: 1500.0,
            currency: 'ARS',
            merchant_name: 'AMAZONVALIDACION',
            status: 'COMPLETED',
            operation_country: 'ARG',
            created_at: '2024-12-02T13:51:41.383Z',
            modified_at: '2024-12-02T13:51:41.383Z',
            card_id: '289ca4c9-7669-4bb1-a91b-b7f9b13fb9bc',
            original_transaction_id: null,
            type: 'ONLINE',
          },
          {
            transaction_id: '02853e2d-6bd8-4b7b-b340-aa782545cabb',
            amount: 2191.0,
            currency: 'ARS',
            merchant_name: 'WALMART',
            status: 'COMPLETED',
            operation_country: 'ARG',
            created_at: '2024-12-10T17:55:55.336Z',
            modified_at: '2024-12-10T17:55:55.336Z',
            card_id: '289ca4c9-7669-4bb1-a91b-b7f9b13fb9bc',
            original_transaction_id: null,
            type: 'ONLINE',
          },
          {
            transaction_id: '02ebc335-9858-4769-8e37-1ce738210e78',
            amount: 1500.5,
            currency: 'ARS',
            merchant_name: 'AMAZONVALIDACION',
            status: 'COMPLETED',
            operation_country: 'ARG',
            created_at: '2024-12-10T12:08:08.393Z',
            modified_at: '2024-12-10T12:08:08.393Z',
            card_id: '289ca4c9-7669-4bb1-a91b-b7f9b13fb9bc',
            original_transaction_id: 'ctx-2poFoPHHZ400Y3pMVYHLjoRwS4f',
            type: 'ONLINE',
          },
        ],
      };

      // Simulate pagination in mock data
      const startIndex = (page - 1) * pageSize;
      const paginatedItems = mockResponse.items.slice(
        startIndex,
        startIndex + pageSize
      );

      return new Observable((subscriber) => {
        setTimeout(() => {
          subscriber.next({
            ...mockResponse,
            current_page: page,
            items: paginatedItems,
          });
          subscriber.complete();
        }, 1000);
      });
    } else {
      return this.apiService.get<any>(endpoint).pipe(
        catchError((error: any) => {
          console.error('Error fetching card transactions:', error);
          return throwError(
            () => new Error('Error fetching card transactions')
          );
        })
      );
    }
  }
  public changeName(card: Card, newAlias: string): Observable<boolean> {
    console.log(`changeName(${card}, ${newAlias})`);

    if ([undefined, null, '', ' '].includes(newAlias)) {
      return throwError(() => new Error('El nombre no puede estar vacío'));
    }

    if (this.useMockData) {
      // Update alias directly in mockCards array
      const cardIndex = this.mockCards.findIndex((c) => c.id === card.id);
      if (cardIndex !== -1) {
        this.mockCards[cardIndex].alias = newAlias;
        return of(true); // Return true indicating the name was updated successfully in mock data
      } else {
        return throwError(
          () => new Error('Tarjeta no encontrada en los datos de prueba')
        );
      }
    } else {
      let body = {
        id: card.id,
        card_update: {},
        alias: newAlias,
      };

      return this.apiService.put<any>(this.servicePaymentEndpoint, body).pipe(
        map((response) => {
          if (response.is_ok) {
            return true; // Response indicates success
          } else {
            throw new Error(response.message); // Throw an error with response message if failure
          }
        }),
        catchError((error: any) => {
          console.error('Error en changeName:', error);
          return throwError(
            () => new Error(error.message || 'Error cambiando nombre tarjeta')
          );
        })
      );
    }
  }



  public getServicesAndTaxes(): Observable<Cards> {
    console.log('getServicesAndTaxes()');

    if (this.useMockData) {
      //MOCK DATA
      if (Math.random() > 0.9) {
        return throwError(() => new Error('Error obteniendo services'));
      }

      return new Observable<Cards>((subscriber) => {
        setTimeout(() => {
          subscriber.next(this.mockCards);
          subscriber.complete();
        }, 1000);
      });
    } else {
      // response can be null...
      return this.apiService.get<Cards>(this.servicePaymentEndpoint).pipe(
        catchError((error: any) => {
          console.log(error);
          return throwError(() => new Error('Error obteniendo services'));
        })
      );
    }
  }

  public getExpirations(): Observable<Expirations> {
    console.log('getExpirations()');

    if (this.useMockData) {
      //MOCK DATA
      /*if (Math.random() > 0.9) {
        return throwError(() => new Error('Error obteniendo tarjetas'));
      }*/

      return new Observable<Expirations>((subscriber) => {
        setTimeout(() => {
          subscriber.next(this.mockExpirations);
          subscriber.complete();
        }, 1000);
      });
    } else {
      // response can be null...
      return this.apiService.get<Expirations>(this.servicePaymentEndpoint).pipe(
        catchError((error: any) => {
          console.log(error);
          return throwError(() => new Error('Error obteniendo getExpirations'));
        })
      );
    }
  }

  public getHistory(): Observable<Histories> {
    console.log('getHistory()');

    if (this.useMockData) {
      //MOCK DATA
      /*if (Math.random() > 0.9) {
        return throwError(() => new Error('Error obteniendo historial'));
      }*/

      return new Observable<Histories>((subscriber) => {
        setTimeout(() => {
          subscriber.next(this.mockHistory);
          subscriber.complete();
        }, 1000);
      });
    } else {
      // response can be null...
      return this.apiService.get<Histories>(this.servicePaymentEndpoint).pipe(
        catchError((error: any) => {
          console.log(error);
          return throwError(() => new Error('Error obteniendo historial'));
        })
      );
    }
  }

}
