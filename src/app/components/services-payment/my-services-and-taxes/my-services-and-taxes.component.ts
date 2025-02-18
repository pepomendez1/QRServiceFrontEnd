import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Injectable,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { MatOptionModule, MatRipple } from '@angular/material/core';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { Card, Cards, ServicesPaymentService } from '../services-payment.service';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { SidePanelService } from '@fe-treasury/shared/side-panel/side-panel.service';
import { ViewCardComponent } from '../view-card/view-card.component';
import { CreateCardComponent } from '../create-card/create-card.component';
import { CardSettingsComponent } from '../card-settings/card-settings.component';
import { BehaviorSubject, max, switchMap } from 'rxjs';
import { OnboardingService } from 'src/app/services/onboarding.service';
import { StoreDataService } from 'src/app/services/store-data.service';
import { SnackbarService } from '@fe-treasury/shared/snack-bar/snackbar.service';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { NewServiceComponent } from './new-services/new-services.component';

// Service to share the selected card between components
@Injectable({
  providedIn: 'root',
})
export class MyCardsService {
  private cardSelectedSubject = new BehaviorSubject<Card | null>(null);
  public cardSelected = this.cardSelectedSubject.asObservable();
  constructor() {}

  setCardSelected(card: Card | null) {
    console.log('card selected in service: ', card);
    this.cardSelectedSubject.next(card);
  }
}



type TransactionType = 'PURCHASE' | 'DEBIT' | 'CREDIT' | 'REFUND';

@Component({
  selector: 'app-services-taxes',
  standalone: true,
  imports: [
    CommonModule,
    MatIcon,
    MatSelectModule,
    MatOptionModule,
    MatSelectModule,
    MatRipple,
    MatProgressSpinner,
    MatButtonModule,
    MatMenuModule,
    MatIconModule
  ],
  templateUrl: './my-services-and-taxes.component.html',
  styleUrl: './my-services-and-taxes.component.scss',
})
export class MyCardsComponent implements OnInit {
  @ViewChild('visaTemplate', { static: true }) visaTemplate!: TemplateRef<any>;
  @ViewChild('mastercardTemplate', { static: true })
  mastercardTemplate!: TemplateRef<any>;
  @ViewChild('fallbackTemplate', { static: true })
  fallbackTemplate!: TemplateRef<any>;
  //@Output() cardSelected = new EventEmitter<Card>();

  public loading = true;
  public errors: string[] = [];
  public activeCards: Cards | null = null;
  public selectedCard: Card | null = null;
  public cardTypes: string[] = ['VIRTUAL', 'PHYSICAL'];

  public primaryColor: string = '#F50050'; // Default color or get from the theme
  public strokeColor: string = '#F50050'; // Default stroke color

  // max cards
  public maxPhysicalCardsOnAccount = 0;
  public maxVirtualCardsOnAccount = 0;

  public canCreateVirtual = true;
  public canCreatePhysical = true;

  selectedPeriod = 'Todo';
  currentPage = 1;
  pageSize = 5;
  totalItems = 0;
  activities: any[] = [];

  typesList: string[] = [
    'SERVICIO DE GAS',
    'SERVICIO DE LUZ',
    'CREDITOS',
    'FINANCIERO'
  ];

  popularServices: any = {
    "SERVICIO DE GAS":[
    {"companyCode":"AR-S-02603",
     "companyName":"TAPI- TEST 2",
     "companyLogo":"https://public-logo.prod.tapila.cloud/ar/tapi.png"},

    {"companyCode":"AR-S-0033",
     "companyName":"CAMUZZI GAS PAMPEANA - GAS DEL SUR",
     "companyLogo":"https://public-logo.prod.tapila.cloud/ar/tapi.png"},

    {"companyCode":"AR-S-02610",
     "companyName":"TAPI Sandbox 1",
     "companyLogo":"https://public-logo.prod.tapila.cloud/ar/tapi.png"},

    {"companyCode":"AR-S-02611",
     "companyName":"TAPI Sandbox 2",
     "companyLogo":"https://public-logo.prod.tapila.cloud/mx/TELMEX.png"}
    ],
    "SERVICIO DE LUZ":[
    {"companyCode":"AR-S-0035",
     "companyName":"EDESUR",
     "companyLogo":"https://public-logo.prod.tapila.cloud/ar/tapi.png"},

    {"companyCode":"AR-S-0003",
     "companyName":"EDENOR",
     "companyLogo":"https://public-logo.prod.tapila.cloud/ar/Edenor.png"},

    {"companyCode":"AR-S-02602",
     "companyName":"TAPI- TEST 1",
     "companyLogo":"https://public-logo.prod.tapila.cloud/ar/tapi.png"}
    ],
    "CREDITOS":[
    {"companyCode":"AR-S-04160",
     "companyName":"PLAN CHERY",
     "companyLogo":""}
     ],
    "FINANCIERO":[
    {"companyCode":"AR-S-0024",
     "companyName":"SANTANDER - PRESTAMOS",
     "companyLogo":"https://public-logo.prod.tapila.cloud/tags_common/tag_PrestamosYServiciosFinancieros.png"}
     ]
    }    ;

  selectedTypes = ['Todas'];
  cardSelected: Card | null = null;

  readonly transactionTypeMapping: Record<
    TransactionType,
    { description: string; icon: string; transaction_type: string }
  > = {
    PURCHASE: {
      description: 'ECOGAS',
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

  constructor(
    private cardService: ServicesPaymentService,
    private sidePanelService: SidePanelService,
    private myCardsService: MyCardsService,
    private snackBarService: SnackbarService,
    private storeDataService: StoreDataService,
    private paymentCardsService: ServicesPaymentService
  ) {}

  ngOnInit(): void {
    this.storeDataService.getStore().subscribe((data) => {
      if (data.init_config) {
        this.maxPhysicalCardsOnAccount =
          data.init_config.max_physical_cards_on_account;
        this.maxVirtualCardsOnAccount =
          data.init_config.max_virtual_cards_on_account;
      }
    });
    //this.getCards();
    //this.getTransactions(true);
    this.getServices();
  }

  checkCanAddNewCard(cards: Cards) {
    console.log('canAddNewCard start');
    // Count existing cards
    const activeVirtualCards = cards.filter(
      (card) => card.type === 'VIRTUAL' && card.status !== 'DISABLED'
    );
    const activePhysicalCards = cards.filter(
      (card) => card.type === 'PHYSICAL' && card.status !== 'DISABLED'
    );
    // Count existing active cards
    const currentVirtualCards = activeVirtualCards.length;
    const currentPhysicalCards = activePhysicalCards.length;
    // Determine if user can create more virtual cards
    if (
      this.maxVirtualCardsOnAccount === null ||
      currentVirtualCards < this.maxVirtualCardsOnAccount
    ) {
      this.canCreateVirtual = true;
    } else {
      this.canCreateVirtual = false;
    }

    // Determine if user can create more physical cards
    if (
      this.maxPhysicalCardsOnAccount === null ||
      currentPhysicalCards < this.maxPhysicalCardsOnAccount
    ) {
      this.canCreatePhysical = true;
    } else {
      this.canCreatePhysical = false;
    }

    console.table({
      currentVirtualCards,
      currentPhysicalCards,
      maxVirtualCardsOnAccount: this.maxVirtualCardsOnAccount,
      maxPhysicalCardsOnAccount: this.maxPhysicalCardsOnAccount,
      canCreateVirtual: this.canCreateVirtual,
      canCreatePhysical: this.canCreatePhysical,
    });
  }

  getCards() {
    console.log('GET CARDS');
    this.errors = [];
    this.selectedCard = null;
    this.loading = true;
    this.cardService.getCards().subscribe({
      next: (data: Cards | null) => {
        if (data) {
          console.log('cards: ', data);
          this.checkCanAddNewCard(data);
          this.setDisplayNames(data);
          this.loading = false;
          this.activeCards = data;
          this.selectedCard = data[0];
          // emit the selected card to all components that inject MyCardsService
          this.myCardsService.setCardSelected(this.selectedCard);
        } else {
          this.loading = false;
          // esto es para que el template muestre el mensaje de no hay tarjetas
          this.activeCards = [];
        }
      },
      error: (error: any) => {
        this.loading = false;
        this.errors.push(error.message);
        this.handleError(error);
      },
    });
  }

  private setDisplayNames(data: Cards) {
    data.forEach((card: Card) => {
      if ([undefined, null, '', ' '].includes(card.alias)) {
        let translatedType =
          card.type === 'VIRTUAL' ? 'Prepaga Virtual' : 'Prepaga Física';
        card.alias = `${translatedType}  ${card.last_four}`;
      }
    });
  }

  public viewCardData(selectedCard: Card | null) {
    if (!selectedCard) {
      return;
    }
    this.sidePanelService.open(
      ViewCardComponent,
      'Información de la tarjeta',
      selectedCard
    );
  }

  private handleError(error: any) {
    this.snackBarService.openError(error.message, true);
  }

  public pauseCard(card: Card | undefined) {
    if (!card) {
      this.handleError(new Error('No se ha seleccionado una tarjeta'));
      return;
    }

    this.loading = true;

    this.cardService.pauseCard(card).subscribe({
      next: (success: boolean) => {
        if (success) {
          this.snackBarService.openSuccess(
            'Tarjeta pausada con éxito',
            true,
            3000
          );
          this.getCards(); // Refresh card data
        }
        this.loading = false;
      },
      error: (error: any) => {
        this.handleError(error);
        this.loading = false;
      },
    });
  }

  public activateCard(card: Card | undefined) {
    if (!card) {
      this.handleError(new Error('No se ha seleccionado una tarjeta'));
      return;
    }

    this.loading = true;

    this.cardService.activateCard(card).subscribe({
      next: (success: boolean) => {
        if (success) {
          this.snackBarService.openSuccess(
            'Tarjeta activada con éxito',
            true,
            3000
          );
          this.getCards(); // Refresh card data
        }
        this.loading = false; // Stop loading after successful response
      },
      error: (error: any) => {
        this.handleError(error);
        this.loading = false; // Stop loading after error response
      },
    });
  }
  getCardTemplate(provider: string | undefined): TemplateRef<any> {
    switch (provider) {
      case 'VISA':
        return this.visaTemplate;
      case 'MASTERCARD':
        return this.mastercardTemplate;
      default:
        return this.fallbackTemplate;
    }
  }

  public createServicesAndTaxes() {
    const componentRef = this.sidePanelService.open(
      CreateCardComponent,
      'Pedir tarjeta',
      {
        canCreatePhysical: this.canCreatePhysical,
        canCreateVirtual: this.canCreateVirtual,
      }
    );

    componentRef?.instance.cardCreated.subscribe(() => {
      //this.snackBar.open('Tarjeta creada con éxito', 'Ok');
      this.getCards();
      this.loading = false;
    });
    // this.errors = [];
    // this.loading = true;
    // this.cardService.createCard("VIRTUAL").subscribe({
    //   next: (data: Cards) => {
    //     this.snackBar.open('Tarjeta creada con éxito', 'Ok');
    //     this.setDisplayNames(data)
    //     this.activeCards = data;
    //     this.loading = false;
    //   },
    //   error: (error: any) => {
    //     this.handleError(error);
    //     this.loading = false;
    //   }
    // });
  }
  onCardSelectionChange(event: any): void {
    const card = event.value;
    this.myCardsService.setCardSelected(card);
    this.selectedCard = card; // Update the selected card in the component
  }
  public openCardSettings(card: Card) {
    const componentRef = this.sidePanelService.open(
      CardSettingsComponent,
      'Ajustes',
      card
    );
    componentRef?.instance.cardSettingsClosed.subscribe(() => {
      this.getCards();
    });
    componentRef?.instance.createCardAfterSave.subscribe(() => {
      this.createServicesAndTaxes();
    });
  }

  /*getTransactions(reset = false): void {
    //if (!this.cardSelected?.provider_id) return;

    if (reset) {
      this.currentPage = 1;
      this.activities = [];
      this.loading = true;
    } else {
      //this.loadingMore = true;
    }

    this.paymentCardsService
      .getCardTransactions(
        'crd-2or9ofeSs3KeXIeoIyIzGMmnqUl',
        this.currentPage,
        this.pageSize
      )
      .subscribe({
        next: (data) => {
          const newActivities = data.items.map((item: any) =>
            this.mapTransactionType(item)
          );
          this.activities = [...this.activities, ...newActivities];
          this.totalItems = data.total_items;
          this.loading = false;
          //this.loadingMore = false;
        },
        error: (err) => {
          this.handleError(err);
          this.loading = false;
          //this.loadingMore = false;
        },
      });
  }*/
  private mapTransactionType(item: any): any {
    const mapping = this.transactionTypeMapping[
      item.type as TransactionType
    ] || {
      description: 'Desconocido',
      icon: 'help_outline',
      transaction_type: 'unknown',
    };
    return {
      ...item,
      ...mapping,
    };
  }

  getServices(){

    this.activities = [
      {
        serviceIdentifier: 'Ecogas',
        modalityId: 'uuid',
        companyCode: 'ecogas',
        alias: 'alias ecogas',
        type: 'Gas',
        agendaId: 'agendaId',
        accounts: 1,
        icon: 'local_fire_department'
      },
      {
        serviceIdentifier: 'EPEC',
        modalityId: 'anotherUuid',
        companyCode: 'anotherCompany',
        alias: 'alias another',
        type: 'Electricidad',
        agendaId: 'anotherAgendaId',
        accounts: 4
      },
      {
        serviceIdentifier: 'Aguas Cordobesas',
        modalityId: 'anotherUuid',
        companyCode: 'anotherCompany',
        alias: 'alias another',
        type: 'Agua',
        agendaId: 'anotherAgendaId',
        accounts: 3
      },
      {
        serviceIdentifier: 'Wee',
        modalityId: 'anotherUuid',
        companyCode: 'anotherCompany',
        alias: 'alias another',
        type: 'Internet',
        agendaId: 'anotherAgendaId',
        accounts: 2
      },
      {
        serviceIdentifier: 'Claro',
        modalityId: 'anotherUuid',
        companyCode: 'anotherCompany',
        alias: 'alias another',
        type: 'Telefonía',
        agendaId: 'anotherAgendaId',
        accounts: 1
      }

      ,

      {
        serviceIdentifier: 'Ecogas',
        modalityId: 'uuid',
        companyCode: 'ecogas',
        alias: 'alias ecogas',
        type: 'Gas',
        agendaId: 'agendaId',
        accounts: 1
      },
      {
        serviceIdentifier: 'EPEC',
        modalityId: 'anotherUuid',
        companyCode: 'anotherCompany',
        alias: 'alias another',
        type: 'Electricidad',
        agendaId: 'anotherAgendaId',
        accounts: 2
      },
      {
        serviceIdentifier: 'Aguas Cordobesas',
        modalityId: 'anotherUuid',
        companyCode: 'anotherCompany',
        alias: 'alias another',
        type: 'Agua',
        agendaId: 'anotherAgendaId',
        accounts: 2
      },
      {
        serviceIdentifier: 'Wee',
        modalityId: 'anotherUuid',
        companyCode: 'anotherCompany',
        alias: 'alias another',
        type: 'Internet',
        agendaId: 'anotherAgendaId',
        accounts: 2
      },
      {
        serviceIdentifier: 'Claro',
        modalityId: 'anotherUuid',
        companyCode: 'anotherCompany',
        alias: 'alias another',
        type: 'Telefonía',
        agendaId: 'anotherAgendaId',
        accounts: 2
      }
    ];
      this.loading = false;
  }

  openFiltersPanel() {
        const filtersPanelRef = this.sidePanelService.open(
          NewServiceComponent,
          'Filtros',
          {
            //periodsList: this.periodsList,
            selectedPeriod: this.selectedPeriod,
            typesList: this.typesList,
            selectedTypes: this.selectedTypes,
            popularServices: this.popularServices
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
            //this.selectedTypes = data.selectedTypes;

            //this.loadHistory();
          }
        );
      }
}
