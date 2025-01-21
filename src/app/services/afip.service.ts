import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { ApiService } from './api.service';

export interface AfipResponse {
  is_valid: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AfipService {
  private afipUrl = `${environment.apiUrl}/onboarding/afip`;

  constructor(private router: Router) {}

  checkAfipData(data: { cuit: number }) {
    
  }
}
