// src/app/services/text-file.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TermsService {
  async readTextFile(file: File): Promise<string> {
    const text = await file.text();
    return text;
  }
}
