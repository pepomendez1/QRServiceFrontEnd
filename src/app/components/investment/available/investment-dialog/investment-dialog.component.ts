import { ChangeDetectorRef, Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialog,
} from '@angular/material/dialog';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { TermsDialogComponent } from 'src/app/utils/terms-dialog';
import { DocumentService } from 'src/app/services/documents.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-investment-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    MatCheckbox,
    FormsModule,
  ],
  templateUrl: './investment-dialog.component.html',
  styleUrl: './investment-dialog.component.scss',
})
export class InvestmentDialogComponent {
  termsdialogRef!: MatDialogRef<TermsDialogComponent> | null;
  public messageTitle: string = '';
  public messageContent: string = '';
  public cancelText: string = 'Cancelar';
  public confirmText: string = 'Confirmar';
  public tyc: boolean = false;
  fciPolicy: string = '';
  isMobile: boolean = false;
  termsInvestmentContent: string = '';
  breakpointSubscription!: Subscription;
  public rules: boolean = false;
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      type: string;
    },
    private cdr: ChangeDetectorRef,
    private breakpointObserver: BreakpointObserver,
    private dialog: MatDialog,
    private documentService: DocumentService,
    private dialogRef: MatDialogRef<InvestmentDialogComponent>
  ) {}

  async ngOnInit() {
    if (this.data.type === 'start') {
      this.messageTitle = 'Invertir fondos';
      this.messageContent =
        'Para empezar a invertir, es necesario que aceptes nuestros Términos y Condiciones.';
      this.cancelText = 'Salir';
      this.confirmText = 'Empezar a invertir';
    } else if (this.data.type === 'stop') {
      this.messageTitle = '¿Querés dejar de invertir tus fondos?';
      this.messageContent =
        'Recordá que podés usar tu dinero mientras generás rendimientos.';
      this.cancelText = 'Seguir invirtiendo';
      this.confirmText = 'Dejar de invertir';
    }

    this.breakpointSubscription = this.breakpointObserver
      .observe(['(max-width: 840px)'])
      .subscribe((result: BreakpointState) => {
        this.isMobile = result.matches;
        // Dynamically update dialog size if it's already open
        if (this.termsdialogRef) {
          this.termsdialogRef.updateSize(
            this.isMobile ? '100vw' : '50%',
            this.isMobile ? '100vh' : '600px'
          );
        }
      });

    this.fciPolicy = await this.documentService.loadFCIPolicy();
    this.termsInvestmentContent =
      await this.documentService.loadTermsAndConditionsBalanceInvestment();
    this.cdr.detectChanges(); // Trigger change detection manually
  }
  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  openDialog(type: string): void {
    let title: string;
    let content: string;

    switch (type) {
      case 'fci_policy':
        title = 'Términos y Condiciones Generales de Uso';
        content = this.fciPolicy;
        break;
      case 'terms_balance_investment':
        title = 'Términos y Condiciones de la cuenta remunerada';
        content = this.termsInvestmentContent;
        break;
      default:
        console.error('Invalid dialog type');
        return;
    }
    const dialogWidth = this.breakpointObserver.isMatched('(max-width: 840px)')
      ? '100%'
      : '65%';
    this.termsdialogRef = this.dialog.open(TermsDialogComponent, {
      width: dialogWidth,
      hasBackdrop: true,
      disableClose: false,
      data: {
        title: title,
        content: content,
      },
    });
    this.dialogRef.afterClosed().subscribe(() => {
      this.termsdialogRef = null; // Reset dialogRef when dialog is closed
    });
  }
}
