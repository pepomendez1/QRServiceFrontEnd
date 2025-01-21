import { Injectable } from '@angular/core';
import {
  MatSnackBar,
  MatSnackBarConfig,
  MatSnackBarRef,
} from '@angular/material/snack-bar';
import { CustomSnackbarComponent } from './custom-snackbar.component'; // Adjust the path accordingly

@Injectable({
  providedIn: 'root',
})
export class SnackbarService {
  constructor(private snackBar: MatSnackBar) {}

  openSuccess(message: string, showClose: boolean = false, duration?: number) {
    this.openCustomSnackbar(message, 'success', showClose, duration);
  }

  openError(message: string, showClose: boolean = false, duration?: number) {
    this.openCustomSnackbar(message, 'error', showClose, duration);
  }

  openInfo(message: string, showClose: boolean = false, duration?: number) {
    this.openCustomSnackbar(message, 'info', showClose, duration);
  }

  private openCustomSnackbar(
    message: string,
    type: 'success' | 'error' | 'info',
    showClose: boolean,
    duration?: number
  ) {
    const config: MatSnackBarConfig = {
      duration: duration ?? (showClose ? undefined : 3000),
      data: { message, showClose },
      panelClass: [`snackbar-${type}`],
    };

    const snackBarRef: MatSnackBarRef<CustomSnackbarComponent> =
      this.snackBar.openFromComponent(CustomSnackbarComponent, config);

    if (showClose) {
      snackBarRef.instance.snackBarRef = snackBarRef;
    }

    //this.snackBar.openFromComponent(CustomSnackbarComponent, config);
  }
}
