import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { forkJoin, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { TreasuryService } from 'src/app/services/treasury.service';
import { TreasuryAccountInfoComponent } from '../treasury-account-info/treasury-account-info.component';
import { SidePanelService } from '@fe-treasury/shared/side-panel/side-panel.service';
import { TransferComponent } from '../transfer/transfer.component';
import { SnackbarService } from '@fe-treasury/shared/snack-bar/snackbar.service';
import {
  InvestmentService,
  InvestmentsInfo,
} from '../investment/investment.service';
import { RefreshService } from '@fe-treasury/shared/refresh-service/refresh-service';
import { Observable } from 'rxjs';
@Component({
  selector: 'app-treasury-balance',
  templateUrl: './treasury-balance.component.html',
  styleUrls: ['./treasury-balance.component.scss'],
})
export class TreasuryBalanceComponent implements OnInit {
  @Output() generalFailure = new EventEmitter<boolean>();
  actualSection: string = 'balance'; // Control de secciones (balance, transfer, account)
  availableAmount: number = 0.0; // Balance disponible
  formattedAmount: string = ''; // Balance formateado para mostrar
  integerPart: string = ''; // Parte entera del balance
  decimalPart: string = '00'; // Parte decimal del balance
  copyMessage: string | null = null; // Mensaje de copiado
  copyMessageTimeout: any; // Control del timeout para el mensaje de copiado
  accountInfo: any = {
    // Información de la cuenta (CVU, alias)
    cvu: '',
    alias: '',
  };
  isLoading: boolean = true; // Variable para controlar el estado de carga
  transferOk: boolean = false;
  public totalReturns: number = 0;
  public tna: number = 0;
  public errors: string[] = [];
  investmentInfoError: boolean = false;
  constructor(
    private snackbarService: SnackbarService,
    private investmentService: InvestmentService,
    private treasuryService: TreasuryService,
    private sidePanelService: SidePanelService,
    private clipboard: Clipboard,
    private refreshService: RefreshService
  ) {}

  ngOnInit(): void {
    // Simulate loading to show preloader
    this.isLoading = true;

    // Use forkJoin to run both calls simultaneously
    forkJoin({
      balance: this.getBalance(),
      investmentInfo: this.getInvestmentInfo(),
    }).subscribe({
      next: (results) => {
        // Both observables completed successfully
        console.log('Results:', results);
        this.isLoading = false;
      },
      error: (error) => {
        // Errors are already handled locally; this block is not expected to be triggered
        console.error('Unexpected error:', error);
        this.isLoading = false;
      },
      complete: () => {
        // Ensure the loader is turned off after completion
        this.isLoading = false;
      },
    });

    // Subscribe to refresh service for balance updates
    this.refreshService.refresh$.subscribe(() => {
      this.isLoading = true;
      this.getBalance().subscribe(() => {
        // Balance refreshed, hide the preloader
        this.isLoading = false;
      });
    });
  }

  getInvestmentInfo() {
    this.investmentInfoError = false;
    return this.investmentService.getInvestmentsInfo().pipe(
      tap((data: InvestmentsInfo) => {
        this.totalReturns = data.total_returns;
        this.tna = data.tna;
        this.investmentInfoError = false; // Set the error flag
      }),
      catchError((error) => {
        this.investmentInfoError = true;
        console.log('error: ', error?.message);
        this.handleError('Error obteniendo información de inversiones');
        return of(); // Continue stream despite errors
      })
    );
  }

  private handleError(message: string) {
    this.snackbarService.openError(message, true);
  }

  getBalance() {
    return this.treasuryService.getBalance().pipe(
      tap((data: any) => {
        this.availableAmount = data?.balance ?? 0.0;
        this.formatBalance(this.availableAmount);
        this.transferOk = this.availableAmount > 0;
        this.accountInfo = data?.accounts[0];
      }),
      catchError((error) => {
        this.handleError('Error obteniendo información de la cuenta');
        console.log('error: ', error?.message);
        this.generalFailure.emit(true);
        return of(); // Continue stream despite errors
      })
    );
  }
  // Función para formatear el balance con separadores de miles y decimales
  formatBalance(amount: number) {
    const formatted = amount.toFixed(2); // Convertir a string con 2 decimales
    const parts = formatted.split('.'); // Dividir en parte entera y parte decimal
    this.integerPart = this.formatNumber(parts[0]); // Formatear la parte entera
    this.decimalPart = parts[1]; // Asignar la parte decimal
  }

  startTransfer(): void {
    this.sidePanelService.open(TransferComponent, 'Transferir', {}, true);
  }
  // Función para agregar separadores de miles
  formatNumber(num: string): string {
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, '.'); // Añadir puntos como separadores de miles
  }

  // Lógica para cambiar entre secciones
  showSection(): void {
    this.sidePanelService.open(
      TreasuryAccountInfoComponent,
      'Datos de la cuenta',
      {},
      false
    );
  }

  // Lógica para copiar el CVU o alias al portapapeles
  copyToClipboard(field: string) {
    let text: string;

    if (field === 'CVU') {
      text = this.accountInfo.cvu;
    } else if (field === 'Alias') {
      text = this.accountInfo.alias;
    } else if (field === '') {
      text = `nombre y apellido\n${this.accountInfo.cvu}\n${this.accountInfo.alias}`;
    } else {
      return; // Si el campo no es válido, salir de la función
    }

    this.clipboard.copy(text);
    this.copyMessage = `${field || 'Información completa'} en el portapapeles`;

    if (this.copyMessageTimeout) {
      clearTimeout(this.copyMessageTimeout);
    }

    this.copyMessageTimeout = setTimeout(() => {
      this.copyMessage = null;
    }, 3000);
  }

  // Método para detectar si el usuario está en un dispositivo móvil
  isMobile(): boolean {
    return window.innerWidth <= 600;
  }

  // Acción al hacer clic en la sección de "rendimientos generados"
  onEarningsClick() {
    console.log('Rendimientos generados clickeado');
  }
}
