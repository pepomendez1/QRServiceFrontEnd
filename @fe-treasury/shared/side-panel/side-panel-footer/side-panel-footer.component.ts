import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgFor, NgIf, CommonModule } from '@angular/common';

@Component({
  selector: 'app-side-panel-footer',
  standalone: true,
  imports: [NgFor, NgIf, CommonModule],
  templateUrl: './side-panel-footer.component.html',
  styleUrl: './side-panel-footer.component.scss',
})
export class SidePanelFooterComponent {
  @Input() buttonStyle: 'ghost' | 'filled' | 'two' = 'ghost'; // Default is 'ghost'
  @Input() buttonDisabled: boolean = false; // Optional icon for the button
  @Input() buttonText: string = 'Continuar'; // Optional icon for the button
  @Input() buttonLeftText: string = 'Finalizar'; // Optional icon for the button
  @Input() buttonRightText: string = 'Siguiente'; // Optional icon for the button
  @Output() buttonClicked = new EventEmitter<void>();
  @Output() buttonLeftClicked = new EventEmitter<void>();
  @Output() buttonRightClicked = new EventEmitter<void>();

  onButtonClicked(): void {
    this.buttonClicked.emit();
  }
  onButtonLeftClicked(): void {
    this.buttonLeftClicked.emit();
  }
  onButtonRightClicked(): void {
    this.buttonRightClicked.emit();
  }
}
