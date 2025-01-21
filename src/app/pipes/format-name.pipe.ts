import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatName',
  standalone: true,
})
export class FormatNamePipe implements PipeTransform {
  transform(name: string): string {
    if (!name || !name.includes(',')) {
      return name; // Return the name as-is if it's already in the correct format
    }

    const [lastName, firstName] = name.split(',').map((part) => part.trim());
    return `${firstName} ${lastName}`; // Return in "First Last" format
  }
}
