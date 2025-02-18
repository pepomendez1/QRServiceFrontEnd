import { Component } from '@angular/core';
import { SidePanelService } from '@fe-treasury/shared/side-panel/side-panel.service';
import { CreateCardComponent } from '../../payment-cards/create-card/create-card.component';
import { SnackbarService } from '@fe-treasury/shared/snack-bar/snackbar.service';
import { SvgLibraryService } from 'src/app/services/svg-library.service';
import { Router } from '@angular/router';
import { SafeHtml } from '@angular/platform-browser';
import { CardConfigService } from 'src/app/services/card-config.service';

@Component({
  selector: 'app-card-order',
  templateUrl: './card-order.component.html',
  styleUrl: './card-order.component.scss',
})
export class CardOrderComponent {
  public loading = true;
  public errors: string[] = [];

  public canCreateVirtual = true;
  public canCreatePhysical = true;

  cardOrder: SafeHtml | null = null;
  constructor(
    private svgLibrary: SvgLibraryService,
    private sidePanelService: SidePanelService,
    private cardConfigService: CardConfigService,
    private snackbarService: SnackbarService,
    private router: Router
  ) {}
  ngOnInit(): void {
    this.svgLibrary.getSvg('card-order').subscribe((svgContent) => {
      this.cardOrder = svgContent;
    });

    console.log(' getting card max amount.... ');

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
    this.loading = false;
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

    componentRef?.instance.cardCreated.subscribe(() => {
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
