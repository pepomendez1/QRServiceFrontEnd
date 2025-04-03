import { Injectable } from '@angular/core';
import { catchError, Observable, of, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private apiUrl = `${environment.apiUrl}`;
  constructor(private http: HttpClient) {}
  // Método para obtener la configuración para un partner específico.

  getConfig(): Observable<any> {
    console.log('portal client endpoint ----------------------');
    const url = `${this.apiUrl}/public/wibond-connect/user/auth/portalClient`;
    return this.http.get(url, {}).pipe(
      catchError((error) => {
        console.error('Error fetching config:', error);
        return throwError(error); // Re-throw the error to propagate it
      })
    );
  }
}
