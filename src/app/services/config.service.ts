import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
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
    // The complete URL
    const url = `${this.apiUrl}/public/wibond-connect/user/auth/portalClient`;
    // Perform the GET request with headers
    return this.http.get(url, {});
  }
}
