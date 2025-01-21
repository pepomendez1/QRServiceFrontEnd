import {
  Component,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
} from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { HelpDialogComponent } from 'src/app/utils/help-dialog';
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
  isMobile: boolean = false;
  constructor(
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
}
