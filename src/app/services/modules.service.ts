import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { StoreDataService } from './store-data.service';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FeatureFlagsService {
  private featureFlags = new BehaviorSubject({
    international_account: false,
    basic_modules: false,
    balance_investments_module: false,
    services_payment: false,
    insurance_module: false,
    payment_link_module: false,
    qr_module: false,
  });
  private originalFeatureFlags = this.featureFlags.value; // Store original flags
  featureFlags$ = this.featureFlags.asObservable(); // Expose as observable

  constructor(private storeService: StoreDataService) {}

  async loadFeatureFlags(): Promise<void> {
    try {
      console.log('⏳ Waiting for store data to load...');
      await this.storeService.loadStore(); // Ensure store loads first

      const storeData = await firstValueFrom(this.storeService.getStore());
      console.log('🛠 Store data after load:', storeData);

      const internationalAccount =
        storeData?.init_config?.['international_account'] === 'true';

      const newFeatureFlags = {
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
        payment_link_module:
          storeData?.init_config?.['payment_link_module'] === 'true',
        qr_module: storeData?.init_config?.['qr_module'] === 'true',
      };

      console.log('✅ Feature Flags Loaded:', newFeatureFlags);
      this.originalFeatureFlags = { ...newFeatureFlags };
      this.featureFlags.next(newFeatureFlags); // Update feature flags
    } catch (error) {
      console.error('❌ Error fetching store data:', error);

      // Default to basic_modules = true in case of errors
      this.featureFlags.next({
        international_account: false,
        basic_modules: true,
        balance_investments_module: false,
        services_payment: false,
        insurance_module: false,
        payment_link_module: false,
        qr_module: false,
      });
    }
  }

  updateFeatureFlags(flags: Partial<typeof this.featureFlags.value>): void {
    const currentFlags = this.featureFlags.value;

    // Enforce mutual exclusivity between international_account and basic_modules
    if (flags.international_account === true) {
      flags.basic_modules = false; // Ensure basic_modules is false
      flags.balance_investments_module = false;
      flags.services_payment = false;
      flags.insurance_module = false;
      flags.payment_link_module = false;
      flags.qr_module = false;
    } else if (flags.basic_modules === true) {
      flags.international_account = false; // Ensure international_account is false

      // Restore balance_investments_module, services_payment, and insurance_module to their original values
      flags.balance_investments_module =
        this.originalFeatureFlags.balance_investments_module;
      flags.services_payment = this.originalFeatureFlags.services_payment;
      flags.insurance_module = this.originalFeatureFlags.insurance_module;
      flags.payment_link_module = this.originalFeatureFlags.payment_link_module;
      flags.qr_module = this.originalFeatureFlags.qr_module;
    }

    const newFlags = { ...currentFlags, ...flags }; // Merge changes
    this.featureFlags.next(newFlags); // Notify subscribers
    console.log('🔄 Updated Feature Flags:', newFlags);
  }

  getFeatureFlags() {
    return this.featureFlags.value;
  }
}
