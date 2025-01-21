export function handleFocus(event: any) {
  const inputElement = event.target;
  setTimeout(() => {
    inputElement.setSelectionRange(1, 1);
  }, 1);
}

export function calculateNewCursorPosition(inputValue: string, cursorPosition: number, formattedValue: string, key: string): number {
  console.log('--- Calculating New Cursor Position ---');
  console.log('Initial Input Value:', inputValue);
  console.log('Initial Cursor Position:', cursorPosition);
  console.log('Formatted Value:', formattedValue);
  console.log('Key Pressed:', key);

  const originalLength = inputValue.length;
  const formattedLength = formattedValue.length;
  const adjustment = formattedLength - originalLength;

  console.log('Original Length:', originalLength);
  console.log('Formatted Length:', formattedLength);
  console.log('Adjustment:', adjustment);

  // Mover el cursor una posición a la izquierda si la tecla es 'Backspace' y estamos en la parte entera
  if (key === 'Backspace') {
    cursorPosition
    const decimalIndex = inputValue.indexOf(',');
    console.log('Decimal Index in Input Value:', decimalIndex);

    if (cursorPosition -1  <= decimalIndex || decimalIndex === -1) {
      console.log('Backspace in integer part. Moving cursor one position to the left.');
      return cursorPosition - 1 - (adjustment*-1);
    }

    console.log('Backspace in decimal part. Returning original cursor position.');
    return cursorPosition - 1;
  }

  let newPosition = cursorPosition + adjustment;
  console.log('Initial New Position (after adjustment):', newPosition);

  // Ajustar la posición del cursor si se está ingresando un número en la parte decimal
  const decimalIndex = formattedValue.indexOf(',');
  console.log('Decimal Index in Formatted Value:', decimalIndex);

  if (decimalIndex !== -1) {
    if (cursorPosition > decimalIndex && key.match(/^[0-9]$/)) {
      newPosition += 1;
      console.log('Adjusting position for decimal part. New Position:', newPosition);
    } else if (cursorPosition <= decimalIndex) {
      newPosition += 1; // Ajustar la posición si está en la parte de enteros
      console.log('Adjusting position for integer part. New Position:', newPosition);
    }
  }

  console.log('Final New Position:', newPosition);
  return newPosition;
}

export function formatAsCurrency(value: string): string {
  if (!value) return '0,00';

  // Reemplazar todos los caracteres que no sean dígitos o comas
  value = value.replace(/[^0-9,]/g, '');

  // Si no hay coma, formatear como número entero
  if (value.indexOf(',') === -1) {
    value += ',00';
  } else {
    // Asegurarse de que hay dos dígitos decimales
    const parts = value.split(',');
    if (parts[0] === '') {
      parts[0] = '0';
    }
    if (parts[1].length === 0) {
      parts[1] = '00';
    } else if (parts[1].length === 1) {
      parts[1] += '0';
    } else if (parts[1].length > 2) {
      parts[1] = parts[1].substring(0, 2);
    }
    value = parts.join(',');
  }

  // Si se eliminan todos los números, volver a "0,00"
  if (value === ',' || value === '') {
    value = '0,00';
  }

  // Dividir el valor en enteros y decimales
  const parts = value.split(',');
  const integerPart = parseInt(parts[0], 10).toLocaleString('es-AR');
  const decimalPart = parts[1] ? parts[1].substring(0, 2) : '00';

  return `${integerPart},${decimalPart}`;
}

export function setCursorPosition(inputElement: HTMLInputElement, position: number) {
  window.requestAnimationFrame(() => {
    inputElement.setSelectionRange(position, position);
  });
}

// Función para convertir una cadena de moneda a un número
export function convertToNumber(value: string): number {
  const parts = value.split(',');
  const integerPart = parseInt(parts[0].replace(/\./g, ''), 10);
  const decimalPart = parseInt(parts[1], 10);
  return integerPart + decimalPart / 100;
}
