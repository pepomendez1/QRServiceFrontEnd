import {
  Component,
  ChangeDetectorRef,
  EventEmitter,
  Output,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OnboardingService } from 'src/app/services/onboarding.service';
import { SnackBarMessage } from '../../common/snackbar/snackbar';
import { MatDialog } from '@angular/material/dialog';
import { TermsDialogComponent } from 'src/app/utils/terms-dialog';
import { TERMS_AND_CONDITIONS_INV_SALDOS } from '../../onboarding/terms-cond/terms-inv.constant';
import { TERMS_AND_CONDITIONS_CONTENT } from '../../onboarding/terms-cond/terms-and-cond.constant';
import { DISCLAIMER_CONTENT } from '../../onboarding/terms-cond/disclaimer-text.constant';
@Component({
  selector: 'app-affidavit-peya',
  templateUrl: './affidavit-peya.component.html',
  styleUrls: ['./affidavit-peya.component.scss'],
})
export class AffidavitPeYaComponent {
  @Output() stepCompleted = new EventEmitter<void>();
  currentStep: number = 5;
  AffForm: FormGroup;
  warningMessage: string | null = null;
  errorMessage: string | null = null;
  isProcessing = false; // Tracks the processing state
  constructor(
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBarMessage: SnackBarMessage,
    private onboardingService: OnboardingService
  ) {
    this.AffForm = this.fb.group({
      ocde: ['no'],
      taxId: [''],
      country: [''],
      facta: ['no'],
      secSocialNumber: [''],
      pep: ['no'],
      pepType: [''],
      suj: ['no'],
      terms: [true, Validators.requiredTrue],
      inv_saldo: [true],
      disclaimer: [true, Validators.requiredTrue],
    });
    this.AffForm.valueChanges.subscribe(() => {
      this.updateFormValidity();
      this.checkValidity();
    });
  }

  openTermDialog(): void {
    this.dialog.open(TermsDialogComponent, {
      width: '80%',
      hasBackdrop: true,
      disableClose: false,
      data: {
        title: 'Términos y Condiciones Generales de Uso',
        content: TERMS_AND_CONDITIONS_CONTENT,
      },
    });
  }

  openAffidavitDialog(): void {
    this.dialog.open(TermsDialogComponent, {
      width: '80%',
      hasBackdrop: true,
      disableClose: false,
      data: {
        title: 'Declaración Jurada',
        content: DISCLAIMER_CONTENT,
      },
    });
  }
  openAccountTerms(): void {
    this.dialog.open(TermsDialogComponent, {
      width: '80%',
      hasBackdrop: true,
      disableClose: false,
      data: {
        title: 'Términos y Condiciones de la cuenta remunerada',
        content: TERMS_AND_CONDITIONS_INV_SALDOS,
      },
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
    this.toggleFieldValidators('ocde', 'country');
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
    this.onboardingService
      .affidavitTermsOnboarding(this.AffForm.value)
      .subscribe(
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
