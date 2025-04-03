import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, delay, map } from 'rxjs/operators';
import { ApiService } from 'src/app/services/api.service';
import { HttpParams } from '@angular/common/http';
import { CostConfig, CostConfigMockData } from './costconfig.dto';

@Injectable({
  providedIn: 'root'
})
export class CostsService {
  private useMockData = false;
  private baseUrl = '/public/wibond-connect/subscription/config';

  constructor(private apiService: ApiService) {}

  getCostConfig(): Observable<CostConfig> {
  if (this.useMockData) {
    const mockResponse: CostConfig = CostConfigMockData// copy full mock object here
    return of(mockResponse).pipe(delay(800));
  } else {
    return this.apiService.get<CostConfig>(this.baseUrl).pipe(
      map(res => res),
      catchError((error) => {
        console.error('Error fetching cost config:', error);
        return throwError(() => new Error('Error cargando configuración de costos'));
      })
    );
  }
}

updateCostConfig(config: CostConfig): Observable<any> {
  return this.apiService.post(this.baseUrl, config).pipe(
    catchError(error => {
      console.error('Error updating cost config:', error);
      return throwError(() => new Error('Error actualizando configuración'));
    })
  );
}

}

