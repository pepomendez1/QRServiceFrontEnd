import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CognitoUser } from 'amazon-cognito-identity-js'; // Import the CognitoUser class
import { ConfigService } from './config.service';
import { firstValueFrom } from 'rxjs';
export interface StorageData {
  init_config?: {
    // init config es la respuesta del endpoint `/user/auth/portalClient`
    [key: string]: string | number | undefined | boolean; // Index signature
    card_order_text: string;
    lost_card_currency: string;
    lost_card_amount: string;
    portal_client_id: string;
    user_pool: string;
    terms_and_conditions: string;
    // DOCS
    affidavit_file: string;
    terms_and_conditions_investments: string;
    iframe_help_url: string;
    faq_investments: string;
    help_content_doc: string;
    privacy_policy: string;
    select_module_enable: string;
    max_physical_cards_on_account: number;
    max_virtual_cards_on_account: number;
    primary_color: string;
    accent_color: string;
    login_message_finance: string;
    login_message_settings: string;
    login_message_shop: string;
    primary_logo_url: string;
    contrast_logo_url: string;
    web_title: string;
    image_stroke_color: string;
    bar_chart_color: string;
    favicon_url: string;
    metamap_flow_id: string;
    toggle_mode_enable: string;
    inactivity_monitor_status: string;
    toggle_inactivity_monitor: string;
    number_of_slides: string | number;
    slide1Title: string;
    slide1Description: string;
    slide2Title: string;
    slide2Description: string;
    slide3Title: string;
    slide3Description: string;
    slide4Title: string;
    slide4Description: string;
  };
  isIframe?: boolean; // ✅ Add isIframe flag
  cognitoUser?: CognitoUser | null; // Add cognitoUser to the interface
  // Feel free to add more as needed
}

@Injectable({
  providedIn: 'root',
})
export class StoreDataService {
  // Create a BehaviorSubject with an initial empty state
  private storeSubject = new BehaviorSubject<StorageData>({});
  private store$ = this.storeSubject.asObservable();

  constructor(private configService: ConfigService) {}

  async loadStore(): Promise<void> {
    try {
      const config = await firstValueFrom(this.configService.getConfig());
      const isIframe = window.self !== window.top; // ✅ Detect iframe
      this.updateStore({
        init_config: config,
        isIframe, // ✅ Save isIframe state
      });
    } catch (error) {
      console.error('Error loading store:', error);
      throw error; // Optional: rethrow error if needed
    }
  }
  // Method to get the store as an Observable
  getStore(): Observable<StorageData> {
    console.log('getStore');
    return this.store$;
  }

  // Method to update specific properties in the store
  updateStore(newData: Partial<StorageData>): void {
    const currentStore = this.storeSubject.getValue();
    this.storeSubject.next({ ...currentStore, ...newData });
    console.log('store updated', newData);
  }

  // Method to reset the store to its initial state
  resetStore(): void {
    console.log('resetStore');
    this.storeSubject.next({});
  }
  // ✅ Expose isIframe check
  checkIframe(): boolean {
    return this.storeSubject.getValue().isIframe ?? false;
  }

  getUserPoolId(): string {
    return this.storeSubject.getValue().init_config?.user_pool ?? '';
  }

  getClientId(): string {
    return this.storeSubject.getValue().init_config?.portal_client_id ?? '';
  }
}
