import {
  Component,
  Inject,
  OnInit,
  Output,
  EventEmitter,
  ChangeDetectorRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';

import { SnackbarService } from '@fe-treasury/shared/snack-bar/snackbar.service';
import { AmountDisplayComponent } from '../../common/amount-display/amount-display.component';
import { CommonModule } from '@angular/common';
import {
  InvestmentsEnabledResponse,
  InvestmentService,
  InvestmentsInfo,
  InvestmentsStatus,
} from '../investment.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { trigger, transition, style, animate } from '@angular/animations';
import { InvestmentDialogComponent } from './investment-dialog/investment-dialog.component';

@Component({
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    AmountDisplayComponent,
    CommonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  selector: 'app-available',
  templateUrl: './available.component.html',
  styleUrl: './available.component.scss',
  animations: [
    trigger('fade', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('0.6s ease-in-out', style({ opacity: 1 })), // Increased duration
      ]),
      transition(':leave', [
        animate('0.6s ease-in-out', style({ opacity: 0 })), // Increased duration
      ]),
    ]),
  ],
})
export class AvailableComponent implements OnInit {
  @Output() generalFailure = new EventEmitter<boolean>();
  public loading = true;
  public errors: string[] = [];
  public animating = false;
  hasInversion: boolean = false; // por defecto
  public totalInvested: number = 0;
  public totalReturns: number = 0;
  public lastDailyReturn: number = 0;
  public lastDate: Date = new Date();
  public tna: number = 0;

  constructor(
    private cdr: ChangeDetectorRef,
    public dialog: MatDialog,
    private snackBarService: SnackbarService,
    private investmentService: InvestmentService
  ) {}

  ngOnInit(): void {
    this.getInvestmentsStatus();
  }

  public getInvestmentsInfo() {
    // Reset states
    this.loading = true;
    this.errors = [];
    this.animating = false; // Ensure animations don't block UI updates
    this.cdr.detectChanges(); // Immediately update the view

    // Fetch investment info
    this.investmentService.getInvestmentsInfo().subscribe({
      next: (data: InvestmentsInfo) => {
        this.totalInvested = data.total_invested;
        this.totalReturns = data.total_returns;
        this.lastDailyReturn = data.last_daily_return;
        this.lastDate = data.last_date;
        this.tna = data.tna;

        this.loading = false; // Stop spinner
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        this.errors.push(error.message);
        this.handleError(error);

        this.loading = false; // Stop spinner
        this.cdr.detectChanges();
      },
    });
  }

  public getInvestmentsStatus() {
    this.loading = true; // Show spinner during status check
    this.errors = [];
    this.cdr.detectChanges();

    this.investmentService.getInvestmentsStatus().subscribe({
      next: (status: InvestmentsStatus) => {
        if (status === 'ACTIVE') {
          this.hasInversion = true;
        }
        this.getInvestmentsInfo(); // Fetch detailed info after status
      },
      error: (error: any) => {
        this.errors.push(error.message);
        this.generalFailure.emit(true);
        this.handleError(error);

        this.loading = false; // Stop spinner
        this.cdr.detectChanges();
      },
    });
  }

  private handleError(error: any) {
    this.snackBarService.openError(error.message, true);
  }

  // private transition() {
  //   // Decouple animating logic from loading
  //   setTimeout(() => {
  //     this.animating = false;
  //     this.cdr.detectChanges(); // Ensure the UI updates after animation
  //   }, 500);
  // }

  public stopInvesting(): void {
    this.loading = true;
    this.errors = [];
    this.investmentService.callStopInvestments().subscribe({
      next: (response: InvestmentsEnabledResponse) => {
        if (response === 'OK') {
          this.hasInversion = false;
          this.getInvestmentsInfo();
          this.snackBarService.openSuccess('Dejaste de invertir', true, 3000);
        } else {
          this.snackBarService.openError('Algo salió mal', true);
          this.loading = false;
        }
      },
      error: (error: any) => {
        this.errors.push(error.message);
        this.handleError(error);
        //this.transition();
        this.loading = false;
      },
    });
  }

  getInvestmentsInfoRetry(): void {
    //add affordance to show progress in retrying
    this.loading = true;
    setTimeout(() => {
      this.getInvestmentsInfo();
    }, 500);
  }

  public startInvesting(): void {
    this.loading = true;
    this.errors = [];
    this.investmentService.callStartInvestments().subscribe({
      next: (response: InvestmentsEnabledResponse) => {
        if (response === 'OK') {
          this.hasInversion = true;
          this.getInvestmentsInfo();
          this.snackBarService.openSuccess('Empezaste a invertir', true, 3000);
        } else {
          this.snackBarService.openError('Algo salió mal', true);
          this.loading = false;
        }
      },
      error: (error: any) => {
        this.errors.push(error.message);
        this.handleError(error);
        // this.transition();
        this.loading = false;
      },
    });
  }

  openConfirmationDialog(type: string): void {
    const dialogRef = this.dialog.open(InvestmentDialogComponent, {
      panelClass: 'custom-dialog-container',
      width: '400px',
      data: { type: type },
      disableClose: true,
      backdropClass: 'backdrop-class',
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        if (type === 'start') {
          console.log('start investing');
          this.startInvesting();
        } else if (type === 'stop') {
          console.log('stop investing');
          this.stopInvesting();
        }
      }
    });
  }
}

// Componente que se muestra al hacer clic en el botón de confirmación
@Component({
  selector: 'confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>¿Estás seguro de que deseas dejar de invertir?</h2>
    <mat-dialog-content>
      Te vas a perder la oportunidad de recibir rendimientos diarios en tu
      cuenta.
    </mat-dialog-content>
    <mat-dialog-actions align="center" style="gap: 1em;">
      <button class="btn btn-link" [mat-dialog-close]="true">
        Dejar de invertir
      </button>
      <button
        class="btn btn-cta"
        style="flex: unset;"
        [mat-dialog-close]="false"
      >
        Cancelar
      </button>
    </mat-dialog-actions>
  `,
})
export class StopInvestingConfirmation {
  constructor(
    public dialogRef: MatDialogRef<StopInvestingConfirmation>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
  onNoClick(): void {
    this.dialogRef.close();
  }
}

@Component({
  selector: 'start-investin-terms-and-conditions',
  standalone: true,
  imports: [MatDialogModule, MatCheckbox, FormsModule],
  template: `
    <h2 class="heading-4-700" mat-dialog-title>Invertir fondos</h2>
    <mat-dialog-content>
      <p class="paragraph-500">
        Para empezar a invertir, es necesario que aceptes nuestros Términos y
        Condiciones.
      </p>
      <mat-checkbox [required]="true" required [(ngModel)]="tyc">
        Leí y acepto los términos y condiciones
      </mat-checkbox>
      <mat-checkbox [required]="true" required [(ngModel)]="tyc">
        Leí y acepto los términos y condiciones
      </mat-checkbox>
    </mat-dialog-content>
    <mat-dialog-actions align="center" style="gap: 1em;">
      <button [disabled]="!tyc" class="btn btn-cta" [mat-dialog-close]="true">
        Empezar a invertir
      </button>
    </mat-dialog-actions>
  `,
})
export class StartInvestinTermsAndConditions {
  public tyc: boolean = false;
  constructor(
    public dialogRef: MatDialogRef<StartInvestinTermsAndConditions>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.tyc = false;
  }
  onNoClick(): void {
    this.dialogRef.close();
  }
}
