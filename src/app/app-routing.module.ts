import { NgModule, APP_INITIALIZER } from '@angular/core';
import { RouterModule, Routes, Router } from '@angular/router';
import { AppLayoutComponent } from './app-layout/app-layout.component';
import { DynamicRoutesService } from './services/dynamic-routes';
import { OnHoldScreenComponent } from '@fe-treasury/shared/on-hold-screen/on-hold-screen.component';
import { pinCodeGuard } from './services/route-guards/pin-code.guard';
import { appGuard } from './services/route-guards/app.guard';
import { InvalidTokenComponent } from './components/invalid-token/invalid-token.component';
import { FeatureFlagsService } from './services/modules.service';

//  Define initial static routes
const routes: Routes = [
  {
    path: 'invalid-token',
    canActivate: [appGuard],
    component: InvalidTokenComponent,
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
  { path: '**', redirectTo: '' }, // Catch-all route
];

// APP_INITIALIZER to Load Feature Flags and Routes Before Routing
export function initializeApp(
  featureFlagsService: FeatureFlagsService,
  dynamicRoutesService: DynamicRoutesService,
  router: Router
): () => Promise<void> {
  return async () => {
    console.log('⏳ Loading feature flags...');
    await featureFlagsService.loadFeatureFlags(); // Load feature flags
    console.log('🛠 Generating initial routes...');
    const appChildren = dynamicRoutesService.getAppRoutes(); // Get dynamic routes

    console.log('🔄 Updating routes with:', appChildren);
    // Update the `app` children dynamically
    router.resetConfig(
      routes.map((r) =>
        r.path === 'app' ? { ...r, children: appChildren } : r
      )
    );

    // Subscribe to feature flag changes
    featureFlagsService.featureFlags$.subscribe(() => {
      console.log('🛠 Feature flags changed, regenerating routes...');
      const updatedRoutes = dynamicRoutesService.getAppRoutes();
      router.resetConfig(
        routes.map((r) =>
          r.path === 'app' ? { ...r, children: updatedRoutes } : r
        )
      );
      console.log('🔄 Routes updated due to feature flag change');
    });
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
