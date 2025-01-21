import { Component, Input } from '@angular/core';
import { FormControl, ValidatorFn } from '@angular/forms';
import { CommonModule } from '@angular/common'; // For ngClass and other directives
import { ReactiveFormsModule } from '@angular/forms'; // For formControl directive
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatError } from '@angular/material/form-field';
@Component({
  selector: 'app-reactive-input',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatError,
    MatButtonModule,
  ], // Import ReactiveFormsModule here
  templateUrl: './form-input.component.html',
  styleUrls: ['./form-input.component.scss'],
})
export class ReactiveInputComponent {
  @Input() label: string = ''; // Label for the input
  @Input() placeholder: string = ''; // Placeholder text
  @Input() type: string = 'text'; // Input type
  @Input() control!: FormControl; // FormControl for input validation
  @Input() maxLength?: number; // Optional max length for input
  @Input() autocomplete?: string = 'off';
  @Input() name: string = '';
  @Input() errorMessages: string[] = []; // Error messages passed from the parent

  noErrorReport: boolean = false;
  isFocused: boolean = false; // Tracks focus state
  showErrors: boolean = false; // Controls error visibility
  hidePassword: boolean = true; // Tracks visibility state for password fields
  // Called when the input is focused
  onFocus(): void {
    this.isFocused = true;
    this.showErrors = false; // Hide errors while typing
  }

  hasValidator(control: FormControl, validatorName: string): boolean {
    const validator: ValidatorFn | null = control?.validator;
    if (!validator) return false;

    const validation = validator({} as FormControl);
    return validation?.[validatorName] !== undefined;
  }
  // Called when the input loses focus
  onBlur(): void {
    this.isFocused = false;
    this.showErrors = true; // Show errors after leaving the field
  }

  getInputType(): string {
    return this.type === 'password' && !this.hidePassword ? 'text' : this.type;
  }
}
