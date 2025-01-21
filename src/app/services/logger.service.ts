import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LoggingService {
  private debugMode = environment.debugMode;

  log(...args: any[]): void {
    if (this.debugMode) {
      console.log(...args);
    }
  }

  warn(...args: any[]): void {
    if (this.debugMode) {
      console.warn(...args);
    }
  }

  error(...args: any[]): void {
    if (this.debugMode) {
      console.error(...args);
    }
  }

  info(...args: any[]): void {
    if (this.debugMode) {
      console.info(...args);
    }
  }
}
