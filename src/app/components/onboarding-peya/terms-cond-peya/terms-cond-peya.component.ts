import { Component, EventEmitter, Output } from '@angular/core';
import { TermsDialogComponent } from 'src/app/utils/terms-dialog';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TERMS_AND_CONDITIONS_CONTENT } from '../../onboarding/terms-cond/terms-and-cond.constant';
import { DISCLAIMER_CONTENT } from '../../onboarding/terms-cond/disclaimer-text.constant';
import { Router } from '@angular/router';
import { SnackBarMessage } from '../../common/snackbar/snackbar';
import { OnboardingService } from 'src/app/services/onboarding.service';

@Component({
  selector: 'app-terms-peya',
  templateUrl: './terms-cond-peya.component.html',
  styleUrls: ['./terms-cond-peya.component.scss'],
})
export class TermsCondPeYaComponent {
  @Output() stepCompleted = new EventEmitter<void>();
  termsForm: FormGroup;
  warningMessage: string | null = null;
  currentStep: number = 5;
  onboardingFinished: boolean = false;
  errorMessage: string | null = null;
  isProcessing = false; // Tracks the processing state
  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private onboardingService: OnboardingService,
    private snackBarMessage: SnackBarMessage
  ) {
    this.termsForm = this.fb.group({
      terms: [false, Validators.requiredTrue],
      inv_saldo: [false],
      disclaimer: [false, Validators.requiredTrue],
    });
    this.termsForm.valueChanges.subscribe(() => {
      this.updateFormValidity();
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
        content: TERMS_AND_CONDITIONS_CONTENT,
      },
    });
  }
  ngOnInit(): void {
    // Initialize form validity on component load
    this.updateFormValidity();
  }
  updateFormValidity(): void {}
  onSubmit() {
    this.isProcessing = true;
    console.log('Form submitted', this.termsForm.value);

    this.onboardingService.termsOnboarding(this.termsForm.value).subscribe(
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
