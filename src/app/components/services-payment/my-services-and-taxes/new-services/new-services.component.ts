import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, CUSTOM_ELEMENTS_SCHEMA, ViewChild, ElementRef } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { SidePanelFooterComponent } from '@fe-treasury/shared/side-panel/side-panel-footer/side-panel-footer.component';
import { SidePanelHeaderComponent } from '../../../../../../@fe-treasury/shared/side-panel/side-panel-header/side-panel-header.component';
import { SidePanelService } from '@fe-treasury/shared/side-panel/side-panel.service';
//import { types } from 'util';
import { MatCard } from '@angular/material/card';
import { MatSpinner } from '@angular/material/progress-spinner';
import createFuzzySearch from '@nozbe/microfuzz';
import { ServicesPaymentService, PaymentInfo, Company, OperationStatusResponse, RequestPayments, DebtResponse } from '../../services-payment.service';
import { SafeHtml } from '@angular/platform-browser';
import { SvgLibraryService } from 'src/app/services/svg-library.service';
import { Observable } from 'rxjs';
import { TreasuryService } from 'src/app/services/treasury.service';
import { formatAsCurrency, calculateNewCursorPosition, setCursorPosition } from '../../../transfer/utils';
import { ChangeDetectorRef } from '@angular/core';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { jsPDF } from 'jspdf';
import { OTPService } from 'src/app/services/otp.service';
import { AuthService } from 'src/app/services/auth.service';
import { MessageService } from '@fe-treasury/shared/messages/messages.service';
import { OtpInputModule } from '@fe-treasury/shared/otp-input/otp-input.module';
import { OtpInputComponent } from '@fe-treasury/shared/otp-input/otp-input.component';
import { ConfirmationDialogComponent } from '../../../transfer/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { SharedService } from '../../services-payment.shared-service';

@Component({
  selector: 'app-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    MatRadioModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    MatDatepickerModule,
    MatCard,
    MatSpinner,
    SidePanelFooterComponent,
    SidePanelHeaderComponent,
    ClipboardModule,
    OtpInputModule,
    ConfirmationDialogComponent,
  ],
  animations: [
    trigger('toggleContent', [
      state('closed', style({ height: '0px', opacity: 0, overflow: 'hidden' })),
      state('open', style({ height: '*', opacity: 1 })),
      transition('closed <=> open', [animate('300ms ease-in-out')]),
    ]),
  ],
  templateUrl: './new-services.component.html',
  styleUrl: './new-services.component.scss',
})
export class NewServiceComponent implements OnInit {
  @ViewChild(OtpInputComponent) otpInputComponent!: OtpInputComponent;

  @Output() applyFilters = new EventEmitter<any>();

  @Input() data!: {
    //periodsList: string[];
    //typesList: string[];
    //selectedPeriod: string;
    //selectedTypes: string[];
    popularServices: any;
    selectedCompany: any;
    currentPayDetail: any;
    preparePayment?: DebtResponse;
    companyLogo?: string,
    clientId?: string,
    currentStep: number;
  };

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  filtersForm!: FormGroup;
  //accountForm!: FormGroup;

  isAccordionOpen = false;
  accountInfo: any = {
    // Información de la cuenta (CVU, alias)
    nroCuenta: '',
    alias: '',
  };
  isFocused = false;
  searchQuery: string = '';
  searching: boolean = false; // Controlador del estado spinner de búsqueda
  fuzzySearch: any;

  filteredServices: any = {};
  noHistory: boolean = false; // Controlador del estado de "sin transacciones"

  selectedService: any = null

  defaultLogo: string = "https://public-logo.prod.tapila.cloud/tags_common/tag_PrestamosYServiciosFinancieros.png";

  step: number = 0;
  loading = false;
  footerEnable = false;
  headerEnable = true;
  buttonText = "Continuar"
  buttonDisabled = true;
  pagoOK = true;
  availableAmount = 0;
  userAccountId=-1;
  // Asegúrate de que `popularServices` tenga este tipo
  //this.data.popularServices = {} as PopularServices;

  selectedPayment: string = 'account'; // Valor inicial (puede ser 'account' o 'visa')

  debtsData: any;
  foundFactura = false;
  problemImg: SafeHtml | null = null;
  noActivityMessage: string = '';

  minNewAmount = 0;
  maxNewAmount = 1000;
  //newAmountValue: string= '0';

  isEditing: boolean = false;

  headerTitle = "Pagar cuentas y servicios";

  fechaHoraActual: Date = new Date();

  currentPayDetail: any;

  arrowBackEnabled = true;

  otp: Boolean = false;

  // opt data
  passwordImg: SafeHtml | null = null;
  public session: string | null = '';
  public challengeName: string | null = '';
  public otpObject: string = '';
  public buttonEnabled = false;
  public waitingForOtp: boolean = false;
  public userEmail: string | null = null;
  public otpError: string = '';
  public incorrectOTP: boolean = false;
  public clearForm = false;
  public timeOut: boolean = false;
  public resetTimer: boolean = false; // Reset timer signal

  payMethods: any[] = [{ description: 'Dinero en cuenta', checked: true }, { description: 'Tarjeta de crédito', checked: false }]
  constructor(
    private dialog: MatDialog,
    private cd: ChangeDetectorRef,
    private treasuryService: TreasuryService,
    private svgLibrary: SvgLibraryService,
    private servicesPaymentService: ServicesPaymentService,
    private sidePanelService: SidePanelService,
    private fb: FormBuilder,
    private otpService: OTPService,
    public authService: AuthService,
    private messageService: MessageService,
    private sharedService: SharedService
  ) { }

  ngOnInit(): void {
    console.log('data', this.data);
    //const selectAllTypes = this.data.selectedTypes.includes('Todas');

    this.svgLibrary.getSvg('problem').subscribe((svgContent) => {
      this.problemImg = svgContent;
    });

    this.filteredServices = { ...this.data.popularServices };
    console.log('filteredServices ', this.filteredServices);

    this.filtersForm = this.fb.group({
      //selectAllTypes: selectAllTypes,
      //selectedPeriod: this.data.selectedPeriod,
      //selectedTypes: [this.data.selectedTypes],
      searchQuery: [''],
      clientNumber: ['', Validators.required],
      alias: ['', Validators.required],
      newAmount: [0]
    });

    /*this.filtersForm
      .get('selectAllTypes')
      ?.valueChanges.subscribe((isChecked) => {
        if (isChecked) {
          // Disable and uncheck all other checkboxes
          this.disableAndResetTypes();
        } else {
          // Enable all other checkboxes
          this.enableTypes();
        }
      });*/

    // Escucha los cambios en el valor del campo de búsqueda
    this.filtersForm.get('searchQuery')?.valueChanges.subscribe((value) => {
      if (value.length >= 3) {
        this.filteredServices = this.searchServicesByName(value)
      } else {
        //this.filterServices(value);
      }
    });

    this.treasuryService.getBalance().subscribe((data: any) => {
      this.availableAmount = data.balance;
      this.userAccountId = data.user_account_id;
      console.log('availableAmount: ', this.availableAmount);
      console.log('userAccountId: ', this.userAccountId);

      if(this.availableAmount==0 || this.userAccountId == null){
        this.filtersForm.setErrors({ invalid: true }); // Marca todo el formulario como inválido
      }
      /*this.visibleBalance = formatAsCurrency(
        this.availableAmount.toString().replace('.', ',')
      );
      this.accountInfo = data?.accounts[0];*/
    });
    //this.getDebsData()
    //this.filterServices(); // Apply the search filter whenever transactions are loaded/*  */

    this.filtersForm.valueChanges.subscribe((values) => {
      console.log('Form changes:', values);
      console.log('Form status:', this.filtersForm.status);
    });

    console.log('on sideP init / this.data: ', this.data);

    if(this.data.selectedCompany){
      this.selectedService= //this.data.selectedCompany;
      {
        category:"",
        companyCategory:this.data.selectedCompany.category,
        companyCode:this.data.selectedCompany.company_code,
        companyLogo:this.data.selectedCompany.company_logo,
        companyName:this.data.selectedCompany.company_name
      }

      console.log('selectedService:', this.selectedService);
      this.footerEnable = true;
      this.step=this.data.currentStep;
    } else {
      this.selectedService={};
    }



    if(this.data.currentPayDetail){
      console.log('this.data.currentPayDetail: ', this.data.currentPayDetail);
      setTimeout(() => {this.arrowBackEnabled=false;}, 1000);

      this.debtsData = {
        operationId: this.data.currentPayDetail.operation_id,
        companyCode: this.data.currentPayDetail.companyCode,
        companyName: this.data.currentPayDetail.companyName,
        companyLogo: this.data.currentPayDetail.companyLogo
      }
      this.step=this.data.currentStep;

      this.servicesPaymentService.getOperationStatus(this.debtsData.operationId).subscribe((data: any) => {
        console.log('getOperationStatus: ', data);
        this.currentPayDetail = data;

        if(data.operation.status=='confirmed'){
          this.pagoOK = true
        } else {
          this.pagoOK = false
        }

        this.buttonText = 'Descargar comprobante';

        this.currentPayDetail = {
          operationId: this.data.currentPayDetail.operation_id,
          companyCode: this.data.currentPayDetail.companyCode,
          companyName: this.data.currentPayDetail.companyName,
          companyLogo: this.data.currentPayDetail.companyLogo,
          createdAt: data.operation.createdAt,
          amount: data.operation.amount,
          ticket : data.operation.additionalData.ticket
        }
        // form valid ->
        this.filtersForm.patchValue({ alias: 'ALIAS' });
        this.filtersForm.patchValue({ clientNumber: this.data.currentPayDetail });

        // turns over success/denied pay screen
        this.step++;
        this.nextStep();
      });
    }

    if (this.data.preparePayment){
      setTimeout(() => {this.arrowBackEnabled=false;}, 1000);

      this.debtsData = this.data.preparePayment;
      this.foundFactura = true;
      this.debtsData.companyLogo = this.data.companyLogo;
      this.step=this.data.currentStep;

      // form valid ->
      this.filtersForm.patchValue({ alias: 'ALIAS' });
      this.filtersForm.patchValue({ clientNumber: this.data.clientId });

      this.footerEnable = true;
    }

  }

  getDebsData(requestBody: any) {
    console.log('GET getDebsData');
    //this.errors = [];
    //this.selectedCard = null;
    //this.loading = true;

    this.servicesPaymentService.getDebsData(requestBody).subscribe({
      next: (data: any | null) => {
        if (data) {
          console.log('getDebsData: ', data);
          //this.checkCanAddNewCard(data);
          this.debtsData = data
          this.foundFactura = true;
          this.debtsData.companyLogo = this.selectedService.companyLogo;

          if (this.debtsData.debts[0].amountType == 'OPEN') {
            this.filtersForm.patchValue({ newAmount: this.debtsData.debts[0].amount });
            this.minNewAmount = this.debtsData.debts[0].minAmount;
            this.maxNewAmount = this.debtsData.debts[0].maxAmount;

            this.filtersForm.get('newAmount')?.setValue(this.debtsData.debts[0].amount);

            this.updateValidators();
          }

          if(this.debtsData.debts[0].amount > this.availableAmount){
            this.filtersForm.setErrors({ invalid: true }); // Marca todo el formulario como inválido
          }

        } else {
          // esto es para que el template muestre el mensaje de no hay tarjetas
          //this.activeCards = [];
          this.foundFactura = false;
          this.buttonText = 'Volver';
        }
        this.loading = false;
      },
      error: (error: any) => {
        this.loading = false;
        this.foundFactura = false;
        this.buttonText = 'Volver';
      },
    });
  }

  onImageError(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = this.defaultLogo; // Reemplaza con el logo por defecto
  }

  isTypeDisabled(type: string): boolean {
    // Disable other options if 'Todas' is selected
    return (
      this.filtersForm.value.selectedTypes.includes('Todas') && type !== 'Todas'
    );
  }

  onSubmit(): void {
    this.filterServices(this.searchQuery);
    //this.applyFilters.emit(this.filtersForm.value);
    //this.sidePanelService.close();
    console.log('Filters Applied:', this.searchQuery);
  }

  toggleAccordion() {
    this.isAccordionOpen = !this.isAccordionOpen;
  }

  clearFilters() {
    this.filtersForm.setValue({
      selectAllTypes: true,
      selectedPeriod: 'Último año',
      selectedTypes: ['Todas'],
    });
    setTimeout(() => {
      this.sidePanelService.close();
      this.applyFilters.emit(this.filtersForm.value);
    }, 500);
  }

  getKeys(obj: any): string[] {
    //return Object.keys(obj);
    return obj ? Object.keys(obj) : [];
  }

  onCompanyClick(company: any, category: string) {
    console.log("Empresa seleccionada:", company);
    console.log("category:", category);
    company.companyCategory = category
    this.selectedService = company
    this.nextStep()
  }

  onViewAll(service: string) {
    console.log("Ver todas las empresas de:", service);
  }

  capitalize(text: string): string {
    return text
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }


  filterServices(query: string) {
    console.log('filterServices:', query);

    const lowerQuery = query.toLowerCase(); // Para búsqueda sin distinción de mayúsculas

    this.filteredServices = Object.entries(this.data.popularServices).reduce((acc: any, [category, services]) => {
      const filteredServices = (services as any[]).filter(service =>
        service.companyName.toLowerCase().includes(lowerQuery) ||
        service.companyCode.toLowerCase().includes(lowerQuery)
      );
      console.log('filteredServices:', filteredServices);
      if (filteredServices.length > 0) {
        acc[category] = filteredServices;
      }
      return acc;
    }, {});
  }

  /*searchServicesByName(value: string) {
    console.log('searchServicesByName:', value);

    const lowerQuery = value.toLowerCase(); // Para búsqueda sin distinción de mayúsculas
    this.loading = true;
    this.servicesPaymentService.searchCompanyByName(value).subscribe((data: any[]) => {
      const groupedData = data.reduce((acc, company) => {
        const category = company.tags && company.tags.length > 0 ? company.tags.join(' / ') : 'Sin Categoría';

        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(company);
        return acc;
      }, {} as Record<string, any[]>);

      this.filteredServices = groupedData;
      this.loading = false;
    });

  }*/

  searchServicesByName(value: string) {
    console.log('searchServicesByName:', value);

    const lowerQuery = value.toLowerCase(); // Para búsqueda sin distinción de mayúsculas
    this.loading = true; // Activa el loading antes de la petición

    this.servicesPaymentService.searchCompanyByName(value).subscribe({
      next: (data: any[]) => {
        const groupedData = data.reduce((acc, company) => {
          const category = company.tags && company.tags.length > 0 ? company.tags.join(' / ') : 'Sin Categoría';

          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push(company);
          return acc;
        }, {} as Record<string, any[]>);

        this.filteredServices = groupedData;
      },
      error: (err) => {
        console.error('Error al buscar compañías:', err);
        this.filteredServices = {}; // Opcional: Resetear el listado en caso de error
        //this.showErrorMessage('Ocurrió un error al buscar compañías, intenta nuevamente.');
        this.loading = false; // Asegura que loading se desactive al finalizar, éxito o error
      },
      complete: () => {
        console.error('searchCompanyByName complete');
        this.loading = false; // Asegura que loading se desactive al finalizar, éxito o error

        setTimeout(() => {
          this.searchInput.nativeElement.focus();
        }, 0);
      }
    });


  }

  sanitizeInputNumeric(event: any) {
    event.target.value = event.target.value.replace(/[^0-9]/g, '');
  }

  nextStep(): void {
    if (this.loading) return; // Evita clics múltiples
    this.loading = true;

    console.log('next step');
    console.log('current step:', this.step);
    switch (this.step) {
      case 0:
        this.arrowBackEnabled=true;
        this.footerEnable = true;
        this.buttonText = 'Continuar';

        this.filtersForm.patchValue({ alias: '' });
        this.filtersForm.patchValue({ clientNumber: '' });

        this.isEditing = false;
        this.filtersForm.patchValue({ newAmount: 0 });

        this.step++;
        this.loading = false;
        break;
      case 1://search debts
        this.clearValidators();
        this.isEditing = false;
        /*
        this.foundFactura=false;
        this.buttonText = 'Buscar otra factura'
        this.noActivityMessage = 'No pudimos encontrar la factura'
        */
        //obtener full company para tener el ....
        //const fullCompany: Observable<Company> = this.servicesPaymentService.getCompanyByCode(this.selectedService.getCompanyByCode)
        console.log('selectedService CompanyCode:', this.selectedService.companyCode);
        console.log('selectedService logo:', this.selectedService.companyLogo);
        this.servicesPaymentService.getCompanyByCode(this.selectedService.companyCode).subscribe({
          next: (company) => {
            console.log('Empresa recibida:', company);
            //this.company = company; // Guarda el resultado en una variable del componente

            const requestBody = {
              companyCode: this.selectedService.companyCode,
              modalityId: company.modalities[0].modalityId,//"74cc2f09-6c74-49f4-b6d7-e57f274fb1b3",
              identifierName: "clientNumber",
              identifierValue: this.filtersForm.get('clientNumber')?.value,
              externalRequestId: "REQ" + this.userAccountId,
              externalClientId: "CLI" + this.userAccountId
            };
            this.getDebsData(requestBody);
            this.step++;
            //this.loading = false;
          },
          error: (err) => {
            console.error('Error al obtener la empresa:', err);
            this.foundFactura = false
            this.buttonText = 'Volver';
            this.step++;
            this.loading = false;
          }
        });

        break;
      case 2:// debts
        if (!this.foundFactura) {
          this.step = 0;
          this.footerEnable = false;
        } else {
          this.step++;
        }
        this.loading = false;
        break;
      case 3:// pagar factura -> pantalla de success/error
        console.log('entra a case 3: step', this.step);

        if (this.otp) {

          this.arrowBackEnabled = false;

          const amountToPay=this.filtersForm.value.newAmount>0?this.filtersForm.value.newAmount:this.debtsData.debts[0].amount;

          let request: RequestPayments = {
            debtId: this.debtsData.debts[0].debtId,
            amount: amountToPay,
            paymentMethod: 'DEBIT',
            externalPaymentId: this.debtsData.operationId
          }
          console.log('pay request: ', request);

          this.headerEnable = false;
          this.footerEnable = false;
          this.sidePanelService.togglePadding(true);

          this.servicesPaymentService.payments(request).subscribe({
            next: (data: any) => {
              console.log('Payments response: ', data);

              if (data.status === 'processing') {
                this.pagoOK = true;
                this.buttonText = 'Descargar comprobante';
              } else {
                this.pagoOK = false;
                this.buttonText = 'Intentar de nuevo';
              }

              this.currentPayDetail = data;
              this.step++; // Cambia a pantalla de éxito

              setTimeout(() => {
                this.nextStep(); // Luego de 5 segundos, obtener/mostrar comprobante para descargar
              }, 5000);

              // Segunda llamada para obtener el estado de la operación
              this.servicesPaymentService.getOperationStatus(this.debtsData.operationId).subscribe({
                next: (data: any) => {
                  this.buttonText = 'Descargar comprobante';
                },
                error: (err) => {
                  console.error('Error en getOperationStatus:', err);
                  this.buttonText = 'Error al obtener estado';
                }
              });

              this.sharedService.emitirEvento('update_history');
              this.sharedService.emitirEvento('update_my_services');

              this.loading = false;
            },
            error: (err) => {
              console.error('Error en payments:', err);
              this.pagoOK = false;
              this.buttonText = 'Intentar de nuevo';

              this.currentPayDetail = {
                operationId: this.debtsData.operationId,
                companyCode: this.debtsData.companyCode,
                companyName: this.debtsData.companyName,
                companyLogo: this.debtsData.companyLogo,
                createdAt: new Date().toISOString(),
                amount: this.debtsData.debts[0].amount,
                ticket : []
              }

              this.step++; // Cambia a pantalla de error
              this.loading = false;
              setTimeout(() => {
                this.nextStep(); // Luego de 5 segundos, volver a factura
              }, 5000);
            }
          });


          this.otp = false;
        } else {
          // otp
          this.step = 10;
          console.log('asking for otp, step:', this.step);
          this.askForOtp();
          this.loading = false;
        }
        //this.clearFilters()
        break;
      case 4:// pantalla de success / aqui solo muestra por 5 sec
        console.log('entra a case 4: step', this.step);

        this.fechaHoraActual = new Date();

        this.headerEnable = true;
        this.footerEnable = true;
        this.sidePanelService.togglePadding(false);

        this.headerTitle = "Detalle de pago";
        this.step++;
        this.loading = false;
        break;
      case 5:// detalle de pago -> comprobante
        if(this.currentPayDetail?.ticket){
          // ticket legal de TAPI
          this.downloadTicketAsPDF(this.currentPayDetail?.ticket)
          console.log('debtsData ', this.debtsData)
          console.log(this.currentPayDetail)
        } else { // aun sin ticket legal de TAPI
          console.log(this.currentPayDetail)

          // Extraer la fecha y la hora
          const [date, time] = this.currentPayDetail.createdAt.split("T");

          // Limpiar la hora para quitar los milisegundos y la "Z"
          const formattedTime = time.split(".")[0];

          const ticketDetails: string[] = [
            "Comprobante de Pago",
            "Código de Operación: " + this.currentPayDetail.operationId,
            "Fecha: " + date + "     Hora: " + formattedTime,
            "Empresa: " + this.currentPayDetail.companyName,
            "Importe: " + this.currentPayDetail.amount,
            "Identificador de cliente: Sin detalle",
            "Identificador de Pago: Sin detalle",
            "Forma de Pago Efectivo",
            "Importe " + this.currentPayDetail.amount,
            "** TOTAL ** $" + this.currentPayDetail.amount,
            "---------------*****---------------"
          ];

          this.downloadTicketAsPDF(ticketDetails)
        }
        this.loading = false;
        break;
      case 10:
        console.log('case 10- otp: ', this.otpObject);

        this.submitOtp();

        this.loading = false;
        break;
      default:
        this.loading = false;
        break;
    }
    console.log('new step:', this.step);
  }

  handleArrowBack(): void {

    if (this.step === 0) {
      this.selectedService= {}
      this.sidePanelService.close();
    } else if (this.step === 1) {
      this.footerEnable = false;
      this.step--;
    } else if (this.step === 2) {
      this.step--;
      this.clearValidators();
      this.isEditing = false;
      setTimeout(() => {
        this.debtsData = {}
      }, 500);
      this.buttonText = 'Continuar';
      this.filtersForm.patchValue({ newAmount: 0 });
      //this.selectedService = null
    } else if (this.step === 3) {
      this.step--;
      this.isEditing = false;
      this.filtersForm.patchValue({ newAmount: this.debtsData.debts[0].amount });
    } else if (this.step > 0) {
      this.step--;
    }
    console.log('handleArrowBack step', this.step);

    console.log('Formulario errores:');
    Object.keys(this.filtersForm.controls).forEach(controlName => {
      const control = this.filtersForm.get(controlName);
      if (control?.errors) {
        console.log(`${controlName}:`, control.errors);
      }
    });
  }

  handleKeyDown(event: KeyboardEvent) {
    //console.log('handleKeyDown: Event:', this.amount);
    const inputElement = event.target as HTMLInputElement;
    const key = event.key;

    if (key === 'Enter') {
      event.preventDefault();

      let value = inputElement.value;
      value = value.replace(/\./g, '').replace(',', '.'); // Remueve separadores y cambia coma por punto
      let numericValue = parseFloat(value);

      if (!isNaN(numericValue)) {
        this.filtersForm.get('newAmount')?.setValue(numericValue);
        this.filtersForm.get('newAmount')?.updateValueAndValidity();
      } else {
        console.error("Valor inválido para número:", inputElement.value);
      }

      console.log('Nuevo monto:', this.filtersForm.get('newAmount')?.value);
      this.isEditing = false;
      return;
    }

    let cursorPosition = inputElement.selectionStart as number;
    //console.log('handleKeyDown: Key pressed:', key);
    //console.log('handleKeyDown: Cursor position:', cursorPosition);

    // Ignorar teclas de control
    if (
      [
        'ArrowLeft',
        'ArrowRight',
        'Shift',
        'ArrowUp',
        'ArrowDown',
        'Tab',
        'Enter',
      ].includes(key)
    ) {
      return;
    }

    // Permitir números, comas y puntos, prevenir el default para cualquier otra tecla
    if (key.match(/^[0-9,.]$/) || key === 'Backspace' || key === 'Delete') {
      event.preventDefault(); // Prevenir la acción predeterminada para manejar la inserción y eliminación manualmente

      let inputValue = inputElement.value;
      // console.log(
      //   'handleKeyDown: Input element value var inputValue:',
      //   inputValue
      // );

      const decimalIndex = inputValue.indexOf(',');
      let newValue = inputValue;
      let newCursorPosition = cursorPosition;

      if (key === 'Backspace') {
        // console.log(
        //   'handleKeyDown: Backspace Cursor Position:',
        //   cursorPosition
        // );
        // console.log('handleKeyDown: Backspace Decimal Index:', decimalIndex);
        // console.log('handleKeyDown: Backspace Input Value:', inputValue);
        // console.log(
        //   'handleKeyDown: Backspace caracter ',
        //   inputValue[cursorPosition - 1]
        // );
        if (
          inputValue[cursorPosition - 1] === ',' ||
          inputValue[cursorPosition - 1] === '.'
        ) {
          cursorPosition -= 1;
        }
        if (cursorPosition > 0) {
          if (cursorPosition <= decimalIndex || decimalIndex === -1) {
            // En la parte entera
            // console.log('handleKeyDown: Backspace in integer part.');
            // Si el caracter anterior es una coma o un punto, eliminar el proximo caracter
            // console.log(
            //   'handleKeyDown: Backspace caracter ',
            //   inputValue[cursorPosition - 1]
            // );
            if (
              inputValue[cursorPosition - 1] === ',' ||
              inputValue[cursorPosition - 1] === '.'
            ) {
              newValue =
                inputValue.slice(0, cursorPosition - 2) +
                inputValue.slice(cursorPosition - 1);
              //console.log('handleKeyDown: New Value:', newValue);
              newCursorPosition = cursorPosition - 2;
              // console.log(
              //   'handleKeyDown: New Cursor Position:',
              //   newCursorPosition
              // );
            } else {
              newValue =
                inputValue.slice(0, cursorPosition - 1) +
                inputValue.slice(cursorPosition);
              newCursorPosition = cursorPosition - 1;
            }
          } else {
            //console.log('handleKeyDown: Backspace in decimal part.');
            // En la parte decimal
            if (
              inputValue[cursorPosition - 1] === ',' ||
              inputValue[cursorPosition - 1] === '.'
            ) {
              newValue =
                inputValue.slice(0, cursorPosition - 2) +
                '0' +
                inputValue.slice(cursorPosition);
              newCursorPosition = cursorPosition - 2;
            } else {
              newValue =
                inputValue.slice(0, cursorPosition - 1) +
                '0' +
                inputValue.slice(cursorPosition);
              newCursorPosition = cursorPosition - 1;
            }
          }
        }
      } else if (key === 'Delete') {
        if (cursorPosition < inputValue.length) {
          if (cursorPosition < decimalIndex || decimalIndex === -1) {
            // En la parte entera
            if (
              inputValue[cursorPosition] === ',' ||
              inputValue[cursorPosition] === '.'
            ) {
              newValue =
                inputValue.slice(0, cursorPosition) +
                inputValue.slice(cursorPosition + 2);
            } else {
              newValue =
                inputValue.slice(0, cursorPosition) +
                inputValue.slice(cursorPosition + 1);
            }
            if (newValue.length === 0) {
              newValue = '0';
            }
          } else {
            // En la parte decimal
            if (
              inputValue[cursorPosition] === ',' ||
              inputValue[cursorPosition] === '.'
            ) {
              newValue =
                inputValue.slice(0, cursorPosition) +
                '0' +
                inputValue.slice(cursorPosition + 2);
            } else {
              newValue =
                inputValue.slice(0, cursorPosition) +
                '0' +
                inputValue.slice(cursorPosition + 1);
            }
          }
        }
      } else if (key === ',' || key === '.') {
        if (decimalIndex === -1) {
          newValue = inputValue + ',00';
          newCursorPosition = newValue.indexOf(',') + 1;
        } else {
          newCursorPosition = decimalIndex + 1;
        }
      } else {
        if (decimalIndex !== -1 && cursorPosition > decimalIndex) {
          const decimalPart = inputValue.slice(decimalIndex + 1).split('');
          const decimalCursorPosition = cursorPosition - decimalIndex - 1;

          if (decimalCursorPosition < decimalPart.length) {
            decimalPart[decimalCursorPosition] = key;
          } else {
            decimalPart.push(key);
          }

          newValue =
            inputValue.slice(0, decimalIndex + 1) + decimalPart.join('');
          newCursorPosition = cursorPosition + 1;
        } else {
          newValue =
            inputValue.slice(0, cursorPosition) +
            key +
            inputValue.slice(cursorPosition);
          newCursorPosition = cursorPosition + 1;
        }
      }
      // si el numero es mayor a abailableamount se setea ese valor como value del campo
      /*if (
        parseFloat(newValue.replace(/[^0-9,]/g, '').replace(',', '.')) > this.availableFunds
      ) {
        console.log('El monto no puede exceder el monto disponible.');
        // cambiar punto por coma en available amount y setearlo como new value
        this.exceedFunds = true;

      } else this.exceedFunds = false;*/

      // Asegurarse de que siempre haya 0 en la parte entera y 00 en la parte decimal
      if (newValue === '' || newValue === ',') {
        newValue = '0,00';
      } else if (newValue.startsWith(',')) {
        newValue = '0' + newValue;
      } else if (!newValue.includes(',')) {
        newValue += ',00';
      }

      // Formatear el número como moneda
      const formattedValue = formatAsCurrency(newValue);
      inputElement.value = formattedValue;
      inputElement.style.width = `${formattedValue.length - 1}.1ch`;

      // Determinar la nueva posición del cursor
      newCursorPosition = calculateNewCursorPosition(
        newValue,
        cursorPosition,
        formattedValue,
        key
      );

      // Restaurar la posición del cursor
      setCursorPosition(inputElement, newCursorPosition);

      // Determinar si el cursor está del lado de los enteros o de los decimales
      const updatedDecimalIndex = formattedValue.indexOf(',');
      let cursorSide = 'integers';

      if (updatedDecimalIndex !== -1) {
        if (newCursorPosition > updatedDecimalIndex) {
          cursorSide = 'decimals';
        } else {
          cursorSide = 'integers';
        }
      }
    } else {
      event.preventDefault();
    }
    /* this.amount = inputElement.value;
     if (parseInt(this.amount) >= 1 && !this.exceedFunds) {
       this.transferOk = true;
       this.enableButton.emit(true);
       this.setAmount.emit(this.amount);
     } else if (this.exceedFunds) {
       this.transferOk = false;
       this.enableButton.emit(false);
     } else {
       this.transferOk = false;
       this.enableButton.emit(false);
     }*/
  }

  onInputChange(event: any) {
    /* this.newAmountValue = event.target.value;
    this.filtersForm.get('newAmount')?.setValue(this.newAmountValue);
 */
    this.filtersForm.get('newAmount')?.setValue(event.target.value);

  }
  updateValidators() {
    const newAmountControl = this.filtersForm.get('newAmount');

    if (newAmountControl) {
      newAmountControl.setValidators([
        Validators.min(this.minNewAmount),
        Validators.max(this.maxNewAmount)
      ]);

      // 🔹 Es importante llamar a esto para que Angular reconozca los nuevos validadores
      newAmountControl.updateValueAndValidity();
    }
  }

  clearValidators() {
    const newAmountControl = this.filtersForm.get('newAmount');
    newAmountControl?.clearValidators();
    newAmountControl?.updateValueAndValidity();
  }

  downloadTicketAsPDF(ticket: string[]): void {
    const doc = new jsPDF();

    // Configurar fuente y tamaño
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    // Agregar cada línea del ticket al PDF
    let y = 10; // Posición inicial en Y
    ticket.forEach(line => {
      doc.text(line, 10, y);
      y += 7; // Espaciado entre líneas
    });

    // Descargar el PDF
    doc.save("ticket.pdf");
  }

  handleButtonEnabled(status: boolean) {
    this.buttonDisabled = !status;
  }

  askForOtp() {
    this.loading = true;
    this.buttonDisabled = true;

    this.userEmail = this.authService.getEmail();
    // first send code to email
    this.otpService.sendOtp(this.userEmail).subscribe((data: any) => {
      console.log('Otp sent:', data);
      this.session = data.Session;
      this.challengeName = data.ChallengeName;
      this.waitingForOtp = true;
      this.loading = false;
    });
  }
  handleOtpEvent(otp?: string) {
    if (otp) {
      this.otpObject = otp;
    }
    console.log('otpObject:', this.otpObject);
    return;
  }

  restartValues(): void {
    this.session = localStorage.getItem('otpSession');
    this.challengeName = localStorage.getItem('challengeName');

    if (!this.userEmail || !this.session) {
      console.error('Missing email or session in localStorage');
      this.messageService.showMessage('Código incorrecto', 'error');
      // Optionally, redirect the user back to the request OTP screen or show an error message
    }
  }

  handleButtonText(text: string): void {
    this.buttonText = text;
  }

  submitOtp(): void {
    console.log('submitOtp()')
    if (!this.buttonDisabled) {
      this.otpInputComponent.submitOtp();
    }
  }

  otpValidatedOK() {
    this.waitingForOtp = false;
    this.confirmPayment();
  }

  confirmPayment() {
    this.otp = true;
    this.step = 3;
    this.nextStep();
  }

   openConfirmationDialog(): void {
      let messageTitle = '¿Estás seguro que querés salir de esta operación?';
      let messageContent = '';

      const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        panelClass: 'custom-dialog-container',
        width: '400px',
        data: { messageTitle: messageTitle, messageContent: messageContent },
        disableClose: true,
        backdropClass: 'backdrop-class',
      });

      dialogRef.afterClosed().subscribe((result: any) => {
        if (result) {
          this.sidePanelService.close();
        }
      });
    }

}
