import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError, of, map } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';

export type InvestmentsStatus = 'ACTIVE' | 'INACTIVE' | '';
export type InvestmentsEnabledResponse = 'OK' | 'error' | '';
export interface InvestmentsInfo {
  total_invested: number;
  total_returns: number;
  last_daily_return: number;
  last_date: Date;
  tna: number;
}

export interface Position {
  label: string;
  value: number;
}

export interface Positions extends Array<Position> {}

@Injectable({
  providedIn: 'root',
})
export class InvestmentService {
  private investmentsEndpoint = '/public/wibond-connect/investments';
  private useMockData: boolean = false;

  constructor(private http: HttpClient, private apiService: ApiService) {}

  public getInvestmentsStatus(): Observable<InvestmentsStatus> {
    console.log('getInvestmentsStatus()');

    // const mockResponse: InvestmentsStatus = 'ACTIVE';
    // return of(mockResponse);

    return this.apiService
      .get<InvestmentsStatus>(`${this.investmentsEndpoint}/subscriptionStatus`)
      .pipe(
        catchError((error: any) => {
          console.log(error);
          return throwError(
            () => new Error('Error obteniendo el estado de inversiones')
          );
        })
      );
  }

  public getInvestmentsInfo(): Observable<InvestmentsInfo> {
    console.log('getInvestmentsInfo()');

    return this.apiService
      .get<InvestmentsInfo>(`${this.investmentsEndpoint}/info`)
      .pipe(
        catchError((error: any) => {
          console.log(error);
          return throwError(
            () => new Error('Error obteniendo información de inversiones')
          );
        })
      );
  }

  public getInvestmentsPositions(): Observable<Positions> {
    console.log('getInvestmentsPositions()');

    return this.apiService
      .get<Positions>(this.investmentsEndpoint + '/positions')
      .pipe(
        catchError((error: any) => {
          console.log(error);
          return throwError(
            () => new Error('Error obteniendo posiciones de inversiones')
          );
        })
      );
  }

  public getInvestmentsPositionsByPeriod(
    period: string
  ): Observable<Positions> {
    console.log(`getInvestmentsPositionsByPeriod(${period})`);
    const params = `period=${period}`;

    return this.apiService
      .get<Positions>(`${this.investmentsEndpoint}/positions?${params}`)
      .pipe(
        catchError((error: any) => {
          console.error(error);
          return throwError(
            () =>
              new Error(
                'Error obteniendo posiciones por periodo de inversiones'
              )
          );
        })
      );
  }

  public callStartInvestments(): Observable<InvestmentsEnabledResponse> {
    console.log('callStartInvestments()');

    return this.apiService
      .get<InvestmentsEnabledResponse>(
        `${this.investmentsEndpoint}/enableAccount`
      )
      .pipe(
        catchError((error: any) => {
          console.log(error);
          return throwError(
            () => new Error('Error calling enabledAccount inversiones')
          );
        })
      );
  }

  public callStopInvestments(): Observable<InvestmentsEnabledResponse> {
    console.log('callStartInvestments()');

    return this.apiService
      .delete<InvestmentsEnabledResponse>(
        `${this.investmentsEndpoint}/deleteAccount`
      )
      .pipe(
        catchError((error: any) => {
          console.log(error);
          return throwError(() => new Error('Error cancelando la inversión'));
        })
      );
  }

  public getInvestmentReport(fromDate: string): Observable<any> {
    console.log('getInvestmentReport()');
    let useStg = false;

    if (this.useMockData) {
      const mockResponse = [
        {
          date_time: '2024-12-20T14:15:40.594Z',
          id_concat: '2430-0000017',
          value: 256000,
          type: 'subscripción',
        },
        {
          date_time: '2024-12-26T17:43:59.58Z',
          id_concat: '2448-0000034',
          value: -257187,
          type: 'rescate',
        },
        {
          date_time: '2025-01-10T18:54:34.636Z',
          id_concat: '2458-0000042',
          value: -105,
          type: 'rescate',
        },
        {
          date_time: '2025-01-13T18:30:29.055Z',
          id_concat: '2468-0000050',
          value: 150,
          type: 'subscripción',
        },
      ];

      console.log('Returning mock data for getInvestmentReport()');
      return of(mockResponse); // Return the array directly as an Observable
    } else {
      console.log(`obteniendo inversiones desde ${fromDate}`);
      const params = `from=${fromDate}`;

      if (useStg) {
        const headers = {
          'Content-Type': 'application/json',
          accept: 'application/json',
          Authorization: 'xxxx', // Replace dynamically
          'Wibond-Id': 'xxxx', // Replace dynamically
        };
        const investmentsEndpointStg =
          'https://7ly6pi7xt2.execute-api.us-east-2.amazonaws.com/public/wibond-connect/investments';

        return this.http
          .get<any>(`${investmentsEndpointStg}/orders?${params}`, {
            headers,
          })
          .pipe(
            map((response: any) => {
              const data = response.body ? JSON.parse(response.body) : response;
              return data; // Return the data as-is since backend handles filtering
            }),
            catchError((error: any) => {
              console.error('Error fetching investment report', error);
              return throwError(
                () => new Error('Error fetching investment report')
              );
            })
          );
      } else {
        return this.apiService
          .get<any>(`${this.investmentsEndpoint}/orders?${params}`)
          .pipe(
            map((response: any) => {
              if (response === null) {
                return []; // Return an empty array or handle as per your requirements
              }
              if (Array.isArray(response)) {
                return response; // Return the array if response is valid
              }
              // Handle unexpected formats
              throw new Error('Error en la respuesta obtenida ');
            }),
            catchError((error: any) => {
              console.error(
                'Error obteniendo el reporte de inversiones:',
                error
              );
              return throwError(
                () => new Error('Error obteniendo el reporte de inversiones')
              );
            })
          );
      }
    }
  }
}
