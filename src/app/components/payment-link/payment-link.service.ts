import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, delay, map, switchMap } from 'rxjs/operators';
import { OnboardingService } from 'src/app/services/onboarding.service';
import { ApiService } from 'src/app/services/api.service';

export interface PaymentLink {
  id?: string;
  amount: number;
  currency: string;
  description?: string;
  expirationDate?: string;
  status?: string;
  url?: string;
}

@Injectable({
  providedIn: 'root',
})
export class PaymentLinkService {
  private useMockData: boolean = false; // ✅ Toggle between mock data and real API
  private baseUrl: string = '/public/wibond-connect/payment-link'; // ✅ API Endpoint
  private mockBaseUrl = 'https://payment-portal-nprod.wibond.co/?link_id='; // 🔹 Mock base URL
  
  private mockLinks: PaymentLink[] = [
    {
      id: 'link-123',
      amount: 1500.75,
      currency: 'ARS',
      description: 'Pago de servicio A',
      expirationDate: '2025-03-01',
      status: 'active',
    },
    {
      id: 'link-456',
      amount: 500,
      currency: 'ARS',
      description: 'Pago de reserva',
      expirationDate: '2025-03-05',
      status: 'active',
    },
  ];

  constructor(private onboardingService: OnboardingService, private apiService: ApiService) {}

  

// ✅ Create Payment Link 
createPaymentLink(link: PaymentLink): Observable<PaymentLink> {
  if (this.useMockData) {
    const newMockLink = { 
      ...link, 
      id: `mock-${Math.random().toString(36).substr(2, 9)}`, 
      status: 'active' 
    };
    this.mockLinks.push(newMockLink);
    return of(newMockLink).pipe(delay(1000)); // Simulating API delay
  } else {
    return this.apiService.post<PaymentLink>(this.baseUrl, link).pipe(
      catchError((error) => throwError(() => new Error('Error creando link de pago')))
    );
  }
}

 getAllPaymentLinks(page: number = 1, pageSize: number = 20): Observable<{ links: PaymentLink[]; total: number; page: number; pageSize: number }> {
  if (this.useMockData) {
    const mockLinks: PaymentLink[] = [
      { id: '123', amount: 1500.75, currency: 'ARS', description: 'Pago de servicio A', expirationDate: '2025-03-01' },
      { id: '456', amount: 500, currency: 'ARS', description: 'Pago de reserva', expirationDate: '2025-03-05' }
    ];

    return of({
      links: mockLinks.map(link => ({
        ...link,
        url: this.mockBaseUrl + link.id
      })),
      total: mockLinks.length,
      page,
      pageSize
    }).pipe(delay(1000));
  } else {
    // Add pagination parameters to API URL
    const paginatedUrl = `${this.baseUrl}?page=${page}&page_size=${pageSize}`;

    return this.apiService.get<{ total: number; page: number; page_size: number; links: PaymentLink[] }>(paginatedUrl).pipe(
      map(response => {
        if (!response.links || !Array.isArray(response.links)) {
          throw new Error('Invalid response structure');
        }
        return {
          links: response.links.map(link => ({
            ...link,
            url: this.mockBaseUrl + link.id
          })),
          total: response.total,
          page: response.page,
          pageSize: response.page_size
        };
      }),
      catchError(error => {
        console.error('Error fetching payment links:', error);
        return of({ links: [], total: 0, page, pageSize });
      })
    );
  }
}

getTransactions(page: number = 1, pageSize: number = 20): Observable<{ transactions: any[]; total: number; page: number; pageSize: number }> {
    const paginatedUrl = `${this.baseUrl}/transaction?page=${page}&page_size=${pageSize}`;

    return this.apiService.get<{ total: number; page: number; page_size: number; transactions: any[] }>(paginatedUrl).pipe(
      map(response => {
        if (!response.transactions || !Array.isArray(response.transactions)) {
          throw new Error('Invalid response structure');
        }
        return {
          transactions: response.transactions,
          total: response.total,
          page: response.page,
          pageSize: response.page_size
        };
      }),
      catchError(error => {
        console.error('Error fetching transactions:', error);
        return of({ transactions: [], total: 0, page, pageSize });
      })
    );
  }


  // ✅ Get Payment Link by ID
  getPaymentLinkById(id: string): Observable<PaymentLink> {
    if (this.useMockData) {
      const link = this.mockLinks.find((l) => l.id === id);
      return link ? of(link).pipe(delay(500)) : throwError(() => new Error('Link no encontrado'));
    } else {
      return this.apiService.get<PaymentLink>(`${this.baseUrl}?id=${id}`).pipe(
        catchError((error) => throwError(() => new Error('Error obteniendo el link de pago')))
      );
    }
  }

  // ✅ Update Payment Link
  updatePaymentLink(updatedLink: PaymentLink): Observable<PaymentLink> {
    if (this.useMockData) {
      const index = this.mockLinks.findIndex((l) => l.id === updatedLink.id);
      if (index !== -1) {
        this.mockLinks[index] = { ...this.mockLinks[index], ...updatedLink };
        return of(this.mockLinks[index]).pipe(delay(500));
      } else {
        return throwError(() => new Error('Link de pago no encontrado'));
      }
    } else {
      return this.apiService.put<PaymentLink>(this.baseUrl, updatedLink).pipe(
        catchError((error) => throwError(() => new Error('Error actualizando link de pago')))
      );
    }
  }
}
