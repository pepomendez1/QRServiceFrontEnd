import { Component } from '@angular/core';
import { SidePanelService } from '@fe-treasury/shared/side-panel/side-panel.service';
import { StoreDataService } from 'src/app/services/store-data.service';
import { CreateCardComponent } from '../../payment-cards/create-card/create-card.component';
import { SnackbarService } from '@fe-treasury/shared/snack-bar/snackbar.service';
import { SvgLibraryService } from 'src/app/services/svg-library.service';
import {
  Card,
  Cards,
  PaymentCardsService,
} from '../../payment-cards/payment-cards.service';
import { Router } from '@angular/router';
import { SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-card-order',
  templateUrl: './card-order.component.html',
  styleUrl: './card-order.component.scss',
})
export class CardOrderComponent {
  public loading = true;
  public errors: string[] = [];
  // max cards
  public maxPhysicalCardsOnAccount = 0;
  public maxVirtualCardsOnAccount = 0;

  public canCreateVirtual = true;
  public canCreatePhysical = true;
  cardOrder: SafeHtml | null = null;
  constructor(
    private svgLibrary: SvgLibraryService,
    private sidePanelService: SidePanelService,
    private storeDataService: StoreDataService,
    private cardService: PaymentCardsService,
    private snackbarService: SnackbarService,
    private router: Router
  ) {}
  ngOnInit(): void {
    this.svgLibrary.getSvg('card-order').subscribe((svgContent) => {
      this.cardOrder = svgContent; // SafeHtml type to display SVG dynamically
      //console.log('Dynamically loaded SVG with store color:', svgContent);
    });
    this.storeDataService.getStore().subscribe((data) => {
      if (data.init_config) {
        this.maxPhysicalCardsOnAccount =
          data.init_config.max_physical_cards_on_account;
        this.maxVirtualCardsOnAccount =
          data.init_config.max_virtual_cards_on_account;
      }
    });
    this.getCards();
  }

  getCards() {
    this.errors = [];
    this.loading = true;
    this.cardService.getCards().subscribe({
      next: (data: Cards | null) => {
        if (data) {
          this.checkCanAddNewCard(data);
          this.loading = false;
        } else {
          this.loading = false;
        }
      },
      error: (error: any) => {
        this.loading = false;
        this.errors.push(error.message);
        this.snackbarService.openError('Error al obtener tarjeta', true, 3000);
      },
    });
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

  createCard() {
    const componentRef = this.sidePanelService.open(
      CreateCardComponent,
      'Pedir tarjeta',
      {
        canCreatePhysical: this.canCreatePhysical,
        canCreateVirtual: this.canCreateVirtual,
      }
    );

    componentRef?.instance.cardCreated.subscribe((data: any) => {
      this.snackbarService.openSuccess(
        'Tarjeta creada con Éxito! ',
        true,
        3000
      );
      this.router.navigate(['/app/cards']);
    });
  }
  goToCards() {
    this.router.navigate(['/app/cards']);
  }
}
