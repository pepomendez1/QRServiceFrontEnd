import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { RefreshService } from '@fe-treasury/shared/refresh-service/refresh-service';
import { SidePanelService } from '@fe-treasury/shared/side-panel/side-panel.service';
import { SnackbarService } from '@fe-treasury/shared/snack-bar/snackbar.service';
import { InternationalAccountService } from 'src/app/services/international-account.service';
import { InternationalTransferComponent } from '../international-transfer/international-transfer.component';
import { catchError, of, tap } from 'rxjs';
import { TreasuryAccountInfoComponent } from '../treasury-account-info/treasury-account-info.component';
@Component({
  selector: 'app-international-balance',
  templateUrl: './international-balance.component.html',
  styleUrl: './international-balance.component.scss',
})
export class InternationalBalanceComponent implements OnInit {
  @Output() generalFailure = new EventEmitter<boolean>();
  availableAmount: number = 0.0; // Balance disponible
  formattedAmount: string = ''; // Balance formateado para mostrar
  integerPart: string = ''; // Parte entera del balance
  decimalPart: string = '00'; // Parte decimal del balance
  isLoading: boolean = true; // Variable para controlar el estado de carga
  canTransfer: boolean = false;
  accountInfo: any = {
    // Información de la cuenta (CVU, alias)
    cvu: '',
    alias: '',
  };
  constructor(
    private snackbarService: SnackbarService,
    private sidePanelService: SidePanelService,
    private internationalAccountService: InternationalAccountService,
    private refreshService: RefreshService
  ) {}

  ngOnInit(): void {
    // Simulate loading to show preloader
    this.isLoading = true;

    // Use forkJoin to run both calls simultaneously
    this.getBalance().subscribe({
      next: (results: any) => {
        // Both observables completed successfully
        console.log('Results:', results);
        this.isLoading = false;
      },
      error: (error: any) => {
        // Errors are already handled locally; this block is not expected to be triggered
        console.error('Unexpected error:', error);
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

  getBalance() {
    return this.internationalAccountService.getBalance().pipe(
      tap((data: any) => {
        this.availableAmount = data?.balance ?? 0.0;
        this.formatBalance(this.availableAmount);
        this.canTransfer = this.availableAmount > 0;
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
  private handleError(message: string) {
    this.snackbarService.openError(message, true);
  }

  // Función para formatear el balance con separadores de miles y decimales
  formatBalance(amount: number) {
    const formatted = amount.toFixed(2); // Convertir a string con 2 decimales
    const parts = formatted.split('.'); // Dividir en parte entera y parte decimal
    this.integerPart = this.formatNumber(parts[0]); // Formatear la parte entera
    this.decimalPart = parts[1]; // Asignar la parte decimal
  }

  // Función para agregar separadores de miles
  formatNumber(num: string): string {
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, '.'); // Añadir puntos como separadores de miles
  }

  startTransfer(): void {
    this.sidePanelService.open(
      InternationalTransferComponent,
      'Transferir',
      {},
      true
    );
  }

  showAccountInfo(): void {
    this.sidePanelService.open(
      TreasuryAccountInfoComponent,
      'Datos de la cuenta',
      {},
      false
    );
  }
}
