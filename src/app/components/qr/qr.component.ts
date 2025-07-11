import { Component, OnInit } from '@angular/core';
import { QrService, QrCode } from '../../services/qr.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from './confirm-dialog.component'; 

@Component({
  selector: 'app-qr',
  templateUrl: './qr.component.html',
  styleUrls: ['./qr.component.scss']
})
export class QrComponent implements OnInit {
  qrs: QrCode[] = [];
  loading = false;

  // Estado del formulario
  newQr: QrCode = {
    amount: 0,
    currency: 'ARS',
    description: ''
  };

    constructor(
    private qrService: QrService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
    ) {}

  ngOnInit(): void {
    this.fetchQrs();
  }

  fetchQrs(): void {
    this.loading = true;
    this.qrService.getAllQrs().subscribe(response => {
      this.qrs = response.qrs;
      this.loading = false;
    });
  }

  generateQr(): void {
    const payload: QrCode = {
        ...this.newQr,
        amount: this.newQr.amount.toString() as any
    };

    this.qrService.createQr(payload).subscribe((newQr: QrCode) => {
        this.qrs.unshift(newQr);
        this.resetForm();
        this.snackBar.open('✅ QR generado con éxito', 'Cerrar', { duration: 3000 });
    });
    }

  deleteQr(id: string): void {
    this.qrService.deleteQr(id).subscribe(() => {
        this.qrs = this.qrs.filter(qr => qr.id !== id);
        this.snackBar.open('🗑️ QR eliminado correctamente', 'Cerrar', { duration: 3000 });
    });
    }

  confirmDelete(id: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '300px',
        data: {
        message: '¿Estás seguro que querés eliminar este QR?'
        }
    });

    dialogRef.afterClosed().subscribe(result => {
        if (result === true) {
        this.deleteQr(id);
        }
    });
    }
    

  private resetForm(): void {
    this.newQr = {
      amount: 0,
      currency: 'ARS',
      description: ''
    };
  }
}
