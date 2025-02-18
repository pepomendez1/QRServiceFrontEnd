import { Component, ViewEncapsulation, Input } from '@angular/core';
import { InternationalAccountService } from 'src/app/services/international-account.service';
import { Router } from '@angular/router';
import { RefreshService } from '@fe-treasury/shared/refresh-service/refresh-service';
import { SidePanelService } from '@fe-treasury/shared/side-panel/side-panel.service';
// import { FiltersComponent } from './filters/filters.component';
import createFuzzySearch from '@nozbe/microfuzz';
import { SvgLibraryService } from 'src/app/services/svg-library.service';
import { SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-international-operations',
  templateUrl: './international-operations.component.html',
  styleUrl: './international-operations.component.scss',
})
export class InternationalOperationsComponent {
  @Input() hideFilters: boolean = false;
  @Input() initialFilter: boolean = false;
  @Input() hideTitle: boolean = true;
  @Input() headerTitle: string = 'Actividad';
  @Input() activityShortcut: boolean = false;

  @Input() limitOperations: boolean = false; // Flag to limit the number of transactions
  @Input() operationsLimit: number = 5; // Default limit of 5 transactions

  isFocused = false;
  periodsList: string[] = ['Hoy', 'Última semana', 'Último mes', 'Último año'];

  typesList: string[] = [
    // 'Todas',
    'Transferencias enviadas',
    'Transferencias recibidas',
  ];

  typesMap: any = {
    'Transferencias enviadas': { source: 'transfer', type: 'cash_out' },
    'Transferencias recibidas': { source: 'transfer*', type: 'cash_in' },
  };

  statesList: string[] = [
    //'Todas',
    'Aprobadas',
    'Pendientes',
    'Rechazadas',
    'Canceladas',
  ];

  statesMap: any = {
    //Todas: 'Todas',
    Aprobadas: 'processed',
    Pendientes: 'processing',
    Rechazadas: 'rejected',
    Canceladas: 'cancelled',
  };

  selectedPeriod = 'Último mes';
  selectedTypes = ['Todas'];
  selectedStates = ['Todas'];
  searchQuery: string = '';
  problemImg: SafeHtml | null = null;
  operations: any[] = [];
  filteredOperations: any[] = [];
  loading: boolean = false; // Controlador del estado del loader
  noOperations: boolean = false; // Controlador del estado de "sin transacciones"
  fuzzySearch: any;
  searching: boolean = false;

  constructor(
    //public descriptionTable: DescriptionTable,
    private svgLibrary: SvgLibraryService,
    private internationalAccountService: InternationalAccountService,
    private router: Router,
    //private iconLookupService: IconLookupService,
    private refreshService: RefreshService,
    private sidePanelService: SidePanelService
  ) {
    this.loadOperations();
  }

  ngOnInit(): void {
    this.svgLibrary.getSvg('problem').subscribe((svgContent) => {
      this.problemImg = svgContent; // SafeHtml type to display SVG dynamically
      //console.log('Dynamically loaded SVG with store color:', svgContent);
    });
    // Subscribe to the refresh signal
    this.refreshService.refresh$.subscribe(() => {
      this.loadOperations();
    });
  }

  filterOperations() {
    // First, filter by type and state
    this.filteredOperations = this.operations.filter((operation) => {
      const matchesType =
        this.selectedTypes.includes('Todas') ||
        this.selectedTypes.some((selectedType) => {
          const filterCriteria = this.typesMap[selectedType];
          if (!filterCriteria) {
            return false;
          }
          const matchesSource = filterCriteria.source.includes('*')
            ? operation.source.startsWith(
                filterCriteria.source.replace('*', '')
              )
            : operation.source === filterCriteria.source;
          const matchesType =
            !filterCriteria.type || operation.type === filterCriteria.type;
          return matchesSource && matchesType;
        });

      const matchesState =
        this.selectedStates.includes('Todas') ||
        this.selectedStates.some(
          (state) => this.statesMap[state] === operation.status
        );

      return matchesType && matchesState;
    });

    console.log(
      'Filtered transactions after type and state filter:',
      this.filteredOperations
    );

    // Proceed with fuzzy search if there is a search query
    if (this.searchQuery.trim().length > 0) {
      this.searching = true;
      console.log('searching...');

      const searchResults = this.fuzzySearch(this.searchQuery);

      if (searchResults) {
        this.filteredOperations = searchResults.map(
          (result: { item: any }) => result.item
        );
        this.noOperations = this.filteredOperations.length === 0;
        console.log(
          'Transactions match query:',
          this.filteredOperations.length
        );
      } else {
        console.log('No search results');
        this.noOperations = true;
      }
      this.searching = false;
    } else {
      this.noOperations = this.filteredOperations.length === 0;
    }

    console.log('Final filtered transactions:', this.filteredOperations);
  }

  loadOperations() {
    this.loading = true; // Mostrar el loader
    this.noOperations = false; // Resetear el mensaje de "sin transacciones"

    this.internationalAccountService
      .getOperationsByPeriod(this.selectedPeriod)
      .subscribe({
        next: (response) => {
          if (response?.movements) {
            let operations = response.movements;
            //let transactions = <any>[];
            // Apply transaction limit if the flag is true
            if (this.limitOperations && this.operationsLimit > 0) {
              operations = operations.slice(0, this.operationsLimit); // Limit the transactions
            }
            // Add icons to transactions

            this.operations = operations; // Asignar la lista de movimientos a la propiedad `transactions`
            this.operations = operations.map((transaction: any) => ({
              ...transaction,
              icon:
                transaction.type === 'cash_in'
                  ? 'arrow_forward'
                  : transaction.type === 'cash_out'
                  ? 'arrow_back'
                  : 'question_mark',
            }));
            console.log('example: ', operations[0]);
            this.fuzzySearch = createFuzzySearch(this.operations, {
              getText: (item: any) => [
                item.contact_name,
                item.description,
                item.amount.toString(),
              ],
              strategy: 'aggressive',
            });
            this.filterOperations(); // Apply the search filter whenever transactions are loaded
          } else {
            this.operations = []; // Si no hay movimientos, aseguramos que sea un array vacío
            this.noOperations = true;
          }
          this.loading = false; // Asegúrate de detener el spinner después de cargar los datos
        },
        error: (err) => {
          console.error('Error al cargar las operaciones:', err);
          this.loading = false; // También detener el spinner en caso de error
        },
      });
  }

  goToOperations() {
    this.router.navigate(['/app/operations']);
  }

  exportToCSV() {}

  viewOperation(data: any) {
    // console.log(data);
    // this.sidePanelService.open(
    //   ActivityDetailsComponent,
    //   'Detalle de Movimiento',
    //   data
    // );
  }

  openFiltersPanel() {
    //   const filtersPanelRef = this.sidePanelService.open(
    //     FiltersComponent,
    //     'Filtros',
    //     {
    //       periodsList: this.periodsList,
    //       selectedPeriod: this.selectedPeriod,
    //       typesList: this.typesList,
    //       selectedTypes: this.selectedTypes,
    //       statesList: this.statesList,
    //       selectedStates: this.selectedStates,
    //     }
    //   );
    //   filtersPanelRef?.instance.applyFilters.subscribe(
    //     (data: {
    //       selectedPeriod: string;
    //       selectedTypes: string[];
    //       selectedStates: string[];
    //     }) => {
    //       console.log('Filters Applied:', data);
    //       this.selectedPeriod = data.selectedPeriod;
    //       this.selectedTypes = data.selectedTypes;
    //       this.selectedStates = data.selectedStates;
    //       this.loadOperations();
    //     }
    //   );
  }
}
