import { Injectable } from '@angular/core';
import { StoreDataService } from './store-data.service';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FeatureFlagsService {
  private featureFlags = {
    international_account: false,
    basic_modules: false,
    balance_investments_module: false,
    services_payment: false,
    insurance_module: false,
  };

  constructor(private storeService: StoreDataService) {}

  async loadFeatureFlags(): Promise<void> {
    try {
      console.log('⏳ Waiting for store data to load...');
      await this.storeService.loadStore(); // Ensure store loads first

      const storeData = await firstValueFrom(this.storeService.getStore());
      console.log('🛠 Store data after load:', storeData);

      const internationalAccount =
        storeData?.init_config?.['international_account'] === 'true';

      this.featureFlags = {
        international_account: internationalAccount,
        basic_modules: internationalAccount
          ? false
          : storeData?.init_config?.['basic_modules'] !== 'false',
        balance_investments_module:
          storeData?.init_config?.['balance_investments_module'] === 'true',
        services_payment:
          storeData?.init_config?.['services_payment'] === 'true',
        insurance_module:
          storeData?.init_config?.['insurance_module'] === 'true',
      };

      console.log('✅ Feature Flags Loaded:', this.featureFlags);
    } catch (error) {
      console.error('❌ Error fetching store data:', error);

      // Default to basic_modules = true in case of errors
      this.featureFlags = {
        international_account: false,
        basic_modules: true,
        balance_investments_module: false,
        services_payment: false,
        insurance_module: false,
      };
    }
  }

  getFeatureFlags() {
    return this.featureFlags;
  }
}
