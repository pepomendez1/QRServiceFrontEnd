import { Component, Input } from '@angular/core';

@Component({
  selector: 'line-stepper',
  templateUrl: './line-stepper.component.html',
  styleUrls: ['./line-stepper.component.scss'],
})
export class LineStepperComponent {
  @Input() currentStep: number = 0; // Default to 0 (no steps completed)
  steps = [1, 2, 3, 4, 5]; // Array for 5 steps
}
