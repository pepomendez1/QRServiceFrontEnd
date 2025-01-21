import { Component, Inject, ViewEncapsulation } from '@angular/core';
import {
  MAT_SNACK_BAR_DATA,
  MatSnackBarRef,
} from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon'; // Import MatIconModule
import { MatButtonModule } from '@angular/material/button'; // Import MatButtonModule
import { CommonModule } from '@angular/common'; // Import CommonModule for *ngIf and other directives

@Component({
  selector: 'app-custom-snackbar',
  templateUrl: './custom-snackbar.component.html',
  styleUrls: ['./custom-snackbar.component.scss'],
  standalone: true, // Declare the component as standalone
  encapsulation: ViewEncapsulation.None, // Add this line
  imports: [CommonModule, MatIconModule, MatButtonModule], // Import necessary modules
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
}
