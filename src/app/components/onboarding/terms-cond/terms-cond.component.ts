import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TermsDialogComponent } from 'src/app/utils/terms-dialog';
import { MatDialog } from '@angular/material/dialog';
import { OnboardingService } from 'src/app/services/onboarding.service';
import { TERMS_AND_CONDITIONS_CONTENT } from './terms-and-cond.constant';
import { DISCLAIMER_CONTENT } from './disclaimer-text.constant';
import { SnackBarMessage } from '../../common/snackbar/snackbar';
@Component({
  selector: 'app-terms-cond',
  templateUrl: './terms-cond.component.html',
  styleUrls: ['./terms-cond.component.scss'],
})
export class TermsAndCondComponent {
  @Output() stepCompleted = new EventEmitter<void>();
  termsForm: FormGroup;
  warningMessage: string | null = null;
  errorMessage: string | null = null;
  isProcessing = false; // Tracks the processing state
  //readonly dialog = inject(MatDialog);

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private onboardingService: OnboardingService,
    private snackBarMessage: SnackBarMessage
  ) {
    this.termsForm = this.fb.group({
      terms: [false, Validators.requiredTrue],
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
  // async openDialog() {
  //   const response = await fetch('assets/terms-and-conditions.txt');
  //   const content = await response.text();

  //   this.dialog.open(TermsDialogComponent, {
  //     data: { content },
  //   });
  // }
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
