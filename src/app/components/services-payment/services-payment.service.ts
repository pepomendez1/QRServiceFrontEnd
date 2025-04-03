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
  company_code: string;
  company_name: string;
  company_logo: string;
  category: string;
  total_accounts: number;
  last_payment_date: string;
}

export interface Expiration {
  id: string;
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
  companyCode:string;
  companyName:string;
  companyLogo:string;
  operation_id:string;
  date: string
}
export interface Service {
  companyCode: string;
  companyName: string;
  companyLogo: string;
}

export interface RequestPayments {
  debtId: string;
  amount: number;
  paymentMethod: 'DEBIT' | 'ACCOUNT' | 'CREDIT';
  externalPaymentId: string;
}

export interface Cards extends Array<Card> {}
export interface Expirations extends Array<Expiration> {}
export interface Notifications extends Array<Notification> {}
export interface Histories extends Array<History> {}
export interface ServicesAndTaxes extends Array<MyServicesAndTaxes> {}
export interface ServicesMap extends Record<string, Service[]> {}
export interface SearchServices extends Array<Service> {}
//export interface Histories extends Array<History> {}

type ExchangeDetail = {
  amount: number;
  currency: string;
  exchangeRate: number;
};

type ExpirationType = {
  amount: number;
  expirationDate: string;
};

type Debt = {
  debtId: string;
  currency: string;
  amount: number;
  minAmount: number;
  maxAmount: number;
  expirationDate: string;
  amountType: string;
  expired: boolean;
  details: any[]; // Si tienes más detalles, define su estructura exacta
  expirations: ExpirationType[];
  exchangeDetail: ExchangeDetail[];
};

export type PaymentInfo = {
  operationId: string;
  companyCode: string;
  companyName: string;
  customerId: string;
  customerName: string;
  customerAddress: string;
  alias: string;
  logo: string;
  debts: Debt[];
  tx: string;
  mainTx: string;
  id: number;
};

export interface BackendHistory {
  id: number;
  created_at: string;
  external_id: string;
  company_code: string;
  company: {
    id: number;
    company_code: string;
    company_name: string;
    company_logo: string;
    category: string;
  };
  product_id: string;
  payment_method: string;
  amount: number;
  operation_id: string;
  status: string;
  additional_data: string;
}


export interface QueryData {
  inline: boolean;
  dataType: string;
  helpText: string;
  position: number;
  component: string;
  maxLength: number;
  minLength: number;
  description: string;
  helpTextImage: string | null;
  identifierName: string;
  identifierValue: string | null;
}

export interface Modality {
  modalityId: string;
  modalityType: string;
  modalityTitle: string;
  modalityDescription: string;
  active: boolean;
  queryData: QueryData[];
}

export interface Company {
  companyCode: string;
  companyName: string;
  companyType: string;
  companyLogo: string;
  relatedCompanyName: string | null;
  tags: string[];
  active: boolean;
  modalities: Modality[];
}

export interface AdditionalData {
  agent: string;
  customerId: string;
  ticket: string[];
  providerName: string;
}

export interface Operation {
  operationId: string;
  status: string;
  externalPaymentId: string;
  externalClientId: string;
  additionalData: AdditionalData;
  companyCode: string;
  companyName: string;
  amount: number;
  createdAt: string; // Si deseas manejarlo como Date, conviértelo al recibirlo
}

export interface OperationStatusResponse {
  operation: Operation;
  tx: string;
  mainTx: string;
}
export interface Notification {
  id: string;
  companyName: string;
  type: string;
  agendaId: string;
  companyCode: string;
  companyLogo: string;
  exchangeDetail: ExchangeDetail[];
  lastPaidDate: string;  // Puede ser Date si lo parseas
  amount: number;
  expirationDate: string; // Puede ser Date si lo parseas
  expirationDateWasEstimated: boolean;
  checked:boolean;
}

export interface NotificationsResponse {
  notifications: Notification[];
  tx: string;
  mainTx: string;
}

export interface DebtResponse {
  notificationId: string;
  status: string;
  response: PaymentInfo;
}

export interface DebtsApiResponse {
  debtsResponse: DebtResponse[];
  tx: string;
  mainTx: string;
}

@Injectable({
  providedIn: 'root',
})
export class ServicesPaymentService {
  private useMockData: boolean = true;
  private servicePaymentEndpoint = '/public/wibond-connect/service-payment';

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
    { id:'11111',
      description: "Telefonía - Nro de Cuenta 123456",
      merchant_name: "Claro",
      vencido: true,
      autodebito: true,
      fechaAutodebito :'20 de enero',
      amount:1000,
      checked: false
    },
    {id:'11112',
      description: "Telefonía - Nro de Cuenta 666899",
      merchant_name: "Personal",
      vencido: false,
      autodebito: true,
      fechaAutodebito :'21 de enero',
      amount:2000,
      checked: false
    },
    {id:'11113',
      description: "Gas - Nro de Cuenta 78544",
      merchant_name: "Ecogas",
      vencido: false,
      autodebito: true,
      fechaAutodebito :'24 de enero',
      amount:3000,
      checked: false
    }
  ];

  /*mockOperationStatus: OperationStatusResponse =
    {
      externalPaymentId: "Telefonía - Nro de Cuenta 123456",
      externalClientId: "CLI001",
      operationId: '615ef422-575a-4983-849e-dec205cb2694',
      companyCode: 'AR-S-0040',
      companyName :'ARCA (ex AFIP)',
      amount:5000,
      createdAt: '2025-02-25 10:00',
      status: 'failed',
      additionalData: {'data': 'some additionalData mock'},
      amountType:'abierto',
    };*/

    mockOperationStatus: OperationStatusResponse ={
      "operation": {
        "operationId": "524f7aaf-6dc4-47d9-b96f-cc959e668b69",
        "status": "confirmed",
        "externalPaymentId": "524f7aaf-6dc4-47d9-b96f-cc959e668b69",
        "externalClientId": "CLI001",
        "additionalData": {
          "agent": "Agente oficial TAPI",
          "customerId": "b0733f3a-f9bd-4296-b143-0c54716f357a",
          "ticket": [
            "Comprobante de Pago", "TAPI", "Código de Operación: 524f7aaf-6dc4-47d9-b96f-cc959e668b69",
            "Fecha: 6/3/2025        Hora: 20:33:35",
            "Empresa:  TAPI- TEST 3", "Importe: $10000.00",
            "Identificador de cliente: b0733f3a-f9bd-4296-b143-0c54716f357a",
            "Identificador de Pago: 524f7aaf-6dc4-47d9-b96f-cc959e668b69",
            "Forma de Pago                  Efectivo",
            "Importe                       $10000.00", "** TOTAL **                     $10000.00",
            "---------------*****---------------", "AGENTE OFICIAL TAPI"
          ],
          "providerName": "TAPI"
        },
        "companyCode": "AR-S-02604",
        "companyName": "TAPI- TEST 3",
        "amount": 10000,
        "createdAt": "2025-03-06T23:33:35.703Z"
      },
      "tx": "93908c3c-007e-4853-8e99-efc4cc846eb3",
      "mainTx": "7864e2f4-0b0b-4db2-b837-495232f1428e"
    }

  mockHistory: Histories=   [
    {
      description: "Telefonía - Nro de Cuenta 123456",
      merchant_name: "Claro",
      vencido: true,
      autodebito: true,
      fechaAutodebito :'20 de enero',
      amount:1000,

      operation_id:'123',
      companyCode: 'code',
      companyName: 'name',
      companyLogo: 'logo',

      date: '2024-01-01'
    },
    {
      description: "Telefonía - Nro de Cuenta 666899",
      merchant_name: "Claro",
      vencido: false,
      autodebito: true,
      fechaAutodebito :'21 de enero',
      amount:2000,
      operation_id:'123',
      companyCode: 'code',
      companyName: 'name',
      companyLogo: 'logo',
      date: '2024-12-05'
    },
    {
      description: "Gas - Nro de Cuenta 78544",
      merchant_name: "Ecogas",
      vencido: false,
      autodebito: true,
      fechaAutodebito :'24 de enero',
      amount:3000,
      operation_id:'123',
      companyCode: 'code',
      companyName: 'name',
      companyLogo: 'logo',
      date: '2025-01-10'
    },
    {
      description: "Luz - Nro de Cuenta 111",
      merchant_name: "EPEC",
      vencido: false,
      autodebito: true,
      fechaAutodebito :'21 de febrero',
      amount:3000,
      operation_id:'123',
      companyCode: 'code',
      companyName: 'name',
      companyLogo: 'logo',
      date: '2025-02-02'
    }
  ];

  mockPopularServices: ServicesMap = {
    "SERVICIO DE GAS":[
    {"companyCode":"AR-S-02603",
     "companyName":"TAPI- TEST 2",
     "companyLogo":"https://public-logo.prod.tapila.cloud/ar/tapi.png"},

    {"companyCode":"AR-S-0033",
     "companyName":"CAMUZZI GAS PAMPEANA - GAS DEL SUR",
     "companyLogo":"https://public-logo.prod.tapila.cloud/ar/tapi.png"},

    {"companyCode":"AR-S-02610",
     "companyName":"TAPI Sandbox 1",
     "companyLogo":"https://public-logo.prod.tapila.cloud/ar/tapi.png"},

    {"companyCode":"AR-S-02611",
     "companyName":"TAPI Sandbox 2",
     "companyLogo":"https://public-logo.prod.tapila.cloud/mx/TELMEX.png"}
    ],
    "SERVICIO DE LUZ":[
    {"companyCode":"AR-S-0035",
     "companyName":"EDESUR",
     "companyLogo":"https://public-logo.prod.tapila.cloud/ar/tapi.png"},

    {"companyCode":"AR-S-0003",
     "companyName":"EDENOR",
     "companyLogo":"https://public-logo.prod.tapila.cloud/ar/Edenor.png"},

    {"companyCode":"AR-S-02602",
     "companyName":"TAPI- TEST 1",
     "companyLogo":"https://public-logo.prod.tapila.cloud/ar/tapi.png"}
    ],
    "CREDITOS":[
    {"companyCode":"AR-S-04160",
     "companyName":"PLAN CHERY",
     "companyLogo":""}
     ],
    "FINANCIERO":[
    {"companyCode":"AR-S-0024",
     "companyName":"SANTANDER - PRESTAMOS",
     "companyLogo":"https://public-logo.prod.tapila.cloud/tags_common/tag_PrestamosYServiciosFinancieros.png"}
     ]
    }    ;

  mockMyServices: ServicesAndTaxes = [
      {
        company_name: 'Ecogas',
        company_code: 'AS_0_00034',
        company_logo: 'logo',
        category: 'Gas',
        total_accounts: 4,
        last_payment_date: '2025-02-02 10:00'
      },
      {
        company_name: 'Personal',
        company_code: 'AS_0_00035',
        company_logo: 'logo',
        category: 'Telefonía',
        total_accounts: 2,
        last_payment_date: '2025-02-01 12:00'
      },
    ];

  mockDebtsData: PaymentInfo = {
      "operationId":"afa6bb11-47d6-4a66-aa30-829131151634",
      "companyCode":"AR-S-02604",
      "companyName":"TAPI- TEST 3",
      "customerId":"b0733f3a-f9bd-4296-b143-0c54716f357a",
      "customerName":"Claudia Delatorre Briseño",
      "customerAddress":"Monte Catalina Lozano, 90 Esc. 085",
      "alias":"alias",
      "logo":"https://public-logo.prod.tapila.cloud/tags_common/tag_PrestamosYServiciosFinancieros.png",
      "debts":[
        {
          "debtId":"afa6bb11-47d6-4a66-aa30-829131151634-0",
          "currency":"ARS",
          "amount":16000,
          "minAmount":10000,
          "maxAmount":10000,
          "expirationDate":"2025-03-14",
          "amountType":"CLOSED",
          "expired":false,
          "details":[],
          "expirations":[{"amount":8340,"expirationDate":"2022-10-26"}],
          "exchangeDetail":[{"amount":100,"currency":"USD","exchangeRate":100}]
        },
        {
          "debtId":"afa6bb11-47d6-4a66-aa30-829131151634-0",
          "currency":"ARS",
          "amount":10000,
          "minAmount":10000,
          "maxAmount":10000,
          "expirationDate":"2025-02-14",
          "amountType":"CLOSED",
          "expired":false,
          "details":[],
          "expirations":[{"amount":8340,"expirationDate":"2022-10-26"}],
          "exchangeDetail":[{"amount":100,"currency":"USD","exchangeRate":100}]
        }
        ],
        "tx":"256a97bd-e53d-416c-abd9-02ddb77d52e5",
        "mainTx":"afa6bb11-47d6-4a66-aa30-829131151634",
        "id":70
      }

  mockPaymentResponse: any = {
    "operationId": "0dd959ff-5c39-4384-9da9-eeb850ae5d2a",
    "companyCode": "AR-S-02602",
    "companyName": "TAPI - HOMOLOGACION",
    "externalPaymentId": "d2bc52f8-c889-45d9-88cf-fb697e7d059f",
    "externalClientId": "4afb295c-dc0e-488e-8cd8-7b6a800a0508",
    "status": "processing",
    "createdAt": "2023-04-06T14:55:52.678Z",
    "amount": 96966,
    "paymentMethod": "ACCOUNT",
    "agent": "Agente oficial TAPI",
    "clientUsername": "tap.qa",
    "identifiers": [
      {
        "identifierName": "clientNumber",
        "identifierValue": "0000000001"
      }
    ],
    "tx": "c884913d-0f9d-47d5-b563-7df028b94add",
    "mainTx": "0116aba3-c397-4ade-ac79-c8afd9c4bd79"
  }

  mockNotifications: NotificationsResponse = {
    "notifications":[
      {
        "id":"382ec6ae-f820-453f-b7c7-a642d05f4b86-0",
        "companyName":"TAPI- TEST 3",
        "type":"NEW_BILL",
        "agendaId":"CLI001#74cc2f09-6c74-49f4-b6d7-e57f274fb1b3#0000000010",
        "companyCode":"AR-S-02604",
        "companyLogo":"https://public-logo.prod.tapila.cloud/ar/tapi.png",
        "exchangeDetail":[{"exchangeRate":100,"amount":100,"currency":"USD"}],
        "lastPaidDate":"2025-02-23","amount":10000,"expirationDate":"2025-02-24",
        "expirationDateWasEstimated":true,
        "checked": false
      }
    ],
    "tx":"46b271dc-343a-4592-b83c-b648a684faae",
    "mainTx":"1c680640-0a1e-4282-acb7-d10deaacc507"
  }

  constructor(private apiService: ApiService) {}

  public getPopularServices(): Observable<ServicesMap> {
    console.log('getPopularServices()');

    if (/*this.useMockData*/ false) {
      //MOCK DATA
     /* if (Math.random() > 0.9) {
        return throwError(() => new Error('Error obteniendo servicios pupolares'));
      }*/

      return new Observable<ServicesMap>((subscriber) => {
        setTimeout(() => {
          subscriber.next(this.mockPopularServices);
          subscriber.complete();
        }, 1000);
      });
    } else {
      // response can be null...
      return this.apiService.get<ServicesMap>(this.servicePaymentEndpoint + '/services/popular').pipe(
        catchError((error: any) => {
          console.log(error);
          return throwError(() => new Error('Error obteniendo servicios pupolares'));
        })
      );
    }
  }

  public getMyServices(): Observable<ServicesAndTaxes> {
    console.log('getMyServices()');

    if (/*this.useMockData*/ false) {
      //MOCK DATA
     return new Observable<ServicesAndTaxes>((subscriber) => {
        setTimeout(() => {
          subscriber.next(this.mockMyServices);
          subscriber.complete();
        }, 1000);
      });
    } else {
      // response can be null...
      return this.apiService.get<ServicesAndTaxes>(this.servicePaymentEndpoint + '/services/summary').pipe(
        catchError((error: any) => {
          console.log(error);
          return throwError(() => new Error('Error obteniendo resumen de servicios '));
        })
      );
    }
  }

  public getCompanyByCode(companyCode: string): Observable<Company> {
    console.log('getCompanyByCode()', companyCode);

    if (false) {
      //MOCK DATA
      /*return new Observable<ServicesMap>((subscriber) => {
        setTimeout(() => {
          subscriber.next(this.mockPopularServices);
          subscriber.complete();
        }, 1000);
      });*/
    } else {
      // response can be null...
      return this.apiService.get<Company>(this.servicePaymentEndpoint + '/company?companyCode=' + companyCode).pipe(
        catchError((error: any) => {
          console.log(error);
          return throwError(() => new Error('Error obteniendo getCompanyByCode'));
        })
      );
    }
  }

  public deleteServiceByCompanyCode(companyCode: string): Observable<string> {
    console.log('delete by CompanyByCode', companyCode);

    return this.apiService
    .post<string>(
      `${this.servicePaymentEndpoint}/services/company?companyCode=${companyCode}`, {})
    .pipe(
      catchError((error: any) => {
        console.log(error);
        return throwError(() => new Error('Error on delete service'));
      })
    );
  }


  public searchCompanyByName(searchCompany: string): Observable<SearchServices> {
    console.log('getCompanyByCode()');

    if (false) {
      //MOCK DATA
      /*return new Observable<ServicesMap>((subscriber) => {
        setTimeout(() => {
          subscriber.next(this.mockPopularServices);
          subscriber.complete();
        }, 1000);
      });*/
    } else {
      // response can be null...
      return this.apiService.get<SearchServices>(this.servicePaymentEndpoint + '/services?searchCompany=' + searchCompany).pipe(
        catchError((error: any) => {
          console.log(error);
          return throwError(() => new Error('Error obteniendo getCompanyByCode'));
        })
      );
    }
  }

  public getDebsData(requestBody: any): Observable<PaymentInfo> {
      console.log('getDebsData()', requestBody);

      if (/*this.useMockData*/ false) {
        return new Observable<any>((subscriber) => {
          setTimeout(() => {
            subscriber.next(this.mockDebtsData);
            subscriber.complete();
          }, 1000);
        });
      } else {
        return this.apiService.post<PaymentInfo>(this.servicePaymentEndpoint + '/debts', requestBody).pipe(
          catchError((error: PaymentInfo) => {
            console.log(error);
            return throwError(() => new Error('Error obteniendo servicios para pagar'));
          })
        );
      }
  }

  public getOperationStatus(operationId: string): Observable<OperationStatusResponse> {
    console.log('getOperationStatus() id:', operationId);

    if (/*this.useMockData*/ false) {
      //MOCK DATA
      return new Observable<OperationStatusResponse>((subscriber) => {
        setTimeout(() => {
          subscriber.next(this.mockOperationStatus);
          subscriber.complete();
        }, 1000);
      });
    } else {
      // response can be null...
      return this.apiService.get<OperationStatusResponse>(this.servicePaymentEndpoint + '/operation?operationId=' + operationId).pipe(
        catchError((error: any) => {
          console.log(error);
          return throwError(() => new Error('Error obteniendo getOperationStatus'));
        })
      );
    }
  }

  public getExpirations(): Observable<NotificationsResponse> {
    console.log('getExpirations()');

    //if (this.useMockData) {
    if(false) {
      //MOCK DATA
      /*if (Math.random() > 0.9) {
        return throwError(() => new Error('Error obteniendo tarjetas'));
      }*/

      return new Observable<NotificationsResponse>((subscriber) => {
        setTimeout(() => {
          subscriber.next(this.mockNotifications);
          subscriber.complete();
        }, 1000);
      });
    } else {
      // response can be null...
      return this.apiService.get<NotificationsResponse>(this.servicePaymentEndpoint + "/services/notifications").pipe(
        catchError((error: any) => {
          console.log(error);
          return throwError(() => new Error('Error obteniendo getExpirations'));
        })
      );
    }
  }

  public preparePayment(notification: Notification): Observable<DebtsApiResponse> {
    console.log('preparePayment()');

    if (!notification?.id) {
      return throwError(() => new Error('Invalid notification ID'));
    }

    return this.apiService.post<DebtsApiResponse>(
      `${this.servicePaymentEndpoint}/services/preparePayment`,
      { ids: [notification.id] }
    ).pipe(
      catchError((error: any) => {
        console.error('Error en preparePayment:', error);
        return throwError(() => new Error('Error at preparePayment'));
      })
    );
  }


  public getHistory(): Observable<Histories> {
    console.log('getHistory()');

    if (/*this.useMockData*/ false) {
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
      return this.apiService
      .get<BackendHistory[]>(this.servicePaymentEndpoint + '/paymentsHistory')
      .pipe(
        map((backendData: BackendHistory[]) => this.mapBackendToFrontend(backendData)),  // Mapeo de backend a frontend
        catchError((error: any) => {
          console.log(error);
          return throwError(() => new Error('Error obteniendo historial'));
        })
      );
    }
  }

  private mapBackendToFrontend(backendData: BackendHistory[]): Histories {
    return backendData.map(item => {
        // Extraemos la parte después de ":"
        const parts = item.additional_data.split(":");
        const accountNumber = parts.length > 1 ? parts[1] : 'Desconocido';

        return {
            description: `${item.company.category} - Nro de Cuenta ${accountNumber}`,
            merchant_name: item.company.company_name || 'Desconocido',

            companyCode: item.company.company_code || 'Desconocido',
            companyName: item.company.company_name || 'Desconocido',
            companyLogo: item.company.company_logo || 'Desconocido',

            operation_id: item.operation_id,
            vencido: new Date(item.created_at) < new Date(),  // Si la fecha es pasada, está vencido
            autodebito: false,  // No hay info en el backend, por defecto `false`
            fechaAutodebito: '',  // No hay info, por defecto vacío
            amount: item.amount,
            date: item.created_at.split('T')[0]  // Tomamos solo la fecha sin la hora
        };
    });
}

  public payments(requestBody: RequestPayments): Observable<any> {
    console.log('payment() body:', requestBody);

    if (/*this.useMockData*/ false) {
      //MOCK DATA

      return new Observable<Histories>((subscriber) => {
        setTimeout(() => {
          subscriber.next(this.mockPaymentResponse);
          subscriber.complete();
        }, 1000);
      });
    } else {
      return this.apiService.post<RequestPayments>(this.servicePaymentEndpoint + '/payment', requestBody, false, true).pipe(
        catchError((error: any) => {
          console.log(error);
          return throwError(() => new Error('Error obteniendo servicios para pagar'));
        })
      );
    }
  }
}
