import {
  Component,
  ChangeDetectorRef,
  EventEmitter,
  Output,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OnboardingService } from 'src/app/services/onboarding.service';
import { SnackBarMessage } from '../../common/snackbar/snackbar';
@Component({
  selector: 'app-affidavit',
  templateUrl: './affidavit.component.html',
  styleUrls: ['./affidavit.component.scss'],
})
export class AffidavitComponent {
  @Output() stepCompleted = new EventEmitter<void>();
  AffForm: FormGroup;
  warningMessage: string | null = null;
  errorMessage: string | null = null;
  isProcessing = false; // Tracks the processing state
  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private snackBarMessage: SnackBarMessage,
    private onboardingService: OnboardingService
  ) {
    this.AffForm = this.fb.group({
      ocde: ['no'],
      taxId: [''],
      facta: ['no'],
      secSocialNumber: [''],
      pep: ['no'],
      pepType: [''],
      suj: ['no'],
    });
    this.AffForm.valueChanges.subscribe(() => {
      this.updateFormValidity();
      this.checkValidity();
    });
  }
  ngOnInit(): void {
    // Initialize form validity on component load
    this.updateFormValidity();
    this.cdr.detectChanges(); // Trigger change detection manually
  }

  ngAfterViewInit(): void {
    // Safe to update the form or validators here
    this.updateFormValidity();
  }

  updateFormValidity(): void {
    this.toggleFieldValidators('ocde', 'taxId');
    this.toggleFieldValidators('facta', 'secSocialNumber');
    this.toggleFieldValidators('pep', 'pepType');
  }
  toggleFieldValidators(field: string, controlName: string): void {
    if (this.AffForm.get(field)?.value === 'yes') {
      if (controlName === 'secSocialNumber') {
        this.AffForm.get(controlName)?.setValidators([
          Validators.pattern(/^\d{8}$/),
          Validators.required,
        ]);
      } else
        this.AffForm.get(controlName)?.setValidators([Validators.required]);
    } else {
      this.AffForm.get(controlName)?.clearValidators();
      //this.AffForm.get(controlName)?.reset({ onlySelf: true });
    }
    this.AffForm.get(controlName)?.updateValueAndValidity({ emitEvent: false });
  }

  checkValidity(): void {
    this.warningMessage = null; // Reset the warning message
    if (this.AffForm.get('secSocialNumber')?.hasError('pattern')) {
      this.warningMessage =
        'El valor de Social Security Number debe tener 8 dígitos y ser numérico';
    }
    // Additional checks can be added here for other fields
  }

  onSubmit() {
    if (this.AffForm.invalid) {
      this.checkValidity();
      return;
    }
    this.isProcessing = true;
    console.log('Form submitted', this.AffForm.value);
    this.warningMessage = null;
    this.onboardingService.affidavitOnboarding(this.AffForm.value).subscribe(
      () => {
        this.stepCompleted.emit();
      },
      (error: any) => {
        console.error('Failed to update step:', error);
        this.snackBarMessage.showSnackbar(
          'Error:' + error.error.message,
          'error'
        );
        this.isProcessing = false;
      }
    );
  }
}
