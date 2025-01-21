import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { SidePanelHeaderComponent } from '@fe-treasury/shared/side-panel/side-panel-header/side-panel-header.component';
import { Cards, ServicesPaymentService } from '../services-payment.service';
import { SidePanelService } from '@fe-treasury/shared/side-panel/side-panel.service';
import { SidePanelFooterComponent } from '@fe-treasury/shared/side-panel/side-panel-footer/side-panel-footer.component';
import { SnackbarService } from '@fe-treasury/shared/snack-bar/snackbar.service';
import { MessageService } from '@fe-treasury/shared/messages/messages.service';
import { MessagesModule } from '@fe-treasury/shared/messages/messages.module';
@Component({
  selector: 'app-card-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatListModule,
    MatIcon,
    MatSlideToggleModule,
    MatRadioModule,
    MatFormFieldModule,
    MatProgressBarModule,
    SidePanelHeaderComponent,
    SidePanelFooterComponent,
    FormsModule,
    MessagesModule,
  ],
  templateUrl: './card-settings.component.html',
  styleUrl: './card-settings.component.scss',
  animations: [
    trigger('fadeSlideRight', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-10%)' }),
        animate(
          '100ms ease-in-out',
          style({ opacity: 1, transform: 'translateX(0%)' })
        ),
      ]),
      transition(':leave', [
        animate(
          '100ms ease-in-out',
          style({ opacity: 0, transform: 'translateX(-10%)' })
        ),
      ]),
    ]),
    trigger('fadeSlideLeft', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(10%)' }),
        animate(
          '100ms ease-in-out',
          style({ opacity: 1, transform: 'translateX(0%)' })
        ),
      ]),
      transition(':leave', [
        animate(
          '100ms ease-in-out',
          style({ opacity: 0, transform: 'translateX(10%)' })
        ),
      ]),
    ]),
  ],
})
export class CardSettingsComponent {
  @Input() data: any;
  @Output() cardSettingsClosed = new EventEmitter<void>();
  @Output() createCardAfterSave = new EventEmitter<void>();
  menu: any[] = [];
  isTouched = false;
  menuPhysical = [
    { name: 'Cambiar nombre de la tarjeta', state: 'Nombre de tarjeta' },
    { name: 'Denunciar robo', state: 'Denunciar robo' },
    { name: 'Denunciar pérdida', state: 'Denunciar pérdida' },
    { name: 'Cancelar tarjeta física', state: 'Cancelar tarjeta', last: true },
  ];

  menuVirtual = [
    { name: 'Cambiar nombre de la tarjeta', state: 'Nombre de tarjeta' },
    { name: 'Cancelar tarjeta virtual', state: 'Cancelar tarjeta', last: true },
  ];
  cardName = { isFocused: false, value: 'test' };
  loading = false;
  errors: string[] = [];
  sliding = false;
  pauseRequest: boolean = false;
  cancelRequest: boolean = false;
  selectedTitle: string | null = null;
  selectedOption: string | null = null;
  successTitle: string | null = null;
  successMessage: string | null = null;

  displayNameForm = new FormGroup({
    alias: new FormControl('', [Validators.required, Validators.minLength(3)]),
  });

  constructor(
    private cardService: ServicesPaymentService,
    private snackBarService: SnackbarService,
    private messageService: MessageService,
    private sidePanelService: SidePanelService
  ) {}

  ngOnInit(): void {
    this.messageService.clearMessage();
    this.pauseRequest = false;
    if (this.data.type === 'PHYSICAL') {
      this.menu = this.menuPhysical;
    } else {
      this.menu = this.menuVirtual;
    }
    this.cardName.value = this.data.alias;
  }
  onFocus(field: any) {
    field.isFocused = true;
  }
  // Method to handle blur
  onBlur(field: any) {
    field.isFocused = !!field.value.trim();
    this.isTouched = true; // Set touched state on blur
  }
  closePanel() {
    this.pauseRequest = false;
    this.sidePanelService.close();
  }
  onSelect(menuItem: any) {
    if (menuItem === null && this.selectedOption === null) {
      this.sidePanelService.close();
      return;
    }
    if (menuItem && menuItem.status === 'DISABLED') {
      return;
    }
    setTimeout(() => {
      this.sliding = true;
      this.selectedOption = menuItem?.state || null;
      this.selectedTitle = menuItem?.name || null;
      this.sliding = false;
    }, 50);
  }
  isFormValid() {
    return (
      this.cardName.value.trim().length >= 3 &&
      this.cardName.value.trim().length > 0
    );
  }

  isRequiredError() {
    return this.isTouched && this.cardName.value.trim().length === 0;
  }

  isMinLengthError() {
    return (
      this.isTouched &&
      this.cardName.value.trim().length > 0 &&
      this.cardName.value.trim().length < 3
    );
  }
  save() {
    switch (this.selectedOption) {
      case 'Denunciar robo':
        this.successTitle = 'Recibimos la denuncia del robo de tu tarjeta';
        this.successMessage =
          'Podés solicitar una nueva tarjeta cuando quieras.';
        break;
      case 'Denunciar pérdida':
        if (this.pauseRequest) {
          this.successTitle = 'Recibimos el pedido de pausa de tu tarjeta ';
          this.successMessage =
            'Podés activarla cuando quieras desde Tarjetas.';
        } else {
          this.successTitle =
            'Recibimos la denuncia de la pérdida de tu tarjeta';
          this.successMessage =
            'Podés solicitar una nueva tarjeta cuando quieras.';
        }
        break;
      case 'Cancelar tarjeta':
        this.successTitle =
          'Recibimos el pedido de cancelación de tu tarjeta ' + this.data.alias;
        this.successMessage = null;

        break;

      default:
        break;
    }

    this.selectedOption = 'success';
  }
  public pauseCard() {
    if (!this.data) {
      this.handleError(new Error('No se ha seleccionado una tarjeta'));
      return;
    }

    this.pauseRequest = true;
    this.loading = true;
    this.cardService.pauseCard(this.data).subscribe({
      next: (success: boolean) => {
        if (success) {
          this.snackBarService.openSuccess(
            'Tarjeta pausada con éxito',
            true,
            3000
          );
          this.save();
          this.cardSettingsClosed.emit();
        }
        this.loading = false;
      },
      error: (error: any) => {
        this.handleError(error);
        this.loading = false;
        this.pauseRequest = false;
      },
    });
  }

  public cancelCard() {
    if (!this.data) {
      this.handleError(new Error('No se ha seleccionado una tarjeta'));
      return;
    }

    this.cancelRequest = true;
    this.loading = true;
    this.cardService.cancelCard(this.data).subscribe({
      next: (success: boolean) => {
        if (success) {
          this.snackBarService.openSuccess(
            'Tarjeta cancelada con éxito',
            true,
            3000
          );
          this.save();
          this.cardSettingsClosed.emit();
        }
        this.loading = false;
      },
      error: (error: any) => {
        this.handleError(error);
        this.loading = false;
        this.cancelRequest = false;
      },
    });
  }

  changeCardName() {
    if (!this.isFormValid()) {
      this.handleError(new Error('Formulario no válido'));
      return;
    }
    if (!this.data) {
      this.handleError(new Error('No se ha seleccionado una tarjeta'));
      return;
    }

    const newAlias = this.cardName.value || '';
    this.loading = true;

    this.cardService.changeName(this.data, newAlias).subscribe({
      next: (success: boolean) => {
        this.loading = false;
        if (success) {
          this.messageService.showMessage(
            'Cambiaste el nombre de tu tarjeta',
            'success'
          );
          this.cardSettingsClosed.emit();
        }
      },
      error: (error: any) => {
        this.loading = false;
        this.errors.push(error.message);
        this.handleError(error);
      },
    });
  }

  private handleError(error: any) {
    this.snackBarService.openError(error.message, true);
  }

  public createCard() {
    this.createCardAfterSave.emit();
  }
}
