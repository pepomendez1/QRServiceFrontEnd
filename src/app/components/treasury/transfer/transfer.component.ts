import { Component, HostListener, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AbstractControl } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatListModule } from '@angular/material/list';
import { CurrencyPipe } from '@angular/common';
import { CurrencyMaskModule } from 'ng2-currency-mask';
import {calculateNewCursorPosition, formatAsCurrency, handleFocus, setCursorPosition} from "./utils";
import { TreasuryService } from 'src/app/services/treasury.service';

interface Contact {
  id: number;
  name: string;
  initials: string;
  bank_name: string;
}

@Component({
  selector: 'app-transfer',
  templateUrl: './transfer.component.html',
  styleUrls: ['./transfer.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    FormsModule,
    MatDividerModule,
    MatTableModule,
    MatSortModule,
    MatListModule,
    CurrencyMaskModule,
  ],
  providers: [CurrencyPipe]
})
export class TransferComponent implements OnInit {
  actualScreen: string = 'chooseAccount';
  showMoreContacts: boolean = false;
  dataSource: any[] = [];
  contactsFiltered: any[] = [];
  accountSelected: any = null;
  inputAmount: string = '0,00';
  inputAccount: string = '';
  isAccountValid: boolean = false;
  transferSuccess: boolean = false;
  inputPin: string = '';
  displayedColumns: string[] = ['description'];
  transferReason: string = 'Varios';
  availableAmount: number = 0.00;
  errorMessage: string = '';
  errorTimeout: any;
  contacts: Contact[] = [];
  filteredContacts: Contact[] = [];
  searchTerms: string = '';

  protected readonly handleFocus = handleFocus;

  @ViewChild('amountInput') amountInput!: ElementRef;
  @ViewChild('accountInput') accountInput!: ElementRef;
  @ViewChild('hiddenInput') hiddenInput!: ElementRef;

  constructor(private treasuryService: TreasuryService, private currencyPipe: CurrencyPipe, private router: Router) {}

  ngOnInit(): void {
    this.filterContacts();
    this.treasuryService.getBalance().subscribe((data: any) => {
      this.availableAmount = data.balance;
    });

    this.treasuryService.getContacts().subscribe((data: any) => {
      // data viene como un objeto con un array de contactos {contacts: [{}...]}
      this.contacts = data.contacts 
      this.filteredContacts = [...this.contacts];
    });
  }

  isMobile(): boolean {
    return window.innerWidth <= 768;
  }

  showNewAccountSection() {
    this.actualScreen = 'newAccount';
    setTimeout(() => {
      this.accountInput.nativeElement.focus();
    }, 0);
  }

  showDiary() {
    this.actualScreen = 'diary';
  }

  selectUserAccount(account: any) {
    this.accountSelected = account;
    this.actualScreen = 'infoAccount';
  }

  showContacts() {
    this.showMoreContacts = true;
  }

  onCodeChanged(event: any) {
    this.inputPin = event;
  }

  onCodeCompleted(event: any) {
    this.createTransfer();
  }

  editAmount() {
    this.actualScreen = 'chooseAmount';
  }

  editAccount() {
    this.actualScreen = 'chooseAccount';
  }

  editReason() {
    this.actualScreen = 'editReason';
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      if (this.actualScreen === 'newAccount' && this.isAccountValid) {
        this.confirmNewAccount();
      } else if (this.actualScreen === 'infoAccount') {
        this.showAmountScreen();
      } else if (this.actualScreen === 'chooseAmount' && this.isInputAmountValid()) {
        this.showReviewTransfer();
      } else if (this.actualScreen === 'reviewTransfer') {
        this.goToPinScreen();
      }
    } else if (event.key === 'Backspace') {
      if (this.actualScreen === 'chooseAmount' || this.actualScreen === 'newAccount') {

      } else {
        this.goBack();
      }
    }
  }

  filterContacts() {
    if (this.searchTerms.length < 3) {
      this.filteredContacts = [...this.contacts];
      return;
    }

    const searchTermsLower = this.searchTerms.toLowerCase();

    if (this.searchTerms.includes(' ')) {
      this.filteredContacts = this.contacts.filter(contact =>
        contact.name.toLowerCase().includes(searchTermsLower)
      );
    } else {
      this.filteredContacts = this.contacts.filter(contact =>
        contact.name
          .toLowerCase()
          .split(' ')
          .some(part => part.startsWith(searchTermsLower))
      );
    }
  }

  confirmNewAccount() {
    if (this.isAccountValid) {
      this.treasuryService.getAccountOwner(this.inputAccount).subscribe((data: any) => {
        this.accountSelected = data;
        this.actualScreen = 'infoAccount';
      })
    } else {
      alert('El CBU, CVU o alias ingresado no es válido.');
    }
  }

  validateAccount(): void {
    const cbuPattern = /^\d{22}$/;
    const cvuPattern = /^\d{22}$/;
    const aliasPattern = /^[a-zA-Z0-9\.\-]{6,20}$/;

    this.isAccountValid = cbuPattern.test(this.inputAccount) || cvuPattern.test(this.inputAccount) || aliasPattern.test(this.inputAccount);
  }

  navigateToTransfer(contact: Contact) {
    this.router.navigate(['/transfer'], { queryParams: { contact: contact.id } });
  }

  goBack() {
    if (this.actualScreen === 'newAccount') {
      this.actualScreen = 'chooseAccount';
    } else if (this.actualScreen === 'infoAccount') {
      this.actualScreen = 'newAccount';
    } else if (this.actualScreen === 'chooseAmount') {
      this.actualScreen = 'infoAccount';
    } else if (this.actualScreen === 'reviewTransfer') {
      this.actualScreen = 'chooseAmount';
      this.amountInput.nativeElement.focus();
    } else if (this.actualScreen === 'pin') {
      this.actualScreen = 'reviewTransfer';
    } else if (this.actualScreen === 'complete') {
      this.actualScreen = 'chooseAccount';
      this.resetForm();
    }
  }

  resetForm() {
    this.inputAccount = '';
    this.inputAmount = '0,00';
    this.inputPin = '';
    this.accountSelected = null;
    this.transferSuccess = false;
  }

  showAmountScreen(edit?: boolean) {
    this.actualScreen = 'chooseAmount';
    setTimeout(() => {
      this.amountInput.nativeElement.focus();
    }, 0);
  }

  showReviewTransfer() {
    const numericAmount = parseFloat(this.inputAmount.replace(/[^0-9,]/g, '').replace(',', '.'));
    if (numericAmount > 0 && numericAmount <= this.availableAmount) {
      this.actualScreen = 'reviewTransfer';
    }
  }

  isInputAmountValid(): boolean {
    console.log(this.inputAmount)
    const amount = parseFloat(this.inputAmount);
    if (isNaN(amount) || amount <= 0) {
      this.errorMessage = '';
      return false;
    } else {
      this.errorMessage = '';
      return true;
    }
  }

  goToPinScreen() {
    this.actualScreen = 'pin';
  }

  createTransfer() {
    this.transferSuccess = true;
    this.actualScreen = 'complete';
  }

  getInitials(name: string): string {
    if (!name) return '';
    const initials = name.split(' ').map(n => n[0]).join('');
    return initials.substring(0, 2).toUpperCase();
  }

  adjustWidth() {
    const hiddenElement = this.hiddenInput.nativeElement;
    const inputElement = this.amountInput.nativeElement;
    hiddenElement.innerText = inputElement.value ? this.currencyPipe.transform(inputElement.value, 'USD', 'symbol', '1.2-2') : '0.00';
    inputElement.style.width = hiddenElement.offsetWidth + 'px';
  }

  get formattedAmount() {
    return this.currencyPipe.transform(this.inputAmount, 'USD', 'symbol', '1.2-2');
  }

  amountValidator(control: AbstractControl) {
    if (control.value > this.availableAmount) {
      this.showErrorMessage("El monto no puede exceder el monto disponible.");
      return { amountInvalid: true };
    }
    return null;
  }

  handleKeyDown(event: KeyboardEvent) {
    console.log('handleKeyDown: Event:', this.inputAmount);
    const inputElement = event.target as HTMLInputElement;
    const key = event.key;
    let cursorPosition = inputElement.selectionStart as number;
    console.log('handleKeyDown: Key pressed:', key);
    console.log('handleKeyDown: Cursor position:', cursorPosition);

    // Ignorar teclas de control
    if (['ArrowLeft', 'ArrowRight', 'Shift', 'ArrowUp', 'ArrowDown', 'Tab', 'Enter'].includes(key)) {
      return;
    }

    // Permitir números, comas y puntos, prevenir el default para cualquier otra tecla
    if (key.match(/^[0-9,.]$/) || key === 'Backspace' || key === 'Delete') {
      event.preventDefault(); // Prevenir la acción predeterminada para manejar la inserción y eliminación manualmente

      let inputValue = inputElement.value;
      console.log('handleKeyDown: Input element value var inputValue:', inputValue);

      const decimalIndex = inputValue.indexOf(',');
      let newValue = inputValue;
      let newCursorPosition = cursorPosition;

      if (key === 'Backspace') {
        console.log('handleKeyDown: Backspace Cursor Position:', cursorPosition);
        console.log('handleKeyDown: Backspace Decimal Index:', decimalIndex);
        console.log('handleKeyDown: Backspace Input Value:', inputValue);
        console.log('handleKeyDown: Backspace caracter ',inputValue[cursorPosition - 1]);
        if (inputValue[cursorPosition - 1] === ',' || inputValue[cursorPosition - 1] === '.') {
          cursorPosition -= 1
        }
        if (cursorPosition > 0) {
            if (cursorPosition <= decimalIndex || decimalIndex === -1) {
                // En la parte entera
                console.log('handleKeyDown: Backspace in integer part.');
                // Si el caracter anterior es una coma o un punto, eliminar el proximo caracter
                console.log('handleKeyDown: Backspace caracter ',inputValue[cursorPosition - 1]);
                if (inputValue[cursorPosition - 1] === ',' || inputValue[cursorPosition - 1] === '.') {
                    newValue = inputValue.slice(0, cursorPosition - 2) + inputValue.slice(cursorPosition - 1);
                    console.log('handleKeyDown: New Value:', newValue);
                    newCursorPosition = cursorPosition - 2;
                    console.log ('handleKeyDown: New Cursor Position:', newCursorPosition);
                } else {
                    newValue = inputValue.slice(0, cursorPosition - 1) + inputValue.slice(cursorPosition);
                    newCursorPosition = cursorPosition - 1;
                }
            } else {
              console.log('handleKeyDown: Backspace in decimal part.');
                // En la parte decimal
                if (inputValue[cursorPosition - 1] === ',' || inputValue[cursorPosition - 1] === '.') {
                    newValue = inputValue.slice(0, cursorPosition - 2) + '0' + inputValue.slice(cursorPosition);
                    newCursorPosition = cursorPosition - 2;
                } else {
                    newValue = inputValue.slice(0, cursorPosition - 1) + '0' + inputValue.slice(cursorPosition);
                    newCursorPosition = cursorPosition - 1;
                }
            }
        }
    } else if (key === 'Delete') {
        if (cursorPosition < inputValue.length) {
            if (cursorPosition < decimalIndex || decimalIndex === -1) {
                // En la parte entera
                if (inputValue[cursorPosition] === ',' || inputValue[cursorPosition] === '.') {
                    newValue = inputValue.slice(0, cursorPosition) + inputValue.slice(cursorPosition + 2);
                } else {
                    newValue = inputValue.slice(0, cursorPosition) + inputValue.slice(cursorPosition + 1);
                }
                if (newValue.length === 0) {
                    newValue = '0';
                }
            } else {
                // En la parte decimal
                if (inputValue[cursorPosition] === ',' || inputValue[cursorPosition] === '.') {
                    newValue = inputValue.slice(0, cursorPosition) + '0' + inputValue.slice(cursorPosition + 2);
                } else {
                    newValue = inputValue.slice(0, cursorPosition) + '0' + inputValue.slice(cursorPosition + 1);
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

            newValue = inputValue.slice(0, decimalIndex + 1) + decimalPart.join('');
            newCursorPosition = cursorPosition + 1;
        } else {
            newValue = inputValue.slice(0, cursorPosition) + key + inputValue.slice(cursorPosition);
            newCursorPosition = cursorPosition + 1;
        }
    }
      // si el numero es mayor a abailableamount se setea ese valor como value del campo
      if (parseFloat(newValue.replace(/[^0-9,]/g, '').replace(',', '.')) > this.availableAmount) {
        console.log('El monto no puede exceder el monto disponible.');
        // cambiar punto por coma en available amount y setearlo como new value
        const availableAmountFormatted = this.availableAmount.toFixed(2).toString().replace('.', ',');
        newValue = availableAmountFormatted;
        newCursorPosition = newValue.length;
      }

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

      // Determinar la nueva posición del cursor
      newCursorPosition = calculateNewCursorPosition(newValue, cursorPosition, formattedValue, key);

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
    this.inputAmount = inputElement.value;
  }

  showErrorMessage(message: string) {
    this.errorMessage = message;
    clearTimeout(this.errorTimeout);
    this.errorTimeout = setTimeout(() => {
      this.errorMessage = '';
    }, 3000);
  }
}
