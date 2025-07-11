import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, delay, map } from 'rxjs/operators';
import { ApiService } from 'src/app/services/api.service';

export interface QrCode {
  id?: string;
  amount: number;
  currency: string;
  description?: string;
  expirationDate?: string;
  status?: string;
  url?: string;
}

@Injectable({
  providedIn: 'root'
})
export class QrService {
  private useMockData = false;
  private baseUrl = '/public/wibond-connect/qr';

  private mockQrs: QrCode[] = [
    {
      id: 'qr-1',
      amount: 1000,
      currency: 'ARS',
      description: 'QR de prueba',
      status: 'active',
      url: 'https://example.com/qr-1'
    }
  ];

  constructor(private apiService: ApiService) {}

  createQr(data: QrCode): Observable<QrCode> {
    if (this.useMockData) {
      const newQr = { ...data, id: `mock-${Date.now()}`, status: 'active' };
      this.mockQrs.push(newQr);
      return of(newQr).pipe(delay(500));
    }
    return this.apiService.post<QrCode>(this.baseUrl, data).pipe(
      catchError(() => throwError(() => new Error('Error creando código QR')))
    );
  }

  getAllQrs(page: number = 1, pageSize: number = 20): Observable<{ qrs: QrCode[]; total: number; page: number; pageSize: number }> {
    if (this.useMockData) {
      return of({ qrs: this.mockQrs, total: this.mockQrs.length, page, pageSize }).pipe(delay(500));
    }
    const url = `${this.baseUrl}?page=${page}&page_size=${pageSize}`;
    return this.apiService.get<{ total: number; page: number; page_size: number; qrs: QrCode[] }>(url).pipe(
      map(res => ({ qrs: res.qrs, total: res.total, page: res.page, pageSize: res.page_size })),
      catchError(error => {
        console.error('Error fetching QR codes:', error);
        return of({ qrs: [], total: 0, page, pageSize });
      })
    );
  }

  deleteQr(id: string): Observable<any> {
    if (this.useMockData) {
      this.mockQrs = this.mockQrs.filter(q => q.id !== id);
      return of(null).pipe(delay(300));
    }
    return this.apiService.delete(`${this.baseUrl}?id=${id}`).pipe(
      catchError(() => throwError(() => new Error('Error eliminando código QR')))
    );
  }
}