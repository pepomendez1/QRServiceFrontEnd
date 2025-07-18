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
import { MatIcon } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { Card, Cards, PaymentCardsService } from '../payment-cards.service';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { SidePanelService } from '@fe-treasury/shared/side-panel/side-panel.service';
import { ViewCardComponent } from '../view-card/view-card.component';
import { CreateCardComponent } from '../create-card/create-card.component';
import { CardSettingsComponent } from '../card-settings/card-settings.component';
import { BehaviorSubject, max, switchMap } from 'rxjs';
import { CardConfigService } from 'src/app/services/card-config.service';
import { OnboardingService } from 'src/app/services/onboarding.service';
import { StoreDataService } from 'src/app/services/store-data.service';
import { SnackbarService } from '@fe-treasury/shared/snack-bar/snackbar.service';
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

@Component({
  selector: 'app-my-cards',
  standalone: true,
  imports: [
    CommonModule,
    MatIcon,
    MatSelectModule,
    MatOptionModule,
    MatSelectModule,
    MatRipple,
    MatProgressSpinner,
  ],
  templateUrl: './my-cards.component.html',
  styleUrl: './my-cards.component.scss',
})
export class MyCardsComponent implements OnInit {
  @ViewChild('visaTemplate', { static: true }) visaTemplate!: TemplateRef<any>;
  @ViewChild('mastercardTemplate', { static: true })
  mastercardTemplate!: TemplateRef<any>;
  @ViewChild('fallbackTemplate', { static: true })
  fallbackTemplate!: TemplateRef<any>;
  @Output() cardSelected = new EventEmitter<Card>();
  @Output() shippingData = new EventEmitter<any>();
  @Output() shippingCard = new EventEmitter<boolean>();
  @Output() generalFailure = new EventEmitter<boolean>();

  public loading = true;
  public errors: string[] = [];
  public activeCards: Cards | null = null;
  public selectedCard: Card | null = null;
  public cardTypes: string[] = ['VIRTUAL', 'PHYSICAL'];
  public oderedPhysicalCard: boolean = false;
  public primaryColor: string = '#0000CC'; // Default color or get from the theme
  public strokeColor: string = '#0000CC'; // Default stroke color

  // max cards
  public maxPhysicalCardsOnAccount = 0;
  public maxVirtualCardsOnAccount = 0;

  public canCreateVirtual = true;
  public canCreatePhysical = true;

  constructor(
    private cardService: PaymentCardsService,
    private sidepanelService: SidePanelService,
    private myCardsService: MyCardsService,
    private snackBarService: SnackbarService,
    private cardConfigService: CardConfigService,
    private storeDataService: StoreDataService
  ) {}

  ngOnInit(): void {
    this.storeDataService.getStore().subscribe((data) => {
      if (data.init_config) {
        this.primaryColor = data.init_config.primary_color || '#0000CC';
        this.strokeColor = data.init_config.primary_color || '#0000CC';
      }
    });
    this.cardConfigService.getCanCreatePhysical$().subscribe((canCreate) => {
      console.log('canCreatePhysical updated:', canCreate);
      setTimeout(() => {
        this.canCreatePhysical = canCreate;
      });
    });

    this.cardConfigService.getCanCreateVirtual$().subscribe((canCreate) => {
      console.log('canCreateVirtual updated:', canCreate);
      setTimeout(() => {
        this.canCreateVirtual = canCreate;
      });
    });

    this.cardConfigService.checkCanAddNewCard();

    this.getCards();
    this.getShippings();
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
          //this.checkCanAddNewCard(data);
          this.setDisplayNames(data);
          this.loading = false;
          this.activeCards = data;
          this.selectedCard = data[0];
          console.log('selected card: ', data[0]);
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
        this.generalFailure.emit(true);
        this.handleError(error);
      },
    });
  }

  getShippings() {
    console.log('GET shippings');
    this.selectedCard = null;
    this.loading = true;
    this.cardService.getShipping().subscribe({
      next: (data: any) => {
        console.log('shipping data in get shippings () ... ', data);
        if (data) {
          console.log('shippings: ', data);
          this.oderedPhysicalCard = true;
          this.shippingData.emit(data);
          this.shippingCard.emit(true);
        } else {
          console.log('no hay shippings');
          this.oderedPhysicalCard = false;
          this.shippingCard.emit(false);
        }
      },
      error: (error: any) => {
        this.loading = false;
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
    this.sidepanelService.open(
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

  public createCard() {
    const componentRef = this.sidepanelService.open(
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
    const componentRef = this.sidepanelService.open(
      CardSettingsComponent,
      'Ajustes',
      card
    );
    componentRef?.instance.cardSettingsClosed.subscribe(() => {
      this.getCards();
    });
    componentRef?.instance.createCardAfterSave.subscribe(() => {
      this.createCard();
    });
  }
}
