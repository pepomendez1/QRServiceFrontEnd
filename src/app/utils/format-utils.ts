export function formatAsCurrency(value: string): string {
  const numberValue = parseFloat(value.replace(',', '.'));  // Convertir a número
  if (isNaN(numberValue)) {
    return '0.00';  // En caso de error, devolver 0.00
  }

  // Formatear el número a formato de moneda, por ejemplo, con 2 decimales y separadores de miles
  return numberValue.toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',  // Aquí defines la moneda, en este caso pesos argentinos (ARS)
    minimumFractionDigits: 2
  });
}
