import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { HelpSectionComponent } from 'src/app/components/help-section/help-section.component';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-help-dialog',
  template: `
    <div class="dialog-header">
      <button mat-icon-button class="close-button" (click)="onClose()">
        <mat-icon>close</mat-icon>
      </button>
    </div>
    <app-help-section></app-help-section>
  `,
  imports: [HelpSectionComponent, MatIconModule],
  standalone: true,
  styles: [
    `
      .dialog-header {
        display: flex;
        justify-content: flex-end;
        padding: 8px;
        background: transparent; /* Optional: Adjust styling */
      }
      .close-button {
        background: transparent;
        border: none;
        cursor: pointer;
      }
      mat-icon {
        font-size: 24px;
        color: #333; /* Optional: Adjust color */
      }
    `,
  ],
})
export class HelpDialogComponent {
  constructor(public dialogRef: MatDialogRef<HelpDialogComponent>) {}

  onClose(): void {
    this.dialogRef.close();
  }
}
