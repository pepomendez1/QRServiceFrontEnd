import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IntegrationService {
  constructor() {}

  getIntegrationMethod(): Observable<string> {
    console.log('getIntegrationMethod called');

    // Verificar si existe el parámetro 'integration' en la URL
    const urlParams = new URLSearchParams(window.location.search);
    const integrationMethod = urlParams.get('i');
    console.log(`integrationMethod from URL: ${integrationMethod}`);

    if (integrationMethod) {
      console.log(`Integration method found: ${integrationMethod}`);
      return of(integrationMethod);
    } else {
      console.log('No integration method found, defaulting to: portal');
      // Devolver 'portal' por defecto si no se encuentra el parámetro o es otro valor
      return of('portal');
    }
  }
}
