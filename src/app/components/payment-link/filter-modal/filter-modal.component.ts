import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-filter-modal',
  standalone: true,
  templateUrl: './filter-modal.component.html',
  styleUrls: ['./filter-modal.component.scss'],
  imports: [CommonModule, MatDialogModule]
})
export class FilterModalComponent {
  constructor(
    public dialogRef: MatDialogRef<FilterModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string; options: string[]; selected: string }
  ) {}

  selectOption(option: string) {
    this.dialogRef.close(option);
  }
}
