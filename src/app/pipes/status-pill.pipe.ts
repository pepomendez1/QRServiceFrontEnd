import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'statusPill',
})
export class StatusPillPipe implements PipeTransform {
  private statusMap: Record<string, { type: string; text: string }> = {
    processed: { type: 'success', text: 'REALIZADO' },
    processing: { type: 'info', text: 'EN CURSO' },
    rejected: { type: 'error', text: 'RECHAZADO' },
  };

  transform(status: string, returnType: 'type' | 'text' = 'text'): string {
    const statusData = this.statusMap[status] || {
      type: 'default',
      text: 'DESCONOCIDO',
    };

    return returnType === 'type' ? statusData.type : statusData.text;
  }
}
