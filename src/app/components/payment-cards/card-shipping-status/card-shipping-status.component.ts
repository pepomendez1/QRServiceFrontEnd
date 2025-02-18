import { Component, Input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SidePanelHeaderComponent } from '../../../../../@fe-treasury/shared/side-panel/side-panel-header/side-panel-header.component';
import { MatIconModule } from '@angular/material/icon';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HelpSectionComponent } from '../../help-section/help-section.component';
import { SidePanelFooterComponent } from '@fe-treasury/shared/side-panel/side-panel-footer/side-panel-footer.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-card-shipping-status',
  templateUrl: './card-shipping-status.component.html',
  styleUrl: './card-shipping-status.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    ClipboardModule,
    MatTooltipModule,
    MatProgressBarModule,
    HelpSectionComponent,
    MatProgressSpinnerModule,
    SidePanelFooterComponent,
    SidePanelHeaderComponent,
    MatIconModule,
  ],
})
export class CardShippingStatusComponent {
  @Input() data: any;
  status: string = 'Aprobada';
  statusPill: any = { text: 'Aprobada', type: 'success' };
  isLoading: boolean = true;
  openHelpIframe: boolean = false;
  steps: any = [];

  constructor(private datePipe: DatePipe) {}
  ngOnInit(): void {
    console.log('shipping data: -----  ', this.data);
    if (this.data) {
      this.getStatus();
      this.isLoading = false;
    }
  }

  getStatus() {
    switch (this.data.status) {
      case 'CREATED':
        this.statusPill = { text: 'SOLICITADA', type: 'warning' };
        this.status = 'Solicitud enviada';
        break;
      case 'TRACKED':
        this.statusPill = { text: 'PROCESADA', type: 'warning' };
        this.steps = [
          {
            title: 'Procesado',
            date: this.formatDate(this.data.modified_at),
            completed: true,
          },
          {
            title: 'En camino a la dirección de destino',
            completed: false,
          },
          { title: 'Entregado', completed: false },
        ];
        break;

      case 'REJECTED':
        this.statusPill = { text: 'RECHAZADA', type: 'error' };
        this.steps = [
          {
            title: 'Solicitud rechazada',
            date: this.formatDate(this.data.modified_at),
            error: true,
          },
          {
            title: 'En camino a la dirección de destino',
            completed: false,
          },
          { title: 'Entregado', completed: false },
        ];
        break;
      case 'IN_TRANSIT':
        this.statusPill = { text: 'EN CAMINO', type: 'warning' };
        this.steps = [
          {
            title: 'Procesado',
            completed: true,
          },
          {
            title: 'En camino a la dirección de destino',
            date: this.formatDate(this.data.modified_at),
            completed: true,
          },
          { title: 'Entregado', completed: false },
        ];
        break;
      case 'FAILED_DELIVERY_ATTEMPT':
        this.statusPill = { text: 'INTENTO FALLIDO', type: 'error' };
        this.steps = [
          {
            title: 'Procesado',
            completed: true,
          },
          {
            title: 'Intento de entrega fallido',
            date: this.formatDate(this.data.modified_at),
            error: true,
          },
          { title: 'Entregado', completed: false },
        ];
        break;
      case 'DELIVERED':
        this.statusPill = { text: 'ENTREGADO', type: 'success' };
        this.steps = [
          {
            title: 'Procesado',
            completed: true,
          },
          {
            title: 'En camino a la dirección de destino',
            completed: true,
          },
          {
            title: 'Entregado',
            date: this.formatDate(this.data.modified_at),
            completed: true,
          },
        ];
        break;
      case 'NOT_DELIVERED':
        this.statusPill = { text: 'NO ENTREGADO', type: 'error' };
        this.steps = [
          {
            title: 'Procesado',
            completed: true,
          },
          {
            title: 'En camino a la dirección de destino',
            completed: true,
          },
          {
            title: 'Entregado',
            date: this.formatDate(this.data.modified_at),
            error: true,
          },
        ];
        break;
      default:
        break;
    }
  }

  formatDate(isoDate: string): string {
    return (
      this.datePipe.transform(
        isoDate,
        "d 'de' MMMM 'de' y, h:mm'hs'",
        'es-ES'
      ) || ''
    );
  }
  openTrackingUrl(): void {
    if (this.data?.tracking_url) {
      window.open(this.data.tracking_url, '_blank'); // ✅ Opens tracking URL in new tab
    }
  }
  openHelp() {
    this.openHelpIframe = true;
  }
  backToShippingInfo() {
    this.openHelpIframe = false;
  }
}
