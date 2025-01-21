import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';

@Component({
  selector: 'app-investment-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    MatCheckbox,
    FormsModule,
  ],
  templateUrl: './investment-dialog.component.html',
  styleUrl: './investment-dialog.component.scss',
})
export class InvestmentDialogComponent {
  public messageTitle: string = '';
  public messageContent: string = '';
  public cancelText: string = 'Cancelar';
  public confirmText: string = 'Confirmar';
  public tyc: boolean = false;
  public rules: boolean = false;
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      type: string;
    },
    private dialogRef: MatDialogRef<InvestmentDialogComponent>
  ) {}

  ngOnInit() {
    if (this.data.type === 'start') {
      this.messageTitle = 'Invertir fondos';
      this.messageContent =
        'Para empezar a invertir, es necesario que aceptes nuestros Términos y Condiciones.';
      this.cancelText = 'Salir';
      this.confirmText = 'Empezar a invertir';
    } else if (this.data.type === 'stop') {
      this.messageTitle = '¿Querés dejar de invertir tus fondos?';
      this.messageContent =
        'Recordá que podés usar tu dinero mientras generás rendimientos.';
      this.cancelText = 'Seguir invirtiendo';
      this.confirmText = 'Dejar de invertir';
    }
  }
  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
