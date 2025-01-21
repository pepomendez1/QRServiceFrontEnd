import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';

@Component({
  selector: 'app-terms-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatDialogModule],
  templateUrl: './terms-dialog.html',
  styleUrl: './terms-dialog.scss',
})
export class TermsDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<TermsDialogComponent>, // Inject MatDialogRef
    @Inject(MAT_DIALOG_DATA) public data: { title: string; content: string }
  ) {}
  onAccept(): void {
    this.dialogRef.close();
  }
}
