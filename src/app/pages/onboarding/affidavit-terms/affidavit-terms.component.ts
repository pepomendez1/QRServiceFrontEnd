import {
  Component,
  ChangeDetectorRef,
  EventEmitter,
  Output,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OnboardingService } from 'src/app/services/onboarding.service';
import { SnackBarMessage } from 'src/app/components/common/snackbar/snackbar';
import { MatDialog } from '@angular/material/dialog';
import { StoreDataService } from 'src/app/services/store-data.service';
import { TermsDialogComponent } from 'src/app/utils/terms-dialog';
import { TERMS_AND_CONDITIONS_INV_SALDOS } from './terms-cond/terms-inv.constant';
//import { TERMS_AND_CONDITIONS_CONTENT } from './terms-cond/terms-and-cond.constant';
import { DISCLAIMER_CONTENT } from './terms-cond/disclaimer-text.constant';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
@Component({
  selector: 'app-affidavit-terms',
  templateUrl: './affidavit-terms.component.html',
  styleUrls: ['./affidavit-terms.component.scss'],
})
export class AffidavitTermsComponent {
  @Output() stepCompleted = new EventEmitter<void>();
  currentStep: number = 5;
  AffForm: FormGroup;
  fileContent: string = '';
  warningMessage: string | null = null;
  errorMessage: string | null = null;
  isProcessing = false; // Tracks the processing state
  constructor(
    private storeDataService: StoreDataService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBarMessage: SnackBarMessage,
    private onboardingService: OnboardingService,
    private breakpointObserver: BreakpointObserver
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
    let dialogWidth = '65%'; // Default width for desktop
    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .subscribe((result) => {
        if (result.matches) {
          dialogWidth = '100%'; // Set width to 100% for mobile
        }
        this.dialog.open(TermsDialogComponent, {
          width: dialogWidth,
          hasBackdrop: true,
          disableClose: false,
          data: {
            title: 'Términos y Condiciones Generales de Uso',
            content: this.fileContent,
          },
        });
      });
  }

  openAffidavitDialog(): void {
    let dialogWidth = '65%'; // Default width for desktop
    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .subscribe((result) => {
        if (result.matches) {
          dialogWidth = '100%'; // Set width to 100% for mobile
        }
        this.dialog.open(TermsDialogComponent, {
          width: dialogWidth,
          hasBackdrop: true,
          disableClose: false,
          data: {
            title: 'Declaración Jurada',
            content: DISCLAIMER_CONTENT,
          },
        });
      });
  }
  openAccountTerms(): void {
    let dialogWidth = '65%'; // Default width for desktop
    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .subscribe((result) => {
        if (result.matches) {
          dialogWidth = '100%'; // Set width to 100% for mobile
        }
        this.dialog.open(TermsDialogComponent, {
          width: dialogWidth,
          hasBackdrop: true,
          disableClose: false,
          data: {
            title: 'Términos y Condiciones de la cuenta remunerada',
            content: TERMS_AND_CONDITIONS_INV_SALDOS,
          },
        });
      });
  }

  ngOnInit(): void {
    // Initialize form validity on component load
    this.loadTermsAndConditions();
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

  private loadTermsAndConditions(): void {
    this.storeDataService.getStore().subscribe((storeData) => {
      // Get the URL from the store or fallback to a local file
      const termsUrl =
        storeData.init_config?.terms_and_conditions ||
        '/assets/docs/terms_and_conditions.docx';

      // Fetch the document content
      this.fetchDocxContent(termsUrl);
    });
  }

  private async fetchDocxContent(url: string) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const arrayBuffer = await response.arrayBuffer();

      // Lazy load mammoth
      const Mammoth = await import('mammoth');
      const result = await Mammoth.extractRawText({ arrayBuffer });
      this.fileContent = result.value;
    } catch (error) {
      console.error('Error fetching or parsing terms and conditions:', error);
      this.fileContent = 'Error loading terms and conditions.';
    }
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
