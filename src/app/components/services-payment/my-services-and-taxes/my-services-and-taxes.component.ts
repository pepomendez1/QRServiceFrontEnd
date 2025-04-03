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
import { Card, Cards, ServicesAndTaxes, ServicesMap, ServicesPaymentService } from '../services-payment.service';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { SidePanelService } from '@fe-treasury/shared/side-panel/side-panel.service';
import { BehaviorSubject, max, switchMap } from 'rxjs';
import { OnboardingService } from 'src/app/services/onboarding.service';
import { StoreDataService } from 'src/app/services/store-data.service';
import { SnackbarService } from '@fe-treasury/shared/snack-bar/snackbar.service';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { NewServiceComponent } from './new-services/new-services.component';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { SharedService } from '../services-payment.shared-service';
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
  activities: any = {};
  selectedAcitivy: any = {};
  currentStep: number = -1;

  typesList: string[] = [
    'SERVICIO DE GAS',
    'SERVICIO DE LUZ',
    'CREDITOS',
    'FINANCIERO'
  ];
  popularServices: any = {}

  selectedTypes = ['Todas'];
  cardSelected: Card | null = null;

  /*readonly transactionTypeMapping: Record<
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
  };*/

  constructor(
    private servicesPaymentService: ServicesPaymentService,
    private sidePanelService: SidePanelService,
    private snackBarService: SnackbarService,
    private dialog: MatDialog,
    private sharedService: SharedService
    //private storeDataService: StoreDataService,
  ) {}

  ngOnInit(): void {
    this.getPopularServices();
    this.getMyServices();

    this.sharedService.accion$.subscribe((msg) => {
      if(msg=='update_my_services'){
        this.getMyServices();
        console.log(msg)
      }
    });

  }

  getPopularServices() {
    console.log('GET PopularServices');
    this.errors = [];
    this.selectedCard = null;
    this.loading = true;
    this.servicesPaymentService.getPopularServices().subscribe({
      next: (data: ServicesMap | null) => {
        if (data) {
          console.log('PopularServices: ', data);
          //this.checkCanAddNewCard(data);
          this.popularServices=data
          this.loading = false;
        } else {
          this.loading = false;
          // esto es para que el template muestre el mensaje de no hay tarjetas
          //this.activeCards = [];
        }
      },
      error: (error: any) => {
        this.loading = false;
        this.errors.push(error.message);
        this.handleError(error);
      },
    });
  }

  getMyServices() {
    console.log('GET getMyServices');
    this.errors = [];
    this.selectedCard = null;
    this.loading = true;
    this.servicesPaymentService.getMyServices().subscribe({
      next: (data: ServicesAndTaxes | null) => {
        if (data) {
          console.log('getMyServices: ', data);
          this.activities=data
          this.loading = false;
        } else {
          this.loading = false;
          this.activities = [];
        }
      },
      error: (error: any) => {
        this.loading = false;
        this.errors.push(error.message);
        this.handleError(error);
      },
    });
  }

  eliminarServicio(companyCode: string) {
    console.log('eliminarServicio');

    this.loading = true;
    this.servicesPaymentService.deleteServiceByCompanyCode(companyCode).subscribe({
      next: (data: string | null) => {
        if (data) {
          console.log('response eliminarServicio: ', data);
          this.getMyServices();
          this.loading = false;
        } else {
          this.loading = false;
        }
      },
      error: (error: any) => {
        this.loading = false;

        this.handleError(error);
      },
    });
  }

  onActivityClick(activity: any) {
    console.log("Actividad seleccionada:", activity);
    // Aquí puedes navegar a otra vista, abrir un modal, etc.
    this.selectedAcitivy = activity;
    this.currentStep=1;
    this.openFiltersPanel();
  }

  private handleError(error: any) {
    this.snackBarService.openError(error.message, true);
  }

 /*  private mapTransactionType(item: any): any {
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
  } */

  openFiltersPanelByBtn() {
    this.selectedAcitivy=null;
    this.openFiltersPanel();
  }

  openFiltersPanel() {
        const filtersPanelRef = this.sidePanelService.open(
          NewServiceComponent,
          'Filtros',
          {
            //periodsList: this.periodsList,
            //selectedPeriod: this.selectedPeriod,
            //typesList: this.typesList,
            //selectedTypes: this.selectedTypes,
            popularServices: this.popularServices,
            selectedCompany: this.selectedAcitivy,
            currentStep: this.currentStep
          },
          true
        );

        filtersPanelRef?.instance.applyFilters.subscribe(
          (data: {
            //selectedPeriod: string;
            //selectedTypes: string[];
            //selectedStates: string[];
            selectedCompany: any;
            currentStep: number;
          }) => {
            console.log('Filters Applied:', data);
            //this.selectedPeriod = data.selectedPeriod;
            //this.selectedTypes = data.selectedTypes;

            //this.loadHistory();
          }
        );
      }

  openConfirmationDialog(companyName: string, companyCode: string): void {

    let messageTitle = '¿Querés eliminar este servicio?';
    let messageContent = 'Se eliminaran las cuentas adheridas al servicio: ' + companyName;

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      panelClass: 'custom-dialog-container',
      width: '600px',
      data: { messageTitle: messageTitle, messageContent: messageContent },
      disableClose: true,
      backdropClass: 'backdrop-class',
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.eliminarServicio(companyCode);
      }
    });
  }
}
