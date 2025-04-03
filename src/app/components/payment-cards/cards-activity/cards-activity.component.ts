import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  OnDestroy,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
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
import { Card } from '../payment-cards.service';
import { MyCardsService } from '../my-cards/my-cards.component';
import { PaymentCardsService } from '../payment-cards.service';
import { SvgLibraryService } from 'src/app/services/svg-library.service';
import { SafeHtml } from '@angular/platform-browser';
import { Subscription } from 'rxjs';

type TransactionType = 'PURCHASE' | 'DEBIT' | 'CREDIT' | 'REFUND';

@Component({
  selector: 'app-cards-activity',
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
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: './cards-activity.component.html',
  styleUrls: ['./cards-activity.component.scss'],
})
export class CardsActivityComponent implements OnInit {
  @Output() generalFailure = new EventEmitter<boolean>();
  selectedPeriod = 'Todo';
  currentPage = 1;
  pageSize = 5;
  totalItems = 0;
  activities: any[] = [];
  loading = true;
  loadingMore = false;
  activityTitle = 'Consumos con Tarjeta';
  cardSelected: Card | null = null;
  problemImg: SafeHtml | null = null;
  noActivityMessage: string = 'Aún no tenés consumos con esta tarjeta';
  private cardSelectedSubscription!: Subscription;
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

  constructor(
    private svgLibrary: SvgLibraryService,
    private snackBar: MatSnackBar,
    private myCardsService: MyCardsService,
    private paymentCardsService: PaymentCardsService
  ) {}

  ngOnInit(): void {
    this.svgLibrary.getSvg('problem').subscribe((svgContent) => {
      this.problemImg = svgContent;
    });

    // Subscribe to card selection changes
    this.cardSelectedSubscription = this.myCardsService.cardSelected.subscribe(
      (card: Card | null) => {
        // Explicitly handle the case where card is null or undefined
        if (!card) {
          this.cardSelected = null;
          this.loading = false;
          this.noActivityMessage = 'No tenés ninguna tarjeta activa';
          console.log('No card selected: ', this.noActivityMessage);
          return;
        }

        // Prevent duplicate API calls for the same card
        if (this.cardSelected?.id === card.id) {
          return;
        }

        this.cardSelected = card;
        console.log('Card selected: ', this.cardSelected);
        this.updateActivityTitle();

        // Fetch transactions if a card is selected
        this.resetState();
        this.getTransactions(true);
      }
    );
  }
  resetState(): void {
    this.activities = [];
    this.currentPage = 1;
    this.totalItems = 0;
    this.loading = true;
    this.loadingMore = false;
  }

  ngOnDestroy(): void {
    if (this.cardSelectedSubscription) {
      this.cardSelectedSubscription.unsubscribe();
    }
  }
  private updateActivityTitle(): void {
    if (this.cardSelected) {
      const alias = this.cardSelected.alias || this.getCardAlias();
      this.activityTitle = `Últimos consumos de ${alias}`;
    }
  }

  private getCardAlias(): string {
    if (!this.cardSelected) return '';
    const typeDescription =
      this.cardSelected.type === 'VIRTUAL'
        ? 'Prepaga Virtual'
        : 'Prepaga Física';
    return `${typeDescription} ${this.cardSelected.last_four}`;
  }

  getTransactions(reset = false): void {
    if (!this.cardSelected?.provider_id) {
      console.log('no cardss');
      return;
    }

    if (reset) {
      console.log('get transaction reset');
      this.resetState(); // Ensure state is reset
    } else {
      this.loadingMore = true;
    }

    this.paymentCardsService
      .getCardTransactions(
        this.cardSelected.provider_id,
        this.currentPage,
        this.pageSize
      )
      .subscribe({
        next: (data) => {
          console.log('Data received:', data);

          // Handle cases where data.items is undefined or null
          const items = data.items || [];
          if (items.length === 0) {
            console.log('No activities found'); // Log if no activities are returned
            this.noActivityMessage =
              'Aún no tenés ningún consumo con esta tarjeta';
          } else {
            console.log('getting activities');
            const newActivities = items.map((item: any) =>
              this.mapTransactionType(item)
            );
            this.activities = [...this.activities, ...newActivities];
          }

          // Set total items even if items are empty
          this.totalItems = data.total_items || 0;

          // Update loading states
          this.loading = false;
          this.loadingMore = false;

          console.log('loading false');
        },
        error: (err) => {
          this.generalFailure.emit(true);
          this.handleError(err);

          // Update loading states in case of error
          this.loading = false;
          this.loadingMore = false;
        },
      });
  }

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

  showMoreTransactions(): void {
    if (this.activities.length >= this.totalItems || this.loadingMore) return;
    this.currentPage++;
    this.getTransactions(false);
  }

  private handleError(error: any): void {
    const config: MatSnackBarConfig = {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    };
    this.snackBar.open(error.message || 'Ocurrió un error', 'Ok', config);
  }
}
