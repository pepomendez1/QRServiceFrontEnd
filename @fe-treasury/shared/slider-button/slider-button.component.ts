import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-slider-button',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './slider-button.component.html',
  styleUrl: './slider-button.component.scss',
})
export class SliderButtonComponent {
  @Input() iconOptions: boolean = false;
  @Input() iconLeft: string = '';
  @Input() iconRight: string = '';
  @Input() sizeHeight: string = '';
  @Input() sizeWidth: string = '';
  @Input() sliderRight: string = 'right';
  @Input() sliderLeft: string = 'left';
  @Input() defaultOption: string = 'left';
  @Output() optionSelected = new EventEmitter<string>();
  typeDestination: string = 'left';
  ngOnInit(): void {
    this.typeDestination = this.defaultOption; // Opción por defecto
  }

  selectOption(option: string) {
    this.typeDestination = option;
    this.optionSelected.emit(this.typeDestination); // Emitimos el evento al padre para actualizar el destino seleccionado
  }
}
