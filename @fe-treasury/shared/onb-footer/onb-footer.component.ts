import {
  Component,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
  ChangeDetectorRef,
} from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import {
  BreakpointObserver,
  Breakpoints,
  BreakpointState,
} from '@angular/cdk/layout';
import { HelpDialogComponent } from 'src/app/utils/help-dialog';
import { TermsDialogComponent } from 'src/app/utils/terms-dialog';
import { StoreDataService } from 'src/app/services/store-data.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-onb-footer',
  standalone: true,
  imports: [],
  templateUrl: './onb-footer.component.html',
  styleUrl: './onb-footer.component.scss',
})
export class OnbFooterComponent {
  @Output() showHelp = new EventEmitter<boolean>();
  dialogRef!: MatDialogRef<HelpDialogComponent> | null;
  breakpointSubscription!: Subscription;
  private termsDialogSubscription!: Subscription;
  private privacyDialogSubscription!: Subscription;

  fileContent: string = '';
  privacyContent: string = '';
  isMobile: boolean = false;
  constructor(
    private cdr: ChangeDetectorRef,
    private storeDataService: StoreDataService,
    private breakpointObserver: BreakpointObserver,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
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
    this.loadTermsAndConditions();
    this.loadPrivacy();
    this.cdr.detectChanges(); // Trigger change detection manually
  }
  public goToHelp() {
    this.showHelp.emit(true);
    const isMobile = this.breakpointObserver.isMatched('(max-width: 840px)');
    console.log('Is mobile:', isMobile); // Debugging

    this.dialogRef = this.dialog.open(HelpDialogComponent, {
      width: isMobile ? '100vw' : '50%',
      height: isMobile ? '100vh' : '600px',
      hasBackdrop: isMobile ? false : true,
      disableClose: isMobile ? true : false, // Prevent closing with click outside; can only be closed with the "X" button
      panelClass: isMobile ? 'mobile-dialog' : 'desktop-dialog',
    });

    this.dialogRef.afterClosed().subscribe(() => {
      this.dialogRef = null; // Reset dialogRef when dialog is closed
    });
  }

  public goToTerms() {
    const dialogWidth = this.breakpointObserver.isMatched('(max-width: 840px)')
      ? '100%'
      : '65%';

    this.dialog.open(TermsDialogComponent, {
      width: dialogWidth,
      hasBackdrop: true,
      disableClose: false,
      data: {
        title: 'Términos y Condiciones Generales de Uso',
        content: this.fileContent,
      },
    });
  }

  public goToPrivacy() {
    const dialogWidth = this.breakpointObserver.isMatched('(max-width: 840px)')
      ? '100%'
      : '65%';

    this.dialog.open(TermsDialogComponent, {
      width: dialogWidth,
      hasBackdrop: true,
      disableClose: false,
      data: {
        title: 'Política de privacidad',
        content: this.privacyContent,
      },
    });
  }
  private loadTermsAndConditions(): void {
    this.storeDataService.getStore().subscribe((storeData) => {
      const termsUrl =
        storeData.init_config?.terms_and_conditions ||
        '/assets/docs/terms_and_conditions.docx';

      this.fetchDocxContent(
        termsUrl,
        (content) => (this.fileContent = content),
        'Error loading terms and conditions.'
      );
    });
  }

  private loadPrivacy(): void {
    this.storeDataService.getStore().subscribe((storeData) => {
      const privacyUrl =
        storeData.init_config?.privacy_policy ||
        '/assets/docs/privacy_policy.docx';

      this.fetchDocxContent(
        privacyUrl,
        (content) => (this.privacyContent = content),
        'Error loading privacy policy.'
      );
    });
  }

  private async fetchDocxContent(
    url: string,
    contentUpdater: (content: string) => void,
    errorMessage: string
  ) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const arrayBuffer = await response.arrayBuffer();

      // Lazy load Mammoth
      const Mammoth = await import('mammoth');
      const result = await Mammoth.extractRawText({ arrayBuffer });
      contentUpdater(result.value);
    } catch (error) {
      console.error('Error fetching or parsing document:', error);
      contentUpdater(errorMessage);
    }
  }

  ngOnDestroy(): void {
    if (this.breakpointSubscription) {
      this.breakpointSubscription.unsubscribe();
    }
  }
}
