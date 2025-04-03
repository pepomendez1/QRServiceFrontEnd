import { Component, OnInit, Output, EventEmitter } from '@angular/core';
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
import { StoreDataService } from 'src/app/services/store-data.service';
@Component({
  selector: 'app-treasury-balance',
  templateUrl: './treasury-balance.component.html',
  styleUrls: ['./treasury-balance.component.scss'],
})
export class TreasuryBalanceComponent implements OnInit {
  @Output() generalFailure = new EventEmitter<boolean>();
  availableAmount: number = 0.0; // Balance disponible
  formattedAmount: string = ''; // Balance formateado para mostrar
  integerPart: string = ''; // Parte entera del balance
  decimalPart: string = '00'; // Parte decimal del balance

  isLoading: boolean = true; // Variable para controlar el estado de carga
  transferOk: boolean = false;
  investmentActive: boolean = false;
  public totalReturns: number = 0;
  public tna: number = 0;
  public errors: string[] = [];
  investmentInfoError: boolean = false;
  constructor(
    private snackbarService: SnackbarService,
    private storeService: StoreDataService,
    private investmentService: InvestmentService,
    private treasuryService: TreasuryService,
    private sidePanelService: SidePanelService,
    private refreshService: RefreshService
  ) {}

  ngOnInit(): void {
    this.isLoading = true;

    this.storeService.getStore().subscribe((store) => {
      this.investmentActive =
        store.init_config?.balance_investments_module === 'true';

      // Prepare the API calls
      const apiCalls: {
        balance: Observable<any>;
        investmentInfo?: Observable<any>;
      } = {
        balance: this.getBalance(),
      };

      // ✅ Conditionally add investment info
      if (this.investmentActive) {
        apiCalls.investmentInfo = this.getInvestmentInfo();
      }

      // Execute API calls
      forkJoin(apiCalls).subscribe({
        next: (results) => {
          console.log('Results:', results);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Unexpected error:', error);
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        },
      });
    });

    // ✅ Subscribe to refresh service for balance updates
    this.refreshService.refresh$.subscribe(() => {
      this.isLoading = true;
      this.getBalance().subscribe(() => {
        this.isLoading = false;
      });
    });
  }

  getInvestmentInfo() {
    this.investmentInfoError = false;
    return this.investmentService.getInvestmentsInfo().pipe(
      tap((data: InvestmentsInfo) => {
        // let dataTest = {
        //   total_invested: 256212.25144531258,
        //   total_returns: 3613.8314453125004,
        //   last_daily_return: 767.21875,
        //   last_date: '2025-03-25T00:00:00Z',
        //   tna: 0.2752,
        // };
        // this.totalReturns = dataTest.total_returns;
        // this.tna = dataTest.tna;

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
}
