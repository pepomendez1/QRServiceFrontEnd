import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatOptionModule, MatRippleModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import {
  MatSnackBar,
  MatSnackBarConfig,
  MatSnackBarModule,
} from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';
import { Card, NotificationsResponse, Notification, DebtsApiResponse, DebtResponse, PaymentInfo } from '../services-payment.service';
import { MyCardsService } from '../my-services-and-taxes/my-services-and-taxes.component';
import { ServicesPaymentService } from '../services-payment.service';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { MatCard } from '@angular/material/card';
import { MatList, MatListItem } from '@angular/material/list';
import { MatCheckboxModule } from '@angular/material/checkbox';
import createFuzzySearch from '@nozbe/microfuzz';
import { RefreshService } from '@fe-treasury/shared/refresh-service/refresh-service';
import { SidePanelService } from '@fe-treasury/shared/side-panel/side-panel.service';
import { FiltersComponent } from './filters/filters.component';
import { NewServiceComponent } from '../my-services-and-taxes/new-services/new-services.component';
import { SharedService } from '../services-payment.shared-service';
import { SvgLibraryService } from 'src/app/services/svg-library.service';
import { SafeHtml } from '@angular/platform-browser';

type TransactionType = 'PURCHASE' | 'DEBIT' | 'CREDIT' | 'REFUND';

@Component({
  selector: 'app-expirations',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatSelectModule,
    MatOptionModule,
    MatRippleModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatTabGroup,
    MatTab,
    //MatCard,
    //MatList,
    //MatListItem,
    ReactiveFormsModule,
    //RouterLink,
    FormsModule,
    MatCheckboxModule
  ],
  templateUrl: './expirations.component.html',
  styleUrls: ['./expirations.component.scss'],
})
export class ExpirationsHistoryComponent implements OnInit {
  selectedPeriod = 'Todo';
  currentPage = 1;
  pageSize = 5;
  totalItems = 0;
  expirations: NotificationsResponse = {notifications: [], tx: '', mainTx: ''};
  filteredExpirations: any[] = [];
  history: any[] = [];
  filteredHistory: any[] = [];
  loading = true;
  loadingMore = false;
  activityTitle = 'Consumos con Tarjeta';
  cardSelected: Card | null = null;
  isFocused = false;
  searchQuery: string = '';
  searching: boolean = false; // Controlador del estado spinner de búsqueda
  noExpirations: boolean = false; // Controlador del estado de "sin transacciones"
  noHistory: boolean = false; // Controlador del estado de "sin transacciones"
  fuzzySearch: any;

  periodsList: string[] = [
    'Hoy',
    // 'Ayer',
    'Última semana',
    // 'Últimos 15 días',
    'Último mes',
    'Último año',
  ];
  typesList: string[] = [
    // 'Todas',
    'Agua',
    'Cable',
    'Gas',
    'Impuestos',
    'Internet',
    'Luz',
    'Telefonía',
    'Otros',
  ];


  selectedTypes = ['Todas'];
   readonly transactionTypeMapping: Record<
    TransactionType,
    { description: string; icon: string; transaction_type: string }
  > = {
    PURCHASE: {
      description: 'Pago con tarjeta',
      icon: 'credit_card',
      transaction_type: 'cash_out',
    },
    DEBIT: {
      description: 'Ajuste por cobro',
      icon: 'currency_exchange',
      transaction_type: 'cash_out',
    },
    CREDIT: {
      description: 'Devolución Tarjeta',
      icon: 'refresh',
      transaction_type: 'cash_in',
    },
    REFUND: {
      description: 'Reintegro Tarjeta',
      icon: 'featured_seasonal_and_gifts',
      transaction_type: 'cash_in',
    },
  };

  currentPayDetail:any;

  problemImg: SafeHtml | null = null;

  constructor(
    private svgLibrary: SvgLibraryService,
    private snackBar: MatSnackBar,
    private refreshService: RefreshService,
    private expirationsService: ServicesPaymentService,
    private sidePanelService: SidePanelService,
    private sharedService: SharedService
  ) {
    this.loadExpirations();
    this.loadHistory();
  }

  ngOnInit(): void {

    this.svgLibrary.getSvg('problem').subscribe((svgContent) => {
      this.problemImg = svgContent; // SafeHtml type to display SVG dynamically
      //console.log('Dynamically loaded SVG with store color:', svgContent);
    });

  // Subscribe to the refresh signal
  this.refreshService.refresh$.subscribe(() => {
    this.loadExpirations();
    this.loadHistory();
  });

  this.loading = false;

    this.sharedService.accion$.subscribe((msg) => {
      if(msg == SharedService.UPDATE_HISTORY){
        this.loadHistory();
        console.log(msg)
      } else if(msg == SharedService.UPDATE_EXPIRATIONS){
        this.loadExpirations();
        console.log(msg)
      }
    });
  }

  loadExpirations() {
    this.loading = true; // Mostrar el loader
    this.noExpirations = false; // Resetear el mensaje de "sin transacciones"

    this.expirationsService
      .getExpirations()
      .subscribe({
        next: (response) => {
          if (response) {

            this.expirations = response; // Asignar la lista de movimientos a la propiedad `transactions`
            console.log('expirations: ', this.expirations);

          } else {
            this.expirations = {notifications: [], tx: '', mainTx: '' }; // Si no hay movimientos, aseguramos que sea vacío
            this.noExpirations = true;
          }
          this.loading = false; // Asegúrate de detener el spinner después de cargar los datos
        },
        error: (err) => {
          console.error('Error al cargar las transacciones:', err);
          this.loading = false; // También detener el spinner en caso de error
        },
      });
  }

  loadHistory() {
    this.loading = true; // Mostrar el loader
    this.noHistory = false; // Resetear el mensaje de "sin transacciones"

    this.expirationsService
      .getHistory()
      .subscribe({
        next: (response) => {
          if (response) {
            let transactions = response;

            // Apply transaction limit if the flag is true
            /*if (this.limitTransactions && this.transactionLimit > 0) {
              transactions = transactions.slice(0, this.transactionLimit); // Limit the transactions
            }*/
            // Add icons to transactions

            this.history = transactions; // Asignar la lista de movimientos a la propiedad `transactions`
            /*this.expirations = transactions.map((transaction: any) => ({
              ...transaction,
              icon: this.iconLookupService.getIcon(
                transaction.type,
                transaction.source
              ),
            }));*/
            console.log('history: ', transactions);
            this.fuzzySearch = createFuzzySearch(this.history, {
              getText: (item: any) => [
                item.contact_name,
                item.description,
                item.merchant_name,
                item.amount ? item.amount.toString() : '', // Manejar null/undefined
              ],
              strategy: 'aggressive',
            });
            this.filterHistory(); // Apply the search filter whenever transactions are loaded
          } else {
            this.history = []; // Si no hay movimientos, aseguramos que sea un array vacío
            this.noHistory = true;
          }
          this.loading = false; // Asegúrate de detener el spinner después de cargar los datos
        },
        error: (err) => {
          console.error('Error al cargar las transacciones history:', err);
          this.loading = false; // También detener el spinner en caso de error
        },
      });
  }

  /*showMoreTransactions(): void {
    if (this.expirations.notifications.length >= this.totalItems || this.loadingMore) return;
    this.currentPage++;
    this.loadExpirations();
  }*/

   // Calcula el total dinámico
   get totalSeleccionado(): number {
    if(!this.expirations.notifications){
      return 0;
    }
    return this.expirations.notifications
      .filter(item => item.checked) // Filtrar solo los seleccionados
      .reduce((sum, item) => sum + item.amount, 0); // Sumar los montos
  }

  // Contador de ítems seleccionados
  get cantidadSeleccionada(): number {
    if(!this.expirations.notifications){
      return 0;
    }
    return this.expirations.notifications.filter(item => item.checked).length;
  }

    openFiltersPanel() {
      const filtersPanelRef = this.sidePanelService.open(
        FiltersComponent,
        'Filtros',
        {
          periodsList: this.periodsList,
          selectedPeriod: this.selectedPeriod,
          typesList: this.typesList,
          selectedTypes: this.selectedTypes
        }
      );

      filtersPanelRef?.instance.applyFilters.subscribe(
        (data: {
          selectedPeriod: string;
          selectedTypes: string[];
          selectedStates: string[];
        }) => {
          console.log('Filters Applied:', data);
          this.selectedPeriod = data.selectedPeriod;
          this.selectedTypes = data.selectedTypes;

          this.loadHistory();
        }
      );
    }

  filterHistory() {
      // First, filter by type and state
      const now = new Date();

      console.log('this.history', this.history);
      this.filteredHistory = this.history.filter((transaction) => {
        const matchesType =
          this.selectedTypes.includes('Todas') ||
          /*this.selectedTypes.some((category) => category === transaction.category) ||*/
          this.selectedTypes.some((category) => transaction.description.toLowerCase().includes(category.toLowerCase()));

        // Filtrar por período
        let matchesPeriod = true; // Por defecto, no filtra si 'Todos' está seleccionado

        if (this.selectedPeriod !== 'Todo') {
          const transactionDate = new Date(transaction.date);
          let startDate: Date;

          startDate = new Date();
          switch (this.selectedPeriod) {
            case 'Hoy':
              startDate.setDate(now.getDate() - 1);
              break;
            case 'Última semana':
              startDate.setDate(now.getDate() - 7);
              break;
            case 'Último mes':
              startDate.setMonth(now.getMonth() - 1);
              break;
            case 'Último año':
              startDate.setFullYear(now.getFullYear() - 1);
              break;
          }

          if (startDate) {
            matchesPeriod = transactionDate >= startDate;
          }

        }
        return matchesType && matchesPeriod;
      });

      console.log('search input history', this.searchQuery);

      console.log(
        'Filtered history after type and state filter:',
        this.filteredHistory
      );

      // Only proceed with search if there is a search term
      if (this.searchQuery.trim().length > 0) {
        this.searching = true;
        console.log('searching...');

        const searchResults = this.fuzzySearch(this.searchQuery);
        console.log('searchResults...', searchResults);
        if (searchResults) {
          this.filteredHistory = searchResults.map(
            (result: { item: any }) => result.item
          );
          this.noHistory = this.filteredHistory.length === 0;
          console.log(
            'Transactions match query:',
            this.filteredHistory.length
          );
          setTimeout(() => {
            this.searching = false;
          }, 1000);
        } else {
          console.log('No search results');
          this.noHistory = this.filteredHistory.length === 0;
          setTimeout(() => {
            this.searching = false;
          }, 1000);
        }
      } else {
        // If no search term, simply set noTransactions based on filtered transactions
        this.noHistory = this.filteredHistory.length === 0;
      }

      this.filteredHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      console.log('Final filtered History:', this.filteredHistory);
    }

  onActivityClick(activity: any) {
    console.log("Actividad seleccionada:", activity);
    // Aquí puedes navegar a otra vista, abrir un modal, etc.
    this.currentPayDetail = activity;

    this.openPayPanel();
  }

  openPayPanel() {
    const filtersPanelRef = this.sidePanelService.open(
      NewServiceComponent,
      'Filtros',
      {
        //popularServices: this.popularServices,
        //selectedCompany: this.selectedAcitivy,
        currentPayDetail: this.currentPayDetail,
        currentStep: 3
      },
      true
    );

    filtersPanelRef?.instance.applyFilters.subscribe(
      (data: {
        currentPayDetail: any;
        currentStep: number
      }) => {
        console.log('Filters Applied:', data);
        //this.selectedPeriod = data.selectedPeriod;
        //this.selectedTypes = data.selectedTypes;

        //this.loadHistory();
      }
    );
  }

  today(): string {
    return new Date().toISOString().split('T')[0]; // Obtiene la fecha en formato "YYYY-MM-DD"
  }

  isToday(expirationDate: string): boolean {
    return expirationDate === this.today();
  }

  paySelectedItem(){

    const selectedNotifications: Notification[] = this.expirations.notifications.filter(item => item.checked);
    if(selectedNotifications.length > 1){
      alert('Solo podes pagar de a un servicio a la vez, disculpa las molestias')
      return;
    }

    this.loading = true;
    this.expirationsService
      .preparePayment(selectedNotifications[0])
      .subscribe({
        next: (response: DebtsApiResponse) => {
          if (response) {
            console.log('preparePayment: ', response);

            const debts: DebtResponse[] = response.debtsResponse;

            if(debts.length == 0){
              alert('error al preparar el pago');
            }
            const debt: DebtResponse = debts[0];
            const paymentInfo: PaymentInfo = debt.response;
            paymentInfo.debts[0].debtId;

            const parts = selectedNotifications[0].agendaId.split("#");
            const clientId = parts.length > 1 ? parts[1] : ""; // Toma el valor después del primer `#`

            //alert('vas a pagar ' + paymentInfo.debts[0].debtId);
            const filtersPanelRef = this.sidePanelService.open(
              NewServiceComponent,
              'Filtros',
              {
                //popularServices: this.popularServices,
                //selectedCompany: this.selectedAcitivy,
                //currentPayDetail: this.currentPayDetail,
                preparePayment: paymentInfo,
                companyLogo: selectedNotifications[0].companyLogo,
                clientId: clientId,
                currentStep: 2
              },
              true
            );
            this.loading = false;
          } else {
            this.loading = false;
            alert('error al preparar el pago');
          }
        },
        error: (err) => {
          console.error('Error preparePayment:', err);
          this.loading = false; // También detener el spinner en caso de error
        },
      });

  }
}


