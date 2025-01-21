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
import { forkJoin } from 'rxjs';
import { error } from 'console';
import { ThemeService } from './services/layout/theme-service';

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
      storeDataService.loadStore().then(() => {
        storeDataService.getStore().subscribe({
          next: (store) => {
            const primaryColor = store.init_config?.primary_color || '#4876DB';

            // Check contrast and determine dark mode
            const isDarkMode =
              themeService.checkContrast(primaryColor, '#FFFFFF') < 4.2;

            // Set strokeColor based on dark mode
            const strokeColor = store.init_config?.image_stroke_color
              ? store.init_config.image_stroke_color
              : isDarkMode
              ? '#EBEBEB' // Light stroke color for dark mode
              : '#4D4D4D'; // Default stroke color for light mode

            // Dynamically generate logo
            const logoUrl = store.init_config?.primary_logo_url
              ? store.init_config.primary_logo_url
              : themeService.getDynamicLogo(isDarkMode, primaryColor);

            console.log('Primary color:', primaryColor);
            console.log('Stroke color:', strokeColor);
            console.log('Logo URL:', logoUrl);

            // Custom image URLs
            const customUrls = SVG_NAMES.reduce((acc, name) => {
              const customUrl = store.init_config?.[name];
              if (typeof customUrl === 'string') {
                acc[name] = customUrl;
              }
              return acc;
            }, {} as { [key: string]: string });

            console.log('Custom SVG URLs:', customUrls);

            // Preload default and custom SVGs
            const logoPreload$ =
              logoUrl.startsWith('<svg') || logoUrl.startsWith('<?xml') // Detect inline SVG
                ? svgLibrary.preloadInlineSvg(logoUrl) // Handle inline SVGs
                : svgLibrary.preloadLogo(logoUrl); // Handle remote URLs

            // Preload default and custom SVGs
            forkJoin([
              svgLibrary.preloadSvgs(
                SVG_NAMES,
                primaryColor,
                strokeColor,
                customUrls
              ),
              logoPreload$, // Preload the logo (URL or inline SVG)
            ]).subscribe({
              next: () => {
                console.log('SVGs and logo preloaded successfully.');
                resolve();
              },
              error: (err) => {
                console.error('Error during SVG preloading:', err);
                reject(err);
              },
            });
          },
          error: (err) => {
            console.error('Error loading store data:', err);
            reject(err);
          },
        });
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
    HttpClientModule,

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
