import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Card, Cards, PaymentCardsService } from '../payment-cards.service';
import { CommonModule } from '@angular/common';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { SidePanelService } from '@fe-treasury/shared/side-panel/side-panel.service';
import { MatIcon } from '@angular/material/icon';
import { SvgLibraryService } from 'src/app/services/svg-library.service';
import { StoreDataService } from 'src/app/services/store-data.service';
import { SafeHtml } from '@angular/platform-browser';
import { SnackbarService } from '@fe-treasury/shared/snack-bar/snackbar.service';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { trigger, transition, style, animate } from '@angular/animations';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRippleModule } from '@angular/material/core';
import { SidePanelHeaderComponent } from '@fe-treasury/shared/side-panel/side-panel-header/side-panel-header.component';
import { Router } from '@angular/router';
import { OnboardingService } from 'src/app/services/onboarding.service';
import { CardShippingStatusComponent } from '../card-shipping-status/card-shipping-status.component';
import {
  SimpleSelectValuesId,
  provinceList,
} from 'src/app/utils/onboarding-lists';
import { MatSelectModule } from '@angular/material/select';
import { SidePanelFooterComponent } from '@fe-treasury/shared/side-panel/side-panel-footer/side-panel-footer.component';
@Component({
  selector: 'app-create-card',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatProgressSpinner,
    MatIcon,
    MatButtonToggleModule,
    FormsModule,
    MatRadioModule,
    MatFormFieldModule,
    MatInputModule,
    MatRippleModule,
    SidePanelHeaderComponent,
    SidePanelFooterComponent,
    MatSelectModule,
  ],
  animations: [
    trigger('fadeSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(10%)' }),
        animate(
          '100ms 100ms ease-in-out',
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
  ],
  templateUrl: './create-card.component.html',
  styleUrl: './create-card.component.scss',
})
export class CreateCardComponent {
  @Output() cardCreated = new EventEmitter<void>();
  @Input() data: any;
  financesImg: SafeHtml | null = null;
  congratsImg: SafeHtml | null = null;
  loading = false;
  welcomeText: string = 'Pedí tu tarjeta ';
  cardType: 'VIRTUAL' | 'PHYSICAL' = 'VIRTUAL';
  card: Card | null = null;
  currentStep: number = 0;
  stepLabels: string[] = [
    'propuesta_valor',
    'seleccionar_tipo_tarjeta',
    'formulario_direccion',
    'success_tarjeta_virtual',
    'success_tarjeta_fisica',
  ];
  shippingCardData: any;
  addressFields: any = [];
  isIframe: boolean = false;
  public addressForm: FormGroup;
  public provinceList: SimpleSelectValuesId[] = provinceList;
  public selectedCardTypeControl: FormControl;

  constructor(
    private svgLibrary: SvgLibraryService,
    private storeDataService: StoreDataService,
    private cardService: PaymentCardsService,
    private sidePanelService: SidePanelService,
    private snackBarService: SnackbarService,
    // private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private router: Router,
    private onboardingService: OnboardingService
  ) {
    // selected card can be virtual or physical
    this.selectedCardTypeControl = new FormControl('', Validators.required);

    this.addressForm = this.fb.group({
      street_name: ['', Validators.required],
      street_number: ['', Validators.required],
      floor: [''],
      apartment: [''],
      city: ['', Validators.required],
      region: ['', Validators.required],
      country: ['Argentina', Validators.required],
      zip_code: ['', Validators.required], //number
      neighborhood: [''],
    });
  }

  ngOnInit(): void {
    this.isIframe = this.storeDataService.checkIframe();
    this.svgLibrary.getSvg('finances').subscribe((svgContent) => {
      this.financesImg = svgContent; // SafeHtml type to display SVG dynamically
    });
    this.svgLibrary.getSvg('congrats').subscribe((svgContent) => {
      this.congratsImg = svgContent; // SafeHtml type to display SVG dynamically
    });
    this.storeDataService.getStore().subscribe((data) => {
      if (data.init_config) {
        this.welcomeText =
          data.init_config.card_order_text || 'Pedí tu tarjeta';
      }
    });
    // validate the selected card type form control using the data passed in the constructor
    this.selectedCardTypeControl.setValue(
      this.data.canCreateVirtual ? 'VIRTUAL' : 'PHYSICAL'
    );
    this.selectedCardTypeControl.markAsTouched();
    this.selectedCardTypeControl.updateValueAndValidity();
    if (!this.data.canCreateVirtual) {
      this.getAddressData();
    }
  }

  onFocus(field: any) {
    field.isFocused = true;
  }

  // Method to handle blur
  onBlur(field: any) {
    // Check if the value is empty to determine if the label should return to the center
    field.isFocused = !!field.value.trim();
  }

  public goToStep(step: string) {
    console.log('step ', step);
    this.currentStep = this.stepLabels.indexOf(step);
  }

  public decreaseStep() {
    const invalidStepBack = [
      'propuesta_valor_peya',
      'success_tarjeta_virtual',
      'success_tarjeta_fisica',
    ];
    const cantGoBack = invalidStepBack.includes(
      this.stepLabels[this.currentStep]
    );
    if (cantGoBack) {
      this.sidePanelService.close();
      return;
    } else if (!this.data.canCreateVirtual && this.currentStep == 2) {
      this.currentStep = 0;
    } else {
      this.currentStep -= 1;
    }
  }

  public selectedCard() {
    if (this.selectedCardTypeControl.invalid) {
      this.handleError(new Error('No se ha seleccionado un tipo de tarjeta'));
      return;
    }
    if (this.selectedCardTypeControl.value === 'PHYSICAL') {
      this.getAddressData();
      this.goToStep('formulario_direccion');
      return;
    }
    this.loading = true;
    this.cardService.createCard(this.selectedCardTypeControl.value).subscribe({
      next: (data: Cards) => {
        this.loading = false;
        this.snackBarService.openSuccess(
          'Tarjeta creada con éxito',
          true,
          3000
        );
        this.goToStep('success_tarjeta_virtual');
        this.cardCreated.emit();
        this.loading = false;
      },
      error: (error: any) => {
        this.handleError(
          new Error(
            `Error en la creación de tu tarjeta ${this.selectedCardTypeControl.value}`
          )
        );
        this.loading = false;
        this.sidePanelService.close();
      },
    });
  }

  getAddressData() {
    if (this.addressForm.value.length > 0) {
      return;
    }
    this.loading = true;
    this.onboardingService.getOnboardingInfo().subscribe({
      next: (response) => {
        console.log('onboarding status ', response.address);

        if (!response.address) {
          // this.errors.push('No se ha encontrado la dirección');
          console.error('No se ha encontrado la dirección en la base de datos');
          this.loading = false;
          this.goToStep('formulario_direccion');
          return;
        }

        this.populateAddressFields(response.address);
        this.loading = false;
      },
      error: () => {
        this.handleError(new Error('Hubo un error obteniendo la dirección'));
        this.loading = false;
        this.goToStep('formulario_direccion');
      },
    });
  }
  populateAddressFields(address: any) {
    this.addressFields = [
      {
        id: 'street_name',
        label: 'Dirección',
        value: address.street,
        isFocused: false,
        required: true,
      },
      {
        id: 'street_number',
        label: 'Número',
        value: address.street_number,
        isFocused: false,
        required: true,
      },
      {
        id: 'floor',
        label: 'Piso',
        value: address.flat_number,
        isFocused: false,
        required: false,
      },
      {
        id: 'apartment',
        label: 'Departamento',
        value: '',
        isFocused: false,
        required: false,
      },
      {
        id: 'city',
        label: 'Ciudad',
        value: address.city,
        isFocused: false,
        required: true,
      },
      {
        id: 'neighborhood',
        label: 'Barrio',
        value: '',
        isFocused: false,
        required: false,
      },
      // { id: 'country', label: 'País', value: '', isFocused: false },
      {
        id: 'region',
        label: 'Estado/Provincia',
        value: this.getProvinceValueByName(address.state),
        isFocused: false,
        type: 'select',
        required: true,
      }, // Example for select input
      {
        id: 'zip_code',
        label: 'Código Postal',
        value: address.zip_code,
        isFocused: false,
        required: true,
      },
    ];
  }

  getProvinceValueByName(provinceName: string): string {
    const province = this.provinceList.find(
      (item) => item.viewValue === provinceName
    );
    return province ? province.value : '';
  }
  getProvinceNameByValue(provinceValue: string): string {
    const province = this.provinceList.find(
      (item) => item.value === provinceValue
    );
    return province ? province.viewValue : '';
  }
  public formIsValid(): boolean {
    let addressNotEmpty = true;

    // Loop through addressFields to check required values
    for (const field of this.addressFields) {
      // Check if the field is required
      if (field.required) {
        // Check for non-empty values
        if (!field.value) {
          addressNotEmpty = false;
          break; // No need to check further if we found an empty required field
        }
      }
    }

    return addressNotEmpty; // Return true if all required fields are filled
  }

  populateForm(address: any) {
    this.addressForm.patchValue({
      street_name: address.street,
      city: address.city,
      region: provinceList.find(
        (item) => item.viewValue.toUpperCase() === address.state.toUpperCase()
      )?.value,
      street_number: address.street_number.toString(),
      zip_code: address.zip_code.toString(),
      floor: address.flat_number.toString(),
    });
  }

  onSubmitPhysicalCardForm() {
    if (this.selectedCardTypeControl.invalid) {
      this.handleError(new Error('No se ha seleccionado un tipo de tarjeta'));
      return;
    }

    if (!this.formIsValid()) {
      this.handleError(new Error('Formulario de dirección no válido'));
      return;
    }

    // Transform the address fields into address data
    const addressData = this.addressFields.reduce((acc: any, field: any) => {
      // For the 'region' field, transform the value to the view value
      if (field.id === 'region') {
        acc[field.id] = this.getProvinceNameByValue(field.value);
      } else if (
        field.id === 'apartment' &&
        (!field.value || field.value.trim() === '')
      ) {
        acc[field.id] = '.'; // Set apartment to "." if empty
      } else {
        acc[field.id] = field.value.toString();
      }
      return acc;
    }, {});

    console.log('Address Data to submit: ', addressData);
    console.log('addressForm.value: ', this.addressForm.value);

    this.createPhysicalCard(addressData);
  }

  private createPhysicalCard(addressData: any) {
    console.log('createPhysicalCard()');
    this.loading = true;
    this.cardService.createCard('PHYSICAL', addressData).subscribe({
      next: (data: Cards) => {
        this.snackBarService.openSuccess(
          'Tarjeta creada con éxito',
          true,
          3000
        );
        this.goToStep('success_tarjeta_fisica');
        console.log('success card');
        this.cardCreated.emit();
        this.loading = false;
      },
      error: (error: any) => {
        console.error('error generando tarjeta física: ', error);
        this.handleError(new Error('Error generando tarjeta física'));
        this.loading = false;
      },
    });
  }
  goToNextStep(): void {
    const canCreateVirtual = this.data.canCreateVirtual;
    const canCreatePhysical = this.data.canCreatePhysical;

    if (canCreateVirtual && canCreatePhysical) {
      // If both options are available, navigate to the selection screen
      this.goToStep('seleccionar_tipo_tarjeta');
    } else if (canCreateVirtual) {
      // If only virtual cards can be created, navigate directly to the virtual card form
      this.selectedCardTypeControl.setValue('VIRTUAL'); // Ensure the control is set
      this.selectedCard(); // Call the logic to create the virtual card
    } else if (canCreatePhysical) {
      // If only physical cards can be created, navigate directly to the physical card form
      this.goToStep('formulario_direccion');
    } else {
      // Handle the case where no cards can be created (optional)
      console.warn('No puede crear tarjetas');
    }
  }
  private handleError(error: any) {
    this.snackBarService.openError(error.message, true, 3000);
  }

  trackShipment(event: Event): void {
    event.preventDefault(); // Prevent default link behavior
    console.log('Tracking shipment...');

    this.cardService.getShipping().subscribe({
      next: (data: any) => {
        if (data) {
          console.log('Shipping data found: ', data);
          this.shippingCardData = data;

          this.sidePanelService.open(
            CardShippingStatusComponent,
            'Seguimiento tarjeta',
            this.shippingCardData
          );
        } else {
          console.log('No shipping data found');
          this.snackBarService.openInfo(
            'No se encontró información de envío',
            true,
            3000
          );
          this.sidePanelService.close();
        }
      },
      error: (error: any) => {
        console.error('Error fetching shipping data: ', error);
        this.snackBarService.openError(
          'Error al obtener el estado del envío',
          true,
          3000
        );
        this.sidePanelService.close();
      },
    });
  }

  goToCards() {
    this.sidePanelService.close();
    this.router.navigate(['/app/cards']);
  }
}
