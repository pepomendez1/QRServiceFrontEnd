import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgFor, NgIf, CommonModule } from '@angular/common';
import {
  calculateNewCursorPosition,
  formatAsCurrency,
  setCursorPosition,
} from '../utils';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-transfer-amount',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, MatIconModule],
  templateUrl: './transfer-amount.component.html',
  styleUrl: './transfer-amount.component.scss',
})
export class TransferAmountComponent {
  @Input() availableFunds: number = 0;
  @Output() enableButton = new EventEmitter<boolean>();
  @Output() confirmAmount = new EventEmitter<void>();
  @Output() setAmount = new EventEmitter<string>();
  amount: string = '';
  transferOk: boolean = false;
  exceedFunds: boolean = false;

  ngOnInit() {
    this.enableButton.emit(false);
    this.setAmount.emit(this.amount);
  }

  onFocus() {
    console.log('Input focused');
    // Add any additional logic here
  }

  onBlur() {
    console.log('Input blurred');
    // Add any additional logic here
  }
  handleKeyDown(event: KeyboardEvent) {
    console.log('handleKeyDown: Event:', this.amount);
    const inputElement = event.target as HTMLInputElement;
    const key = event.key;

    if (key === 'Enter') {
      event.preventDefault();
      if (this.transferOk) {
        this.confirmAmount.emit();
        this.setAmount.emit(this.amount);
      }
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
      if (
        parseFloat(newValue.replace(/[^0-9,]/g, '').replace(',', '.')) >
        this.availableFunds
      ) {
        console.log('El monto no puede exceder el monto disponible.');
        // cambiar punto por coma en available amount y setearlo como new value
        this.exceedFunds = true;
        // const availableAmountFormatted = this.availableFunds
        //   .toFixed(2)
        //   .toString()
        //   .replace('.', ',');
        // newValue = availableAmountFormatted;
        // newCursorPosition = newValue.length;
      } else this.exceedFunds = false;

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
    this.amount = inputElement.value;
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
    }
  }
}
