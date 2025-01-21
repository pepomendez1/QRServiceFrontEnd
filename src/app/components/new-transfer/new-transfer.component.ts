import { UserAccount } from './../../consts/UserAccount.interface'; // Importa la interfaz UserAccount
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core'; // Importa módulos necesarios de Angular
import { MatTableDataSource } from '@angular/material/table'; // Importa MatTableDataSource de Angular Material

@Component({
  selector: 'app-new-transfer', // Define el selector del componente
  templateUrl: './new-transfer.component.html', // Define la ubicación del template HTML
  styleUrls: ['./new-transfer.component.scss'], // Define la ubicación del archivo de estilos SCSS
})
export class NewTransferComponent implements OnInit {
  @ViewChild('inputAmn') inputAmn: any; // Referencia al input de monto
  @Output() exit: EventEmitter<any> = new EventEmitter(); // Define un EventEmitter para el evento de salida
  @Input() user: UserAccount | undefined; // Define una entrada de tipo UserAccount para el usuario
  @Input() amount: string = ''; // Define una entrada para el monto de la transferencia

  // Lista de cuentas de usuario (datos simulados para pruebas)
  userAccounts: UserAccount[] = [
    {
      name: 'Proveedor A',
      bank: 'Uala',
      cvu: '0000007900203932496503',
      cuit: '20391767387',
    },
    {
      name: 'Martín Strada',
      bank: 'Santander',
      cvu: '0000007900203932496503',
      cuit: '20391767387',
    },
    {
      name: 'Alicia Strada',
      bank: 'Uala',
      cvu: '0000007900203932496503',
      cuit: '20391767387',
    },
    {
      name: 'Proveedor B',
      bank: 'Uala',
      cvu: '0000007900203932496098',
      cuit: '20391767387',
    },
    {
      name: 'Leandro Sol',
      bank: 'Santander',
      cvu: '0000007900203932496503',
      cuit: '20391767387',
    },
    {
      name: 'Agustín Perez',
      bank: 'Uala',
      cvu: '0000007900203932492103',
      cuit: '20391767377',
    },
    {
      name: 'Nelson Cuevas',
      bank: 'Uala',
      cvu: '0000007900203932496503',
      cuit: '20391767332',
    },
    {
      name: 'Lucas Torres',
      bank: 'Santander',
      cvu: '0000507900203932496503',
      cuit: '20391767303',
    },
    {
      name: 'Roman Strada',
      bank: 'Uala',
      cvu: '0000007900203932496503',
      cuit: '20391702387',
    },
    {
      name: 'Proveedor C',
      bank: 'Uala',
      cvu: '0000007900203932496503',
      cuit: '20391767387',
    },
    {
      name: 'Pedro Gomez',
      bank: 'Santander',
      cvu: '0000007900203932496503',
      cuit: '20391797387',
    },
    {
      name: 'Manuel Carlos',
      bank: 'Uala',
      cvu: '0000007900203932496503',
      cuit: '20393456387',
    },
    {
      name: 'Renzo Calvo',
      bank: 'Uala',
      cvu: '0000007900203932496503',
      cuit: '20391762387',
    },
    {
      name: 'Franco Strada',
      bank: 'Santander',
      cvu: '0000007900203932496503',
      cuit: '20371767387',
    },
    {
      name: 'Fernando Fernandez',
      bank: 'Uala',
      cvu: '0000007900203932496503',
      cuit: '20391767387',
    },
    {
      name: 'Proveedor E',
      bank: 'Uala',
      cvu: '0000007900203932496503',
      cuit: '20391767387',
    },
    {
      name: 'Gonzalo Martinez',
      bank: 'Santander',
      cvu: '0000007900203932496503',
      cuit: '20391767387',
    },
    {
      name: 'Hernan Garcia',
      bank: 'Uala',
      cvu: '0000007900203932496503',
      cuit: '20391767387',
    },
  ];

  displayedColumns: string[] = ['description']; // Columnas mostradas en la tabla
  dataSource: MatTableDataSource<UserAccount> = new MatTableDataSource(); // Fuente de datos para la tabla
  // Variables para controlar la visibilidad de secciones y almacenar entradas del usuario

  showMoreContacts = false; // Controla la visibilidad de más contactos en la tabla
  // Uso: showContacts()
  // Valores posibles:
  //   true: Se muestran más contactos.
  //   false: Se muestran menos contactos (valor por defecto).

  showNewAccount = false; // Controla la visibilidad de la sección de nueva cuenta
  // Uso: Actualmente no se utiliza directamente en el código proporcionado.
  // Valores posibles:
  //   true: Se mostraría la sección de nueva cuenta.
  //   false: La sección de nueva cuenta no se muestra (valor por defecto).

  showDiary = false; // Controla la visibilidad de la agenda de contactos
  // Uso: showDiarySection()
  // Valores posibles:
  //   true: Se muestra la agenda de contactos.
  //   false: No se muestra la agenda de contactos (valor por defecto).

  inputAccount = ''; // Almacena el CBU, CVU o alias ingresado por el usuario
  // Uso: showNewAccountSection(), checkCVUAlias()
  // Valores posibles:
  //   string: Contiene el CBU, CVU o alias ingresado por el usuario.
  //   '' (cadena vacía): Valor por defecto cuando no se ha ingresado nada.

  inputAmount = '$0'; // Almacena el monto ingresado por el usuario
  // Uso: ngOnInit(), showAmountScreen(), showReviewTransfer(), formatAmount()
  // Valores posibles:
  //   '$0': Valor por defecto.
  //   '$' + string: Monto ingresado por el usuario en formato monetario.

  inputPin = ''; // Almacena el PIN de seguridad ingresado por el usuario
  // Uso: goToPinScreen(), onCodeChanged()
  // Valores posibles:
  //   '' (cadena vacía): Valor por defecto.
  //   string: Contiene el PIN de seguridad ingresado por el usuario.

  actualScreen = 'chooseAccount'; // Controla cuál pantalla se está mostrando actualmente
  // Uso: Actualiza en varios métodos como showNewAccountSection(), showDiarySection(), showAccountInfo(), etc.
  // Valores posibles:
  //   'chooseAccount': Pantalla para elegir la cuenta (valor por defecto).
  //   'diary': Pantalla para mostrar la agenda de contactos.
  //   'newAccount': Pantalla para agregar una nueva cuenta.
  //   'infoAccount': Pantalla para mostrar información de la cuenta seleccionada.
  //   'chooseAmount': Pantalla para ingresar el monto de la transferencia.
  //   'reviewTransfer': Pantalla para revisar los detalles de la transferencia.
  //   'pin': Pantalla para ingresar el PIN de seguridad.
  //   'complete': Pantalla de confirmación de la transferencia.

  transferSuccess = true; // Indica si la transferencia fue exitosa o no
  // Uso: Se utiliza para mostrar mensajes de éxito o error al finalizar la transferencia.
  // Valores posibles:
  //   true: La transferencia fue exitosa (valor por defecto).
  //   false: La transferencia no fue exitosa.

  contacts: UserAccount[] = []; // Lista de contactos del usuario
  // Uso: Inicializa y almacena los contactos disponibles del usuario.
  // Valores posibles:
  //   Array de objetos UserAccount.

  contactsFiltered: UserAccount[] = []; // Lista de contactos filtrados para búsqueda
  // Uso: Almacena los contactos filtrados según la búsqueda del usuario.
  // Valores posibles:
  //   Array de objetos UserAccount filtrados.

  accountSelected: UserAccount | undefined; // Almacena la cuenta seleccionada para la transferencia
  // Uso: Almacena la información de la cuenta que el usuario ha seleccionado para transferir.
  // Valores posibles:
  //   UserAccount: La cuenta seleccionada.
  //   undefined: Si no hay ninguna cuenta seleccionada (valor por defecto).

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    // Si el usuario está definido, selecciona la cuenta del usuario y ajusta el monto
    if (this.user) {
      this.accountSelected = this.user;
      this.inputAmount = this.amount.replace('.', '');
      this.showAmountScreen(true);
    }

    // Configura la fuente de datos de la tabla con las primeras tres cuentas de usuario
    this.dataSource = new MatTableDataSource(this.userAccounts.slice(0, 3));
  }

  // Verifica si el dispositivo es móvil
  isMobile() {
    if (window.screen.width <= 600) {
      return true;
    }
    return false;
  }

  // Alterna la visibilidad de más contactos
  showContacts() {
    this.showMoreContacts = !this.showMoreContacts;
    this.dataSource = new MatTableDataSource(this.userAccounts.slice(0, 6));
  }

  // Muestra la sección de agenda de contactos
  showDiarySection() {
    this.userAccounts.sort((a, b) => a.name.localeCompare(b.name));
    this.actualScreen = 'diary';
    this.contactsFiltered = this.userAccounts;
  }

  // Muestra la sección para agregar una nueva cuenta
  showNewAccountSection(edit?: boolean) {
    this.actualScreen = 'newAccount';
    setTimeout(() => {
      const element =
        this.elementRef.nativeElement.querySelector('#inputNewAcc');
      if (element) {
        element.focus();
      }
    }, 100);
  }

  // Muestra la información de la cuenta ingresada
  showAccountInfo() {
    if (this.checkCVUAlias()) {
      this.actualScreen = 'infoAccount';
    }
  }

  // Muestra la pantalla para ingresar el monto de la transferencia
  showAmountScreen(edit?: boolean) {
    if (!edit) {
      this.inputAmount = '$0';
    } else {
      this.inputAmount = '$' + this.inputAmount;
    }
    this.actualScreen = 'chooseAmount';
    setTimeout(() => {
      const element = this.elementRef.nativeElement.querySelector('#inputam');
      if (element) {
        element.focus();
      }
    }, 300);
  }

  // Muestra la pantalla para revisar los detalles de la transferencia
  showReviewTransfer() {
    if (this.formatAmount()) {
      this.actualScreen = 'reviewTransfer';
    }
  }

  // Muestra la pantalla para ingresar el PIN de seguridad
  goToPinScreen() {
    this.inputPin = '';
    this.actualScreen = 'pin';
  }

  // Formatea el monto ingresado
  formatAmount() {
    const amntFormated = this.inputAmount.replace('$0', '').replace('$', '');
    if (amntFormated.length != 0) {
      this.inputAmount = amntFormated;
      return true;
    }
    return false;
  }

  // Verifica si el CBU, CVU o alias es válido
  checkCVUAlias() {
    if (this.inputAccount != '') {
      // user default para pruebas
      this.accountSelected = this.userAccounts[0];
      // Proceder a guardar el contacto nuevo si el CVU o alias es válido
      this.saveContact();
      return true;
    }
    return false;
  }

  // Regresa a la pantalla anterior
  goBack() {
    if (this.actualScreen == 'chooseAmount') {
      this.actualScreen = 'infoAccount';
    } else {
      this.actualScreen = 'chooseAccount';
      this.inputAccount = '';
      this.accountSelected = undefined;
    }
  }

  // Calcula el número de columnas a mostrar en la agenda de contactos según el tamaño de la pantalla
  calcCols() {
    return window.screen.width <= 800 ||
      (window.screen.width <= 1600 && window.screen.width >= 1280)
      ? 4
      : 5;
  }

  // Aplica un filtro a la lista de contactos basándose en el valor ingresado en el input de búsqueda
  applyFilter(event: Event, array: any) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.contactsFiltered = this.userAccounts.filter((contact) => {
      return contact.name.toLowerCase().includes(filterValue);
    });
  }

  // Maneja el evento de cambio del código PIN
  onCodeChanged(code: string) {
    this.inputPin = code;
  }

  // Maneja el evento de completitud del código PIN
  onCodeCompleted(code: string) {}

  // Guarda el contacto en la agenda del usuario (simulado para pruebas)
  saveContact() {}

  // Selecciona una cuenta de usuario para la transferencia
  selectUserAccount(userAcc: UserAccount) {
    this.actualScreen = 'infoAccount';
    this.accountSelected = userAcc;
  }

  // Completa la transferencia y muestra la pantalla de confirmación
  createTransfer() {
    this.actualScreen = 'complete';
  }
}
