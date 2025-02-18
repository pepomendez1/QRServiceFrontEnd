import { Injectable } from '@angular/core';
import { StoreDataService } from './store-data.service';
import {
  BehaviorSubject,
  catchError,
  forkJoin,
  map,
  Observable,
  take,
} from 'rxjs';
import {
  Card,
  PaymentCardsService,
} from '../components/payment-cards/payment-cards.service';
import { SnackbarService } from '@fe-treasury/shared/snack-bar/snackbar.service';

@Injectable({
  providedIn: 'root',
})
export class CardConfigService {
  private canCreatePhysical$ = new BehaviorSubject<boolean>(false);
  private canCreateVirtual$ = new BehaviorSubject<boolean>(false);

  constructor(
    private storeDataService: StoreDataService,
    private cardService: PaymentCardsService,
    private snackbarService: SnackbarService
  ) {}

  /** Observable for components to listen to */
  getCanCreatePhysical$() {
    return this.canCreatePhysical$.asObservable();
  }

  getCanCreateVirtual$() {
    return this.canCreateVirtual$.asObservable();
  }

  /** Fetch max card limits and check if new cards can be created */
  checkCanAddNewCard(): void {
    console.log('checkCanAddNewCard called'); // Debug log

    const storeData$ = this.storeDataService.getStore().pipe(take(1)); // Ensure it completes
    const cardsData$ = this.cardService.getCards().pipe(take(1)); // Ensure it completes
    const shippingData$ = this.cardService.getShipping().pipe(take(1));

    console.log('Subscribing to observables...');

    // storeData$.subscribe({
    //   next: (data) => console.log('Store Data Received:', data),
    //   error: (err) => console.error('Error in storeData$', err),
    //   complete: () => console.log('storeData$ completed............'),
    // });

    // cardsData$.subscribe({
    //   next: (data) => console.log('Cards Data Received:', data),
    //   error: (err) => console.error('Error in cardsData$', err),
    //   complete: () => console.log('cardsData$ completed............'),
    // });

    forkJoin({
      storeData: storeData$,
      cardsData: cardsData$,
      shippingData: shippingData$,
    }).subscribe({
      next: ({ storeData, cardsData, shippingData }) => {
        console.log('Received storeData and cardsData'); // Debug log

        console.log('shipping Data ---> ', shippingData);

        // Set default values if init_config is missing
        const maxPhysicalCards = storeData.init_config
          ?.max_physical_cards_on_account
          ? Number(storeData.init_config.max_physical_cards_on_account)
          : 1; // Default value

        const maxVirtualCards = storeData.init_config
          ?.max_virtual_cards_on_account
          ? Number(storeData.init_config.max_virtual_cards_on_account)
          : 1; // Default value

        if (!cardsData) {
          console.log('No cards data'); // Debug log
          this.canCreatePhysical$.next(false);
          this.canCreateVirtual$.next(false);
          return;
        }

        console.log('Processing storeData and cardsData');

        const activeVirtualCards = cardsData.filter(
          (card) => card.type === 'VIRTUAL' && card.status !== 'DISABLED'
        ).length;

        const activePhysicalCards =
          cardsData.filter(
            (card) => card.type === 'PHYSICAL' && card.status !== 'DISABLED'
          ).length +
          (shippingData && shippingData.status !== 'NOT_DELIVERED' ? 1 : 0);

        console.log('Cards table --------- '); // Debug log
        // Count existing active cards
        console.table({
          activeVirtualCards,
          activePhysicalCards,
          maxVirtualCardsOnAccount: maxVirtualCards,
          maxPhysicalCardsOnAccount: maxPhysicalCards,
          canCreateVirtual: activeVirtualCards < maxVirtualCards,
          canCreatePhysical: activePhysicalCards < maxPhysicalCards,
        });

        this.canCreateVirtual$.next(activeVirtualCards < maxVirtualCards);
        this.canCreatePhysical$.next(activePhysicalCards < maxPhysicalCards);
      },
      error: () => {
        this.canCreatePhysical$.next(false);
        this.canCreateVirtual$.next(false);
        this.snackbarService.openError(
          'Error al obtener datos de tarjetas',
          true,
          3000
        );
      },
    });
  }
}
