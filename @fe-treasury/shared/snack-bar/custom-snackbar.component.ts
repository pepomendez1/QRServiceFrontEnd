import { Component, Inject, ViewEncapsulation } from '@angular/core';
import {
  MAT_SNACK_BAR_DATA,
  MatSnackBarRef,
} from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-custom-snackbar',
  templateUrl: './custom-snackbar.component.html',
  styleUrls: ['./custom-snackbar.component.scss'],
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, MatIconModule, MatButtonModule],
})
export class CustomSnackbarComponent {
  constructor(
    @Inject(MAT_SNACK_BAR_DATA) public data: any,
    public snackBarRef: MatSnackBarRef<CustomSnackbarComponent>
  ) {}

  closeSnackbar() {
    if (this.snackBarRef) {
      this.snackBarRef.dismiss();
    }
  }

  handleAction() {
    if (this.data.actionEmitter) {
      this.data.actionEmitter.emit(); // Emit the action event
    }
    this.snackBarRef.dismiss(); // Optionally close the snackbar
  }
}
