import { Injectable } from '@angular/core';
import {
  MatSnackBar,
  MatSnackBarConfig,
  MatSnackBarRef,
} from '@angular/material/snack-bar';
import { EventEmitter } from '@angular/core';
import { CustomSnackbarComponent } from './custom-snackbar.component'; // Adjust the path accordingly

@Injectable({
  providedIn: 'root',
})
export class SnackbarService {
  private activeSnackbarRef?: MatSnackBarRef<CustomSnackbarComponent>;
  constructor(private snackBar: MatSnackBar) {}

  openSuccess(
    message: string,
    showClose: boolean = false,
    duration?: number,
    actionButton?: string,
    actionCallback?: () => void
  ) {
    this.openCustomSnackbar(
      message,
      'success',
      showClose,
      duration,
      actionButton,
      actionCallback
    );
  }

  openError(
    message: string,
    showClose: boolean = false,
    duration?: number,
    actionButton?: string,
    actionCallback?: () => void
  ) {
    this.openCustomSnackbar(
      message,
      'error',
      showClose,
      duration,
      actionButton,
      actionCallback
    );
  }

  openInfo(
    message: string,
    showClose: boolean = false,
    duration?: number,
    actionButton?: string,
    actionCallback?: () => void
  ) {
    this.openCustomSnackbar(
      message,
      'info',
      showClose,
      duration,
      actionButton,
      actionCallback
    );
  }

  openWarning(
    message: string,
    showClose: boolean = false,
    duration?: number,
    actionButton?: string,
    actionCallback?: () => void
  ) {
    this.openCustomSnackbar(
      message,
      'warning',
      showClose,
      duration,
      actionButton,
      actionCallback
    );
  }

  private openCustomSnackbar(
    message: string,
    type: 'success' | 'error' | 'info' | 'warning',
    showClose: boolean,
    duration?: number,
    actionButton?: string,
    actionCallback?: () => void
  ) {
    const actionEmitter = new EventEmitter<void>();

    if (actionCallback) {
      actionEmitter.subscribe(() => actionCallback());
    }

    const config: MatSnackBarConfig = {
      duration: duration ?? (showClose ? undefined : 3000),
      data: { message, showClose, actionButton, actionEmitter },
      panelClass: [`snackbar-${type}`, 'custom-snackbar-panel'],
    };

    // Store reference to the active snackbar
    this.activeSnackbarRef = this.snackBar.openFromComponent(
      CustomSnackbarComponent,
      config
    );

    if (showClose) {
      this.activeSnackbarRef.instance.snackBarRef = this.activeSnackbarRef;
    }
  }

  close(): void {
    if (this.activeSnackbarRef) {
      this.activeSnackbarRef.dismiss();
      this.activeSnackbarRef = undefined; // Reset reference after closing
    }
  }
}
