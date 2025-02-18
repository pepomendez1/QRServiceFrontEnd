import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DescriptionTable {
  private DescriptionText: { [key: string]: string } = {
    'transfer-cash_in': 'Transferencia recibida',
    'transfer_cvu_received-cash_in': 'Transferencia recibida',
    'transfer-cash_out': 'Transferencia enviada',
    'cards-cash_in': 'Reintegro Tarjeta',
    'cards-cash_out': 'Pago con tarjeta',
    'taxes-cash_in': 'Sin descripción',
    'taxes-cash_out': 'Pago de impuesto',
    'payout-cash_in': 'Liquidación',
    'payout-cash_out': 'Sin descripción',
    'balance-investments-cash_in': 'Rendimientos',
    'balance-investment-cash_in': 'Rendimientos',
    'balance-investments-cash_out': 'Sin descripción',
  };

  private cache = new Map<string, string>();

  getDescription(type: string, source?: string): string {
    const key = source ? `${source}-${type}` : type;

    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }

    // Default behavior for type without source
    let description: string;
    if (!source) {
      description =
        type === 'cash_in'
          ? 'Ingreso de dinero'
          : type === 'cash_out'
          ? 'Pago realizado'
          : 'Sin Descripción'; // Fallback description if type doesn't match
    } else {
      description = this.DescriptionText[key] || 'Sin Descripción'; // Default description if not found
    }

    // Cache and return
    this.cache.set(key, description);
    return description;
  }
}
