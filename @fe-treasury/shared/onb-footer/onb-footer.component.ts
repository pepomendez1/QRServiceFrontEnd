import {
  Component,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
  ChangeDetectorRef,
} from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { HelpDialogComponent } from 'src/app/utils/help-dialog';
import { TermsDialogComponent } from 'src/app/utils/terms-dialog';
import { StoreDataService } from 'src/app/services/store-data.service';

import { Subscription } from 'rxjs';
import { DocumentService } from 'src/app/services/documents.service';

@Component({
  selector: 'app-onb-footer',
  standalone: true,
  imports: [],
  templateUrl: './onb-footer.component.html',
  styleUrl: './onb-footer.component.scss',
})
export class OnbFooterComponent implements OnInit, OnDestroy {
  @Output() showHelp = new EventEmitter<boolean>();
  dialogRef!: MatDialogRef<HelpDialogComponent> | null;
  breakpointSubscription!: Subscription;

  fileContent: string = '';
  privacyContent: string = '';
  isMobile: boolean = false;

  constructor(
    private cdr: ChangeDetectorRef,
    private storeDataService: StoreDataService,
    private documentService: DocumentService, // Inject DocumentService
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

  private async loadTermsAndConditions(): Promise<void> {
    this.fileContent = await this.documentService.loadTermsAndConditions();
  }

  private async loadPrivacy(): Promise<void> {
    this.privacyContent = await this.documentService.loadPrivacyPolicy();
  }

  ngOnDestroy(): void {
    if (this.breakpointSubscription) {
      this.breakpointSubscription.unsubscribe();
    }
  }
}
