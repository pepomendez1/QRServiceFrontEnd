import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class IconLookupService {
  private iconMap: { [key: string]: string } = {
    'transfer-cash_in': 'arrow_forward',
    'transfer-cash_out': 'arrow_back',
    'cards-cash_in': 'refresh',
    'cards-cash_out': 'credit_card',
    'taxes-cash_in': 'account_balance',
    'taxes-cash_out': 'account_balance',
    'payout-cash_in': 'attach_money',
    'payout-cash_out': 'money_off_csred',
    'balance-investments-cash_in': 'trending_up',
    'balance-investments-cash_out': 'sync',
  };

  private cache = new Map<string, string>();

  getIcon(type: string, source?: string): string {
    const key = source ? `${source}-${type}` : type;

    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }

    // Default behavior for type without source
    let icon: string;
    if (!source) {
      icon =
        type === 'cash_in'
          ? 'arrow_back'
          : type === 'cash_out'
          ? 'arrow_forward'
          : 'question_mark'; // Fallback icon if type doesn't match
    } else {
      icon = this.iconMap[key] || 'question_mark'; // Default icon if not found
    }

    // Cache and return
    this.cache.set(key, icon);
    return icon;
  }
}
