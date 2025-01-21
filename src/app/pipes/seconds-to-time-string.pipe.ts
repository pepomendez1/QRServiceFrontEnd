import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'secondsToTimeString',
  standalone: true
})
export class SecondsToTimeStringPipe implements PipeTransform {

  transform(value: number): string | null {
    if (value > 0) {
      const minutes = Math.floor(value / 60);
      const seconds = value % 60;
      return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
    return null;
  }

}
