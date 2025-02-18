import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, LOCALE_ID, APP_INITIALIZER } from '@angular/core';
import { MatFormFieldDefaultOptions } from '@angular/material/form-field';
import { PendingInterceptorModule } from '@fe-treasury/shared/loading-indicator/pending-interceptor.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AppLayoutModule } from './app-layout/app-layout.module';
import { MainModule } from './components/main/main.module';
import { registerLocaleData } from '@angular/common';
import { StoreDataService } from './services/store-data.service';
import { SvgLibraryService } from './services/svg-library.service';
import { DatePipe } from '@angular/common';
import { FormatNamePipe } from './pipes/format-name.pipe';
import { StatusPillPipe } from './pipes/status-pill.pipe';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import {
  MAT_SNACK_BAR_DEFAULT_OPTIONS,
  MatSnackBarConfig,
} from '@angular/material/snack-bar';

// Registrar la localización para 'es-ES'
// import localeEs from '@angular/common/locales/es';
// registerLocaleData(localeEs, 'es-ES');

// Registrar la localización para 'es-AR'
import localeEsAr from '@angular/common/locales/es-AR';
registerLocaleData(localeEsAr, 'es-AR');

// Third-party Modules
//import { QRCodeModule } from 'angularx-qrcode';
//import { ClipboardModule } from '@angular/cdk/clipboard';
import {
  CurrencyMaskModule,
  CURRENCY_MASK_CONFIG,
  CurrencyMaskConfig,
} from 'ng2-currency-mask';

// Custom Modules and Components
//import { TreasuryModule } from './components/treasury/treasury.module';
import { AuthModule } from './pages/authentication/auth/auth.module';
import { firstValueFrom, forkJoin } from 'rxjs';
import { error } from 'console';
import { ThemeService } from './services/layout/theme-service';
import { DynamicRoutesService } from './services/dynamic-routes';

const CustomCurrencyMaskConfig: CurrencyMaskConfig = {
  align: 'right',
  allowNegative: true,
  decimal: ',',
  precision: 2,
  prefix: '$ ',
  suffix: '',
  thousands: '.',
};

// SVGs to preload
const SVG_NAMES = [
  'card-order',
  'coding',
  'congrats',
  'enter-password',
  'finances',
  'insurance',
  'investment',
  'problem',
  'searching',
  'discount-cupons',
];

// Preload SVGs with the primary color from the store
export function preloadSvgLibrary(
  svgLibrary: SvgLibraryService,
  storeDataService: StoreDataService,
  themeService: ThemeService
): () => Promise<void> {
  return () =>
    new Promise<void>((resolve, reject) => {
      storeDataService.loadStore().then(async () => {
        try {
          // Fetch store data after it's loaded
          const store = await firstValueFrom(storeDataService.getStore());

          const primaryColor = store.init_config?.primary_color || '#4876DB';
          const defaultMode = store.init_config?.default_mode || 'light';
          const isDarkMode = defaultMode === 'dark';

          const strokeColor = store.init_config?.image_stroke_color
            ? store.init_config.image_stroke_color
            : isDarkMode
            ? '#EBEBEB'
            : '#4D4D4D';

          const logoUrl = store.init_config?.primary_logo_url
            ? store.init_config.primary_logo_url
            : themeService.getDynamicLogo(false, primaryColor);

          const contrastLogoUrl =
            store.init_config?.contrast_logo_url ||
            themeService.getDynamicLogo(true, primaryColor);

          console.log('Primary color:', primaryColor);
          console.log('Stroke color:', strokeColor);
          console.log('Primary Logo URL:', logoUrl);
          console.log('Contrast Logo URL:', contrastLogoUrl);

          const customUrls = Object.keys(store.init_config || {}).reduce(
            (acc, key) => {
              const value = store.init_config?.[key];
              if (typeof value === 'string') {
                acc[key] = value;
              }
              return acc;
            },
            {} as { [key: string]: string }
          );
          // **Preload SVGs and logos**
          forkJoin([
            svgLibrary.preloadSvgs(
              SVG_NAMES,
              primaryColor,
              strokeColor,
              customUrls
            ),
            svgLibrary.preloadLogos(logoUrl, contrastLogoUrl),
          ]).subscribe({
            next: () => {
              console.log('SVGs and logos preloaded successfully.');
              resolve();
            },
            error: (err) => {
              console.error('Error during SVG preloading:', err);
              reject(err);
            },
          });
        } catch (error) {
          console.error('Error loading store data:', error);
          reject(error);
        }
      });
    });
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    // Angular Core Module
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    AuthModule,
    BrowserAnimationsModule,

    // Core Modules
    AppRoutingModule,

    // Layout Module (Sidenav, Header, Content)
    AppLayoutModule,
    // Main routing module with onboarding
    MainModule,

    // Displays Loading Bar when a Route Request or HTTP Request is pending
    PendingInterceptorModule,

    //Third party modules
    CurrencyMaskModule,
  ],
  providers: [
    DatePipe,
    FormatNamePipe,
    ThemeService, // Register ThemeService
    SvgLibraryService, // Register SvgLibraryService
    StoreDataService, // Register StoreDataService
    { provide: CURRENCY_MASK_CONFIG, useValue: CustomCurrencyMaskConfig },
    { provide: LOCALE_ID, useValue: 'es-AR' }, // Configuración de localización
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: {
        appearance: 'outline',
      } as MatFormFieldDefaultOptions,
    },
    {
      provide: APP_INITIALIZER,
      useFactory: preloadSvgLibrary,
      deps: [SvgLibraryService, StoreDataService, ThemeService], // Add StoreDataService here
      multi: true,
    },

    {
      provide: MAT_SNACK_BAR_DEFAULT_OPTIONS,
      useValue: {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
      } as MatSnackBarConfig,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
function reject(arg0: Error) {
  throw new Error('Function not implemented.');
}
