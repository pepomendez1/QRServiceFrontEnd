import { Component, Output, EventEmitter, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
@Component({
  selector: 'app-recovery-selection',
  templateUrl: './recovery-selection.component.html',
  styleUrl: './recovery-selection.component.scss',
})
export class RecoverySelectionComponent {
  recoveryForm: FormGroup;
  @Output() sendRecoveryOption = new EventEmitter<string>();
  @Output() returnToLogin = new EventEmitter<string>();
  @Input() isMobile: boolean = false;
  constructor(private fb: FormBuilder, private router: Router) {
    this.recoveryForm = this.fb.group({
      recoveryOptions: ['password'],
    });
    this.recoveryForm.valueChanges.subscribe(() => {});
  }

  ngOnInit(): void {}
  returnToLoginButton() {
    this.returnToLogin.emit();
  }
  selectRecoveryType() {
    if (this.recoveryForm.invalid) {
      return;
    }
    {
      console.log('Form submitted: ', this.recoveryForm.value);
      const recoverOption = this.recoveryForm.value.recoveryOptions;
      this.sendRecoveryOption.emit(recoverOption); // Call stepCompleted method
    }
  }
}
