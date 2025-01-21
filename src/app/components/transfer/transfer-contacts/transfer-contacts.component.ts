import { NgFor, NgIf, CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  HostListener,
  OnInit,
} from '@angular/core';
import { TreasuryService } from 'src/app/services/treasury.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { UserService } from 'src/app/services/user.service';
import { FormsModule } from '@angular/forms';
import { trigger, style, transition, animate } from '@angular/animations';
import { FormatNamePipe } from 'src/app/pipes/format-name.pipe';
import { MatProgressBar } from '@angular/material/progress-bar';
import { SnackbarService } from '@fe-treasury/shared/snack-bar/snackbar.service';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { SidePanelFooterComponent } from '@fe-treasury/shared/side-panel/side-panel-footer/side-panel-footer.component';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { SvgLibraryService } from 'src/app/services/svg-library.service';
import { SafeHtml } from '@angular/platform-browser';
import { MatError } from '@angular/material/form-field';
@Component({
  selector: 'app-transfer-contacts',
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    FormsModule,
    MatProgressBar,
    MatFormFieldModule,
    ReactiveFormsModule,
    FormatNamePipe,
    MatInputModule,
    CommonModule,
    MatError,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinner,
    SidePanelFooterComponent,
  ],
  templateUrl: './transfer-contacts.component.html',
  styleUrl: './transfer-contacts.component.scss',
  animations: [
    trigger('fadeStart', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-10px)' }),
        animate(
          '200ms ease-out',
          style({ opacity: 1, transform: 'translateX(0)' })
        ),
      ]),
    ]),
  ],
})
export class TransferContactsComponent implements OnInit {
  //@Input() contacts: any[] = [];
  @Output() selectedContact = new EventEmitter<any>();
  @Output() selectedContactTemp = new EventEmitter<any>();
  @Output() contactType = new EventEmitter<string>();
  @Output() enableButton = new EventEmitter<boolean>();
  @Output() isLoadingContacts = new EventEmitter<boolean>();
  cbuInput: string = '';
  typeDestination: string = 'last'; // Opción por defecto
  problemImg: SafeHtml | null = null;
  contacts: any[] = [];
  isValid: boolean = false;
  notFoundOwner: boolean = false;
  accountOwner: any = null;
  selectedContactId: number | null = null;
  processingDeleteContact: boolean = false;
  processingFavorite: boolean = false;
  favProcessingMessage: string = '';
  public filteredContacts: any[] = [];
  public isLoading: boolean = true;
  useMockData: boolean = false;
  mockDataContacts: any[] = [
    {
      id: 3,
      name: 'Parker, Peter',
      cbu: '3220001805000040970014',
      cvu: '',
      alias: 'hola.prueba',
      initials: '',
      bank_name: 'BANCO INDUSTRIAL S.A.',
      additional_info: '',
      favorite: true,
    },
    {
      id: 4,
      name: 'Stark, Tony',
      cbu: '3220004782023055910025',
      cvu: '',
      alias: 'JUAN.ROMERO.RIO',
      initials: '',
      bank_name: 'BANCO INDUSTRIAL S.A.',
      additional_info: '',
      favorite: false,
    },
    {
      id: 2,
      name: 'Diaz, Bruno',
      cbu: '3220001823000055910025',
      cvu: '',
      alias: 'holaprueba',
      initials: '',
      bank_name: 'BANCO INDUSTRIAL S.A.',
      additional_info: '',
      favorite: false,
    },
    {
      id: 5,
      name: 'Rogers, Steve',
      cbu: '3220001823000099776025',
      cvu: '',
      alias: 'JUAN.ROMERO.RIO',
      initials: '',
      bank_name: 'BANCO INDUSTRIAL S.A.',
      additional_info: '',
      favorite: false,
    },
    {
      id: 6,
      name: 'Grimm, Ben',
      cbu: '3220001823765455910025',
      cvu: '',
      alias: 'ana.castro',
      initials: '',
      bank_name: 'BANCO INDUSTRIAL S.A.',
      additional_info: '',
      favorite: false,
    },
    {
      id: 7,
      name: 'García, Pepe',
      cbu: '3220001823765466910025',
      cvu: '',
      alias: 'ana.castro',
      initials: '',
      bank_name: 'BANCO INDUSTRIAL S.A.',
      additional_info: '',
      favorite: false,
    },
    {
      id: 8,
      name: 'Perez, Juan',
      cbu: '3220001828865455910025',
      cvu: '',
      alias: 'ana.castro',
      initials: '',
      bank_name: 'BANCO INDUSTRIAL S.A.',
      additional_info: '',
      favorite: false,
    },
    {
      id: 9,
      name: 'Castro, Ana',
      cbu: '32200018237654559100012',
      cvu: '',
      alias: 'ana.castro2',
      initials: '',
      bank_name: 'BANCO INDUSTRIAL S.A.',
      additional_info: '',
      favorite: false,
    },
  ];
  constructor(
    private svgLibrary: SvgLibraryService,
    private treasuryService: TreasuryService,
    private snackbarService: SnackbarService
  ) {}

  ngOnInit() {
    this.svgLibrary.getSvg('problem').subscribe((svgContent) => {
      this.problemImg = svgContent; // SafeHtml type to display SVG dynamically
      //console.log('Dynamically loaded SVG with store color:', svgContent);
    });
    this.isLoadingContacts.emit(true);
    this.enableButton.emit(false);
    this.selectedContact.emit(null);
    this.selectedContactTemp.emit(null);
    this.getContacts();
  }

  getContacts() {
    if (this.useMockData) {
      this.contacts = this.mockDataContacts;
      this.filteredContacts = this.getFilteredContacts();
      setTimeout(() => {
        this.isLoading = false;
        this.isLoadingContacts.emit(false);
      }, 1000);
    } else {
      this.treasuryService.getContacts().subscribe({
        next: (response) => {
          console.log('Contacts fetched:', response);
          this.contacts = response.contacts; // Asegúrate de acceder a la propiedad "contacts"
          //this.contacts = <any>[]; // test no contacts
          this.filteredContacts = this.getFilteredContacts();
          this.isLoading = false;
          this.isLoadingContacts.emit(false);
        },
        error: (err) => {
          console.error('Error fetching contacts:', err);
          this.isLoadingContacts.emit(false);
          this.isLoading = false;
        },
      });
    }
  }
  selectOption(option: string) {
    this.typeDestination = option;
    this.filteredContacts = this.getFilteredContacts();
  }

  searchAccountOwner() {
    console.log('searching for: ', this.cbuInput);
    this.isLoading = true;
    this.notFoundOwner = false;
    this.isLoadingContacts.emit(true);
    console.log('searching for: ', this.cbuInput);
    if (this.isValid) {
      this.treasuryService.getAccountOwner(this.cbuInput).subscribe({
        next: (accountOwner) => {
          console.log('Account Owner fetched:', accountOwner);
          this.selectedContact.emit(accountOwner); // Call stepCompleted method
          this.contactType.emit('new'); // Call stepCompleted method
          this.accountOwner = accountOwner; // Almacenar los detalles del propietario de la cuenta
          this.isLoading = false;
          this.isLoadingContacts.emit(false);
        },
        error: (err) => {
          console.error('Error fetching account owner:', err);
          this.accountOwner = null; // Si hay un error, no se encuentra el propietario
          this.notFoundOwner = true;
          this.isLoading = false;
          this.isLoadingContacts.emit(false);
        },
      });
    }
  }

  getNoContactsMessage(): string {
    if (this.typeDestination === 'favourites') {
      return 'Todavía no tenés ningun contacto favorito';
    } else if (this.typeDestination === 'last') {
      return 'No has realizado ninguna transferencia aún. Cuando lo hagas, aquí aparecerán tus contactos frecuentes';
    } else {
      return 'No hay contactos disponibles.';
    }
  }

  getFilteredContacts(): any[] {
    if (this.typeDestination === 'favourites') {
      // Filter contacts marked as favorites
      return this.contacts.filter((contact) => contact.favorite === true);
    } else {
      // Return all contacts if no filter is applied
      return this.contacts;
    }
  }

  validateInput() {
    this.isValid = this.cbuInput.length >= 6;
    if (this.notFoundOwner) {
      this.notFoundOwner = false;
    }
    // if (this.cbuInput.length >= 6){this.searchAccountOwner()}
  }

  toggleFavorite(contact: any): void {
    this.processingFavorite = true;
    contact.isFavMode = true;
    this.favProcessingMessage = !contact.favorite
      ? 'Agregando a favoritos ...'
      : 'Eliminando de favoritos ...';

    this.treasuryService
      .toggleFavoriteContact(contact.id, !contact.favorite)
      .subscribe({
        next: () => {
          if (!contact.favorite) {
            this.snackbarService.openSuccess(
              'Contacto agregado a favoritos',
              false,
              3000
            );
          } else {
            this.snackbarService.openSuccess(
              'Contacto eliminado de favoritos',
              false,
              3000
            );
          }
          contact.favorite = !contact.favorite;
          console.log('Contact added to favorites.');
        },
        error: (err) => {
          if (!contact.favorite) {
            console.error('Error adding contact to favorites:', err);
            this.snackbarService.openError(
              'Error al agregar a favoritos',
              true,
              3000
            );
          } else {
            console.error('Error removing contact from favorites:', err);
            this.snackbarService.openError(
              'Error al eliminar de favoritos',
              true,
              3000
            );
          }
        },
        complete: () => {
          this.processingFavorite = false;
          contact.isFavMode = false;
        },
      });
  }
  onSelect(contact: any) {
    console.log('selected contact ', contact.id);
    this.accountOwner = contact; // Guardar el contacto seleccionado como accountOwner
    this.selectedContactId = contact.id;
    this.enableButton.emit(true); // enable button
    this.contactType.emit('agenda'); // set contact type to agenda
    this.selectedContactTemp.emit(this.accountOwner); // save temporary contact to confirm with button
  }

  enableDeleteMode(contact: any) {
    contact.isDeleteMode = true;
  }

  cancelDeleteMode(contact: any) {
    contact.isDeleteMode = false;
  }

  confirmDeleteContact(contact: any) {
    this.processingDeleteContact = true;
    console.log('eliminar contacto: ', contact);
    this.treasuryService.deleteContact(contact.id).subscribe({
      next: () => {
        console.log('Contacto eliminado! ');
        this.contacts = this.contacts.filter((c) => c.id !== contact.id);
        this.processingDeleteContact = false;
        contact.isDeleteMode = false;
        this.snackbarService.openSuccess('Contacto Eliminado! ', false, 3000);
      },
      error: (error) => {
        console.error('Error al eliminar contacto: ', error.statusText);
        this.snackbarService.openError(
          'Error al eliminar contacto',
          true,
          3000
        );
        this.processingDeleteContact = false;
      },
    });
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    const clickedInside = target.closest('.contact-info');

    if (!clickedInside) {
      this.selectedContactId = null; // Deselect the contact
      this.accountOwner = null;
      this.enableButton.emit(false);
    }
  }
}
