import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'relativeTime',
  standalone: true,
})
export class RelativeTimePipe implements PipeTransform {
  transform(timestamp: number): string {
    const date = new Date(timestamp * 1000); // Convert Unix timestamp from seconds to milliseconds
    const now = new Date();
    const difference = now.getTime() - date.getTime(); // Difference in milliseconds

    const seconds = Math.floor(difference / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `Hace ${days} día${days > 1 ? 's' : ''} `;
    } else if (hours > 0) {
      return `Hace ${hours} hora${hours > 1 ? 's' : ''} `;
    } else if (minutes > 0) {
      return `Hace ${minutes} minuto${minutes > 1 ? 's' : ''} `;
    } else {
      return `Hace ${seconds} segundo${seconds > 1 ? 's' : ''} `;
    }
  }
}
