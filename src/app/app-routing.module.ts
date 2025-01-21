import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TreasuryActivityComponent } from './components/treasury-activity/treasury-activity.component';
import { MainComponent } from './components/main/main.component';
import { AppLayoutComponent } from './app-layout/app-layout.component';
import { authGuard } from './services/route-guards/auth.guard';
import { iframeGuard } from './services/route-guards/iframe.guard';
import { PaymentCardsComponent } from './components/payment-cards/payment-cards.component';
import { VoucherComponent } from './components/treasury/voucher/voucher.component';
import { InvestmentComponent } from './components/investment/investment.component';
import { appGuard } from './services/route-guards/app.guard';
import { pinCodeGuard } from './services/route-guards/pin-code.guard';
import { HelpSectionComponent } from './components/help-section/help-section.component';
import { OnHoldScreenComponent } from '@fe-treasury/shared/on-hold-screen/on-hold-screen.component';
import { ServicesPaymentComponent } from './components/services-payment/services-payment.component';
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
    pathMatch: 'full', // Redirect the root path ('/') to '/app'
  },
  {
    path: 'app',
    component: AppLayoutComponent, // This will load the main app layout after onboarding is completed
    canActivate: [appGuard],
    children: [
      {
        path: '', // Empty path for default child route
        redirectTo: 'home', // Redirect to 'home' inside the 'app' route
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
        path: 'investments',
        component: InvestmentComponent,
      },
      // {
      //   path: 'services-payment',
      //   component: ServicesPaymentComponent,
      // },
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
        path: 'help',
        component: HelpSectionComponent,
      },
      {
        path: 'lending',
        loadChildren: () =>
          import('./pages/dashboard/dashboard.module').then(
            (m) => m.DashboardModule
          ),
      },
      {
        path: 'account-info',
        loadChildren: () =>
          import('./pages/account-info/account-info.module').then(
            (m) => m.AccountInfoModule
          ),
        pathMatch: 'full',
      },
    ],
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

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
