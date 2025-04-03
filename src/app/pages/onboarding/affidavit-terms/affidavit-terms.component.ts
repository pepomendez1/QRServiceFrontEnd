import {
  Component,
  ChangeDetectorRef,
  EventEmitter,
  Output,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OnboardingService } from 'src/app/services/onboarding.service';
import { SnackBarMessage } from 'src/app/components/common/snackbar/snackbar';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { StoreDataService } from 'src/app/services/store-data.service';
import { TermsDialogComponent } from 'src/app/utils/terms-dialog';
import { TERMS_AND_CONDITIONS_INV_SALDOS } from './terms-cond/terms-inv.constant';
//import { TERMS_AND_CONDITIONS_CONTENT } from './terms-cond/terms-and-cond.constant';
import { DISCLAIMER_CONTENT } from './terms-cond/disclaimer-text.constant';
import {
  BreakpointObserver,
  Breakpoints,
  BreakpointState,
} from '@angular/cdk/layout';
import { Subscription } from 'rxjs';
import { DocumentService } from 'src/app/services/documents.service';
@Component({
  selector: 'app-affidavit-terms',
  templateUrl: './affidavit-terms.component.html',
  styleUrls: ['./affidavit-terms.component.scss'],
})
export class AffidavitTermsComponent {
  @Output() stepCompleted = new EventEmitter<void>();
  currentStep: number = 5;
  dialogRef!: MatDialogRef<TermsDialogComponent> | null;
  AffForm: FormGroup;
  fileContent: string = '';
  affidavitContent: string = '';
  termsInvestmentContent: string = '';
  warningMessage: string | null = null;
  breakpointSubscription!: Subscription;
  errorMessage: string | null = null;

  isProcessing = false; // Tracks the processing state
  isMobile: boolean = false;
  constructor(
    private storeDataService: StoreDataService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBarMessage: SnackBarMessage,
    private onboardingService: OnboardingService,
    private breakpointObserver: BreakpointObserver,
    private documentService: DocumentService
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

  openDialog(type: string): void {
    let title: string;
    let content: string;

    // Determine title and content based on the type
    switch (type) {
      case 'terms':
        title = 'Términos y Condiciones Generales de Uso';
        content = this.fileContent;
        break;
      case 'terms_balance_investment':
        title = 'Términos y Condiciones de la cuenta remunerada';
        content = this.termsInvestmentContent;
        break;
      case 'disclaimer':
        title = 'Declaración Jurada';
        content = this.affidavitContent;
        break;
      default:
        console.error('Invalid dialog type');
        return;
    }

    const dialogWidth = this.breakpointObserver.isMatched('(max-width: 840px)')
      ? '100%'
      : '65%';
    this.dialogRef = this.dialog.open(TermsDialogComponent, {
      width: dialogWidth,
      hasBackdrop: true,
      disableClose: false,
      data: {
        title: title,
        content: content,
      },
    });
    this.dialogRef.afterClosed().subscribe(() => {
      this.dialogRef = null; // Reset dialogRef when dialog is closed
    });
  }

  async ngOnInit() {
    // Initialize form validity on component load

    this.breakpointSubscription = this.breakpointObserver
      .observe(['(max-width: 840px)'])
      .subscribe((result: BreakpointState) => {
        this.isMobile = result.matches;
        // Dynamically update dialog size if it's already open
        if (this.dialogRef) {
          this.dialogRef.updateSize(
            this.isMobile ? '100vw' : '50%',
            this.isMobile ? '100vh' : '600px'
          );
        }
      });

    this.fileContent = await this.documentService.loadTermsAndConditions();
    this.termsInvestmentContent =
      await this.documentService.loadTermsAndConditionsBalanceInvestment();
    this.affidavitContent = await this.documentService.loadDisclaimer();
    // Reset scroll position after content is loaded

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
