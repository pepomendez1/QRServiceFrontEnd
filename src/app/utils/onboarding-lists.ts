export interface SimpleSelectValues {
  value: string;
  viewValue: string;
}
export const maritalStatusList: SimpleSelectValues[] = [
  { value: 'single', viewValue: 'Soltero/a' },
  { value: 'married', viewValue: 'Casado/a' },
  { value: 'union', viewValue: 'Unión de Hecho' },
  { value: 'widowed', viewValue: 'Viudo/a' },
  { value: 'divorced', viewValue: 'Divorciado/a' },
];

export interface SimpleSelectValuesId {
  id: number;
  value: string;
  viewValue: string;
}

export const provinceList: SimpleSelectValuesId[] = [
  { id: 1, value: 'AR-B', viewValue: 'Buenos Aires' },
  { id: 2, value: 'AR-C', viewValue: 'Ciudad Autónoma de Buenos Aires' },
  { id: 3, value: 'AR-K', viewValue: 'Catamarca' },
  { id: 4, value: 'AR-H', viewValue: 'Chaco' },
  { id: 5, value: 'AR-U', viewValue: 'Chubut' },
  { id: 6, value: 'AR-X', viewValue: 'Córdoba' },
  { id: 7, value: 'AR-W', viewValue: 'Corrientes' },
  { id: 8, value: 'AR-E', viewValue: 'Entre Ríos' },
  { id: 9, value: 'AR-P', viewValue: 'Formosa' },
  { id: 10, value: 'AR-Y', viewValue: 'Jujuy' },
  { id: 11, value: 'AR-L', viewValue: 'La Pampa' },
  { id: 12, value: 'AR-F', viewValue: 'La Rioja' },
  { id: 13, value: 'AR-M', viewValue: 'Mendoza' },
  { id: 14, value: 'AR-N', viewValue: 'Misiones' },
  { id: 15, value: 'AR-Q', viewValue: 'Neuquén' },
  { id: 16, value: 'AR-R', viewValue: 'Río Negro' },
  { id: 17, value: 'AR-A', viewValue: 'Salta' },
  { id: 18, value: 'AR-J', viewValue: 'San Juan' },
  { id: 19, value: 'AR-D', viewValue: 'San Luis' },
  { id: 20, value: 'AR-Z', viewValue: 'Santa Cruz' },
  { id: 21, value: 'AR-S', viewValue: 'Santa Fe' },
  { id: 22, value: 'AR-G', viewValue: 'Santiago del Estero' },
  { id: 23, value: 'AR-V', viewValue: 'Tierra del Fuego' },
  { id: 24, value: 'AR-T', viewValue: 'Tucumán' },
];
