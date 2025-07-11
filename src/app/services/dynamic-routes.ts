import { Injectable } from '@angular/core';
import { Routes } from '@angular/router';
import { InvestmentComponent } from '../components/investment/investment.component';
import { TreasuryActivityComponent } from '../components/treasury-activity/treasury-activity.component';
import { HelpSectionComponent } from '../components/help-section/help-section.component';
import { PaymentCardsComponent } from '../components/payment-cards/payment-cards.component';
import { ServicesPaymentComponent } from '../components/services-payment/services-payment.component';
import { StoreDataService } from './store-data.service';
import { firstValueFrom } from 'rxjs';
import { InvoiceComponent } from '../components/invoice/invoice.component';
import { InternationalOperationsComponent } from '../components/international-operations/international-operations.component';
import { FeatureFlagsService } from './modules.service';
import { PaymentLinkComponent } from '../components/payment-link/payment-link.component';
import { CostsComponent } from '../components/costs/costs.component';
import { QrComponent } from '../components/qr/qr.component';

@Injectable({
  providedIn: 'root',
})
export class DynamicRoutesService {
  // private static featureFlags = {
  //   international_account: false,
  //   basic_modules: false,
  //   balance_investments_module: false,
  //   services_payment: false,
  //   insurance_module: false,
  // };

  constructor(
    private storeService: StoreDataService,
    private featureFlagsService: FeatureFlagsService
  ) {}

  getAppRoutes(): Routes {
    // console.log(
    //   '🛠 Generating dynamic routes with feature flags:',
    //   DynamicRoutesService.featureFlags
    // );
    const featureFlags = this.featureFlagsService.getFeatureFlags();
    console.log(
      '🛠 Generating dynamic routes with feature flags:',
      featureFlags
    );

    const routes: Routes = [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      {
        path: 'home',
        loadChildren: () =>
          featureFlags.international_account
            ? import(
                '../pages/international-account-dashboard/international-account.module'
              ).then((m) => m.InternationalAccountModule)
            : import('../pages/dashboard/dashboard.module').then(
                (m) => m.DashboardModule
              ),
      },
      {
        path: 'help',
        component: HelpSectionComponent,
      },
      {
        path: 'account-info',
        loadChildren: () =>
          import('../pages/account-info/account-info.module').then(
            (m) => m.AccountInfoModule
          ),
        pathMatch: 'full',
      },
    ];

    if (featureFlags.basic_modules) {
      routes.push(
        { path: 'activity', component: TreasuryActivityComponent },
        { path: 'cards', component: PaymentCardsComponent }
      );
    }

    if (featureFlags.balance_investments_module) {
      routes.push({ path: 'investments', component: InvestmentComponent });
    }

    if (featureFlags.international_account) {
      routes.push(
        { path: 'operations', component: InternationalOperationsComponent },
        { path: 'invoice', component: InvoiceComponent }
      );
    }

    if (featureFlags.services_payment) {
      routes.push({
        path: 'services-payment',
        component: ServicesPaymentComponent,
      });
    }
    if (featureFlags.insurance_module) {
      routes.push({
        path: 'insurance',
        loadChildren: () =>
          import(
            '../pages/insurance-dashboard/insurance-dashboard.module'
          ).then((m) => m.InsuranceDashboardModule),
        pathMatch: 'full',
      });
    }
    if (featureFlags.payment_link_module) {
      routes.push({
        path: 'payment-link',
        component: PaymentLinkComponent,
      }, {
        path:'costs',
        component: CostsComponent,
      });
    }

      if (featureFlags.qr_module) {
      routes.push({
        path: 'qr',
        component: QrComponent,
      });
    }

    console.log('🚀 Final routes:', routes);
    return routes;
  }
}
