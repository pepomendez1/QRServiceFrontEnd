// src/app/services/snackbar.service.ts
import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class SnackBarMessage {
  constructor(private snackBar: MatSnackBar) {}

  showSnackbar(message: string, type: 'error' | 'warning' | 'success'): void {
    let config: MatSnackBarConfig = {
      duration: 50000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: [] as string[],
    };

    switch (type) {
      case 'error':
        (config.panelClass as string[]).push('error-snackbar');
        break;
      case 'warning':
        (config.panelClass as string[]).push('error-snackbar');
        break;
      case 'success':
        (config.panelClass as string[]).push('error-snackbar');
        break;
    }

    this.snackBar.open(message, 'Cerrar', config);
  }
}
