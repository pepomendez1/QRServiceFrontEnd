import { NgModule, APP_INITIALIZER } from '@angular/core';
import { RouterModule, Routes, Router } from '@angular/router';
import { AppLayoutComponent } from './app-layout/app-layout.component';
import { authGuard } from './services/route-guards/auth.guard';
import { iframeGuard } from './services/route-guards/iframe.guard';
import { DynamicRoutesService } from './services/dynamic-routes';
import { VoucherComponent } from './components/treasury/voucher/voucher.component';
import { OnHoldScreenComponent } from '@fe-treasury/shared/on-hold-screen/on-hold-screen.component';
import { pinCodeGuard } from './services/route-guards/pin-code.guard';
import { appGuard } from './services/route-guards/app.guard';
import { PaymentCardsComponent } from './components/payment-cards/payment-cards.component';
import { InvestmentComponent } from './components/investment/investment.component';
import { HelpSectionComponent } from './components/help-section/help-section.component';
import { ServicesPaymentComponent } from './components/services-payment/services-payment.component';
import { TreasuryActivityComponent } from './components/treasury-activity/treasury-activity.component';
import { FeatureFlagsService } from './services/modules.service';

//  Define initial static routes
const routes: Routes = [
  {
    path: 'voucher',
    component: VoucherComponent,
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./pages/authentication/auth/auth.module').then(
        (m) => m.AuthModule
      ),
  },
  {
    path: 'pin-code',
    canActivate: [pinCodeGuard],
    loadChildren: () =>
      import('./pages/pin-code/pin-code.module').then((m) => m.PinCodeModule),
  },
  {
    path: 'onboarding',
    canActivate: [appGuard],
    loadChildren: () =>
      import('./pages/onboarding/onboarding.module').then(
        (m) => m.OnboardingModule
      ),
  },
  {
    path: 'on-hold',
    canActivate: [appGuard],
    component: OnHoldScreenComponent,
  },
  {
    path: '',
    redirectTo: 'app',
    pathMatch: 'full',
  },
  {
    path: 'app',
    component: AppLayoutComponent,
    canActivate: [appGuard],
    children: [], // Initially empty, dynamically filled
  },
  {
    path: 'i',
    component: AppLayoutComponent, // This will load the main app layout after onboarding is completed
    canActivate: [iframeGuard],
    children: [
      {
        path: '', // Empty path for default child route
        redirectTo: 'i/home', // Redirect to 'home' inside the 'app' route
        pathMatch: 'full',
      },
      {
        path: 'home',
        loadChildren: () =>
          import('./pages/dashboard/dashboard.module').then(
            (m) => m.DashboardModule
          ),
        pathMatch: 'full',
      },
      {
        path: 'multiple-payments',
        loadChildren: () =>
          import('./pages/dashboard/dashboard.module').then(
            (m) => m.DashboardModule
          ),
      },
      {
        path: 'pin-code',
        loadChildren: () =>
          import('./pages/pin-code/pin-code.module').then(
            (m) => m.PinCodeModule
          ),
      },
      {
        path: 'investments',
        component: InvestmentComponent,
      },
      {
        path: 'cards',
        component: PaymentCardsComponent,
      },
      {
        path: 'activity',
        component: TreasuryActivityComponent,
      },
      {
        path: 'transfer',
        component: InvestmentComponent,
      },
      {
        path: 'lending',
        loadChildren: () =>
          import('./pages/dashboard/dashboard.module').then(
            (m) => m.DashboardModule
          ),
      },
    ],
  },
  { path: '**', redirectTo: '' }, // Catch-all route
];

// APP_INITIALIZER to Load Feature Flags and Routes Before Routing
export function initializeApp(
  featureFlagsService: FeatureFlagsService,
  dynamicRoutesService: DynamicRoutesService,
  router: Router
): () => Promise<void> {
  return async () => {
    await featureFlagsService.loadFeatureFlags(); // Load feature flags
    const appChildren = dynamicRoutesService.getAppRoutes(); // Get dynamic routes
    console.log('🔄 Updating routes with:', appChildren);

    // Update the `app` children dynamically
    router.resetConfig(
      routes.map((r) =>
        r.path === 'app' ? { ...r, children: appChildren } : r
      )
    );
  };
}

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [FeatureFlagsService, DynamicRoutesService, Router],
      multi: true,
    },
  ],
})
export class AppRoutingModule {}
