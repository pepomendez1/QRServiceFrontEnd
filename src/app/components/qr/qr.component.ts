import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { QrService, QrCode } from './qr.service';

@Component({
  selector: 'app-qr',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule, MatInputModule],
  templateUrl: './qr.component.html',
  styleUrl: './qr.component.scss'
})
export class QrComponent implements OnInit {
  qrs: QrCode[] = [];
  newQr: Partial<QrCode> = {};
  loading = false;

  constructor(private qrService: QrService) {}

  ngOnInit(): void {
    this.loadQrs();
  }

  loadQrs(): void {
    this.loading = true;
    this.qrService.getAllQrs().subscribe({
      next: res => {
        this.qrs = res.qrs;
        this.loading = false;
      },
      error: err => {
        console.error('Error fetching QR codes', err);
        this.loading = false;
      }
    });
  }

  generateQr(): void {
    if (!this.newQr.amount || !this.newQr.currency) {
      return;
    }
    const payload = { ...this.newQr } as QrCode;
    this.qrService.createQr(payload).subscribe({
      next: () => {
        this.newQr = {};
        this.loadQrs();
      },
      error: err => console.error('Error creating QR', err)
    });
  }

  deleteQr(id: string): void {
    this.qrService.deleteQr(id).subscribe({
      next: () => this.loadQrs(),
      error: err => console.error('Error deleting QR', err)
    });
  }
}
