import { Component, ViewEncapsulation, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TreasuryService } from '../../services/treasury.service';
import { Router } from '@angular/router';
import { FormatNamePipe } from 'src/app/pipes/format-name.pipe';
import { RefreshService } from '@fe-treasury/shared/refresh-service/refresh-service';
import { SidePanelService } from '@fe-treasury/shared/side-panel/side-panel.service';
import { ActivityDetailsComponent } from '../treasury/activity-details/activity-details.component';
import { FiltersComponent } from './filters/filters.component';
import createFuzzySearch from '@nozbe/microfuzz';
import { SvgLibraryService } from 'src/app/services/svg-library.service';
import { SafeHtml } from '@angular/platform-browser';
import { IconLookupService } from 'src/app/services/layout/transactionIcon.service';
import { map } from 'rxjs';
import { stat } from 'fs';
import { combineLatestInit } from 'rxjs/internal/observable/combineLatest';
@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-treasury-activity',
  templateUrl: './treasury-activity.component.html',
  styleUrls: ['./treasury-activity.component.scss'],
})
export class TreasuryActivityComponent {
  @Input() hideFilters: boolean = false;
  @Input() initialFilter: boolean = false;
  @Input() hideTitle: boolean = true;
  @Input() headerTitle: string = 'Actividad';
  @Input() activityShortcut: boolean = false;

  @Input() limitTransactions: boolean = false; // Flag to limit the number of transactions
  @Input() transactionLimit: number = 5; // Default limit of 5 transactions

  isFocused = false;
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
    'Transferencias realizadas',
    'Transferencias recibidas',
  ];
  typesMap: any = {
    'Transferencias realizadas': 'cash_out',
    'Transferencias recibidas': 'cash_in',
  };
  statesList: string[] = [
    // 'Todos',
    'Aprobados',
    'Rechazados',
    'Cancelados',
  ];
  statesMap: any = {
    Todos: 'Todos',
    Aprobados: 'processed',
    Rechazados: 'rejected',
    Cancelados: 'cancelled',
  };

  selectedPeriod = 'Último mes';
  selectedTypes = ['Todas'];
  selectedStates = ['Todos'];
  searchQuery: string = '';
  problemImg: SafeHtml | null = null;
  accountBalance: any;
  transactions: any[] = [];
  filteredTransactions: any[] = [];
  loading: boolean = false; // Controlador del estado del loader
  noTransactions: boolean = false; // Controlador del estado de "sin transacciones"
  fuzzySearch: any;
  searching: boolean = false; // Controlador del estado spinner de búsqueda
  constructor(
    private svgLibrary: SvgLibraryService,
    private treasuryService: TreasuryService,
    private router: Router,
    private iconLookupService: IconLookupService,
    private refreshService: RefreshService,
    private sidePanelService: SidePanelService
  ) {
    this.loadTransactions();
  }

  ngOnInit(): void {
    this.svgLibrary.getSvg('problem').subscribe((svgContent) => {
      this.problemImg = svgContent; // SafeHtml type to display SVG dynamically
      //console.log('Dynamically loaded SVG with store color:', svgContent);
    });
    // Subscribe to the refresh signal
    this.refreshService.refresh$.subscribe(() => {
      this.loadTransactions();
    });
  }
  //cambio de prueba
  // Filter transactions based on the search input
  filterTransactions() {
    // First, filter by type and state
    this.filteredTransactions = this.transactions.filter((transaction) => {
      const matchesType =
        this.selectedTypes.includes('Todas') ||
        this.selectedTypes.some(
          (type) => this.typesMap[type] === transaction.type
        );

      const matchesState =
        this.selectedStates.includes('Todos') ||
        this.selectedStates.some(
          (state) => this.statesMap[state] === transaction.status
        );

      return matchesType && matchesState;
    });

    console.log(
      'Filtered transactions after type and state filter:',
      this.filteredTransactions
    );

    // Only proceed with search if there is a search term
    if (this.searchQuery.trim().length > 0) {
      this.searching = true;
      console.log('searching...');

      const searchResults = this.fuzzySearch(this.searchQuery);

      if (searchResults) {
        this.filteredTransactions = searchResults.map(
          (result: { item: any }) => result.item
        );
        this.noTransactions = this.filteredTransactions.length === 0;
        console.log(
          'Transactions match query:',
          this.filteredTransactions.length
        );
        setTimeout(() => {
          this.searching = false;
        }, 1000);
      } else {
        console.log('No search results');
        this.noTransactions = this.filteredTransactions.length === 0;
        setTimeout(() => {
          this.searching = false;
        }, 1000);
      }
    } else {
      // If no search term, simply set noTransactions based on filtered transactions
      this.noTransactions = this.filteredTransactions.length === 0;
    }

    console.log('Final filtered transactions:', this.filteredTransactions);
  }

  // Ejemplo de opciones a deshabilitar
  disabledOptions = [
    'Transferencias realizadas',
    'Transferencias recibidas',
    'Todas',
    'Todos',
    'Aprobados',
    'Cancelados',
    'Rechazados',
  ];

  isDisabled(option: string): boolean {
    return this.disabledOptions.includes(option);
  }

  loadTransactions() {
    this.loading = true; // Mostrar el loader
    this.noTransactions = false; // Resetear el mensaje de "sin transacciones"

    this.treasuryService
      .getTransactionsByPeriod(this.selectedPeriod)
      .subscribe({
        next: (response) => {
          if (response?.movements) {
            let transactions = response.movements;
            //let transactions = <any>[];
            // Apply transaction limit if the flag is true
            if (this.limitTransactions && this.transactionLimit > 0) {
              transactions = transactions.slice(0, this.transactionLimit); // Limit the transactions
            }
            // Add icons to transactions

            this.transactions = transactions; // Asignar la lista de movimientos a la propiedad `transactions`
            this.transactions = transactions.map((transaction: any) => ({
              ...transaction,
              icon: this.iconLookupService.getIcon(
                transaction.type,
                transaction.source
              ),
            }));
            console.log('example: ', transactions[0]);
            this.fuzzySearch = createFuzzySearch(this.transactions, {
              getText: (item: any) => [
                item.contact_name,
                item.description,
                item.amount.toString(),
              ],
              strategy: 'aggressive',
            });
            this.filterTransactions(); // Apply the search filter whenever transactions are loaded
          } else {
            this.transactions = []; // Si no hay movimientos, aseguramos que sea un array vacío
            this.noTransactions = true;
          }
          this.loading = false; // Asegúrate de detener el spinner después de cargar los datos
        },
        error: (err) => {
          console.error('Error al cargar las transacciones:', err);
          this.loading = false; // También detener el spinner en caso de error
        },
      });
  }

  goToActivity() {
    this.router.navigate(['/app/activity']);
  }
  // Método para obtener las iniciales del contacto
  getInitials(name: string): string {
    if (!name) {
      return 'NN'; // Si no hay nombre disponible, retornar 'NN'
    }
    return name.slice(0, 2).toUpperCase();
  }

  getAvatarColor(name: string): string {
    if (!name) return '#ccc'; // Color por defecto si no hay nombre

    // Convertir el nombre en un número basado en su hash
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Convertir el hash en un valor de tono (hue) entre 0 y 360
    const hue = hash % 360;
    const saturation = 60; // Mantener la saturación constante en 50% para tonos pastel fuertes
    const lightness = 75; // Mantener la luminosidad constante en 70% para asegurar un color claro pero visible

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`; // Devuelve el color en formato HSL
  }
  exportToCSV() {
    console.log('csv ddownload');
    const csvData = this.filteredTransactions.map((transaction) => ({
      id: transaction.id,
      descripción: transaction.description,
      balance: transaction.balance,
      Moneda: transaction.currency,
      Monto: transaction.amount,
      Estado: transaction.status,
      'fecha operación': `"${new Date(
        transaction.created_at
      ).toLocaleString()}"`,
      'nombre de contacto': `"${this.transform(transaction.contact_name)}"`,
    }));

    const csvContent = this.convertToCSV(csvData);

    // Create a Blob from the CSV content
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

    // Create a link element
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'transacciones.csv');
    link.style.visibility = 'hidden';

    // Append the link to the body
    document.body.appendChild(link);

    // Programmatically trigger the click to download the file
    link.click();
    console.log('Download csv');
    // Clean up by removing the link after download
    document.body.removeChild(link);
  }

  transform(name: string): string {
    if (!name || !name.includes(',')) {
      return name; // Return the name as-is if it's already in the correct format
    }

    const [lastName, firstName] = name.split(',').map((part) => part.trim());
    return `${firstName} ${lastName}`; // Return in "First Last" format
  }

  // Helper function to convert JSON to CSV
  convertToCSV(objArray: any[]): string {
    const array = [Object.keys(objArray[0])].concat(objArray);

    return array
      .map((it) => {
        return Object.values(it).toString();
      })
      .join('\n');
  }
  viewActivity(data: any) {
    console.log(data);
    this.sidePanelService.open(
      ActivityDetailsComponent,
      'Detalle de Movimiento',
      data
    );
  }

  openFiltersPanel() {
    const filtersPanelRef = this.sidePanelService.open(
      FiltersComponent,
      'Filtros',
      {
        periodsList: this.periodsList,
        selectedPeriod: this.selectedPeriod,
        typesList: this.typesList,
        selectedTypes: this.selectedTypes,
        statesList: this.statesList,
        selectedStates: this.selectedStates,
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
        this.selectedStates = data.selectedStates;
        this.loadTransactions();
      }
    );
  }
}
