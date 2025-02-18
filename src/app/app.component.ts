import { Component, Inject, Renderer2, OnInit, OnDestroy } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ThemeService } from './services/layout/theme-service';
import { SidenavService } from './app-layout/sidenav/sidenav.service';
import { SidenavItem } from './app-layout/sidenav/sidenav-item.interface';
import { filter, firstValueFrom, Subscription } from 'rxjs';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Platform } from '@angular/cdk/platform';
import { AuthService } from './services/auth.service';
import { Title } from '@angular/platform-browser';
import { SidePanelService } from '@fe-treasury/shared/side-panel/side-panel.service';
import { Clipboard } from '@angular/cdk/clipboard';
import { SessionManagementService } from './services/session.service';
import { StoreDataService } from './services/store-data.service'; // ✅ Import StoreDataService
import { FeatureFlagsService } from './services/modules.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  private featureFlagsSubscription!: Subscription;
  private routeSubscription!: Subscription;

  private currentRoute: string = '';
  title = 'fe-treasury';
  isInIframe = false; // Determina si estamos en un iframe
  isLoading = false; // Bandera para manejar el estado de carga
  private focusListener: any; // Reference to the focus event listener

  private featureFlags = {
    international_account: false,
    basic_modules: false,
    balance_investments_module: false,
    services_payment: false,
    insurance_module: false,
  };

  constructor(
    private sessionManagementService: SessionManagementService,
    private sidePanelService: SidePanelService,
    private clipboard: Clipboard,
    private titleService: Title,
    private themeService: ThemeService,
    @Inject(DOCUMENT) private document: Document,
    private route: ActivatedRoute,
    private renderer: Renderer2,
    private platform: Platform,
    private sidenavService: SidenavService,
    private featureFlagsService: FeatureFlagsService,
    private authService: AuthService, // Inyecta AuthService
    private router: Router, // Inyectar Router para manejar redirecciones
    private storeDataService: StoreDataService
  ) {
    this.titleService.setTitle(''); //initialize page title with empty string
    this.isInIframe = window.self !== window.top; // Verificar si estamos en un iframe
    // Listen for focus events
    // window.addEventListener('focus', this.handleFocusEvent.bind(this));
    // Tema dinámico basado en queryParams
    this.route.queryParamMap
      .pipe(filter((queryParamMap) => queryParamMap.has('style')))
      .subscribe((queryParamMap) => {
        const style = queryParamMap.get('style') ?? 'default'; // Proporcionar 'default' como respaldo
        this.themeService.setStyle(style as 'default' | 'dark');
      });

    // Actualizar el tema
    this.themeService.theme$.subscribe((theme) => {
      if (theme[0]) {
        this.renderer.removeClass(this.document.body, theme[0]);
      }
      this.renderer.addClass(this.document.body, theme[1]);
    });

    // Agregar clase si está en plataforma Blink
    if (this.platform.BLINK) {
      this.renderer.addClass(this.document.body, 'is-blink');
    }
    this.isInIframe
      ? this.themeService.setNavigation('top')
      : this.themeService.setNavigation('side');
  }

  private handleFocusEvent(): void {
    console.log('Window refocused.');
    console.log('clousure origin: ', this.sidePanelService.getClosureOrigin());
    // Check if the last side panel closure was due to a timeout
    if (this.sidePanelService.getClosureOrigin() === 'timeout') {
      console.log('Window refocused after timeout. Clearing clipboard...');
      this.clearClipboard();
      setTimeout(() => {
        // Reset the closure origin and remove the listener
        this.sidePanelService.setClosureOrigin('user');
        this.removeFocusListener();
      }, 100);
    } else {
      console.log(
        'Focus event ignored because the last closure was not a timeout.'
      );
    }
  }

  private clearClipboard(): void {
    navigator.permissions
      .query({ name: 'clipboard-write' as PermissionName })
      .then((result) => {
        if (result.state === 'granted' || result.state === 'prompt') {
          // Permission is available, clear the clipboard
          const placeholder = ' ';
          this.clipboard.copy(placeholder);
          console.log('Clipboard cleared using Angular CDK.');

          navigator.clipboard
            .writeText(placeholder)
            .then(() => {
              console.log('Clipboard successfully cleared using native API.');
            })
            .catch((err) => {
              console.error('Error clearing clipboard with native API:', err);
            });
        } else {
          // Permission denied or blocked
          console.warn(
            'Clipboard clearing failed due to permissions. Skipping...'
          );
        }
      })
      .catch((err) => {
        console.error('Error checking clipboard permissions:', err);
      });
  }
  logoutUser(): void {
    this.authService.logoutUser();
  }
  async ngOnInit(): Promise<void> {
    // Subscribe to feature flag changes
    this.featureFlagsSubscription =
      this.featureFlagsService.featureFlags$.subscribe(() => {
        this.buildNavigationMenu(); // Rebuild menu when flags change

        this.router
          .navigateByUrl('/app/home', { skipLocationChange: true })
          .then(() => {
            this.router.navigate([this.router.url]); // Force a navigation to the same route
          });
      });

    this.buildNavigationMenu(); // ✅ Dynamically build the menu

    // Monitor route changes and activate/deactivate session monitoring
    this.routeSubscription = this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd
        ) // Narrow type to NavigationEnd
      )
      .subscribe((event: NavigationEnd) => {
        const resolvedUrl = event.urlAfterRedirects; // Use the final resolved URL
        console.log(`Route changed to: ${resolvedUrl}`);

        if (resolvedUrl.startsWith('/app')) {
          // Start monitoring session for app routes
          this.sessionManagementService.startMonitoring();
        } else {
          // Stop monitoring session for non-app routes
          this.sessionManagementService.stopMonitoring();
        }
      });

    this.sidePanelService.closureOriginChanged.subscribe((origin) => {
      if (origin === 'timeout') {
        console.log(
          'Side panel closed due to timeout. Adding focus listener...'
        );
        this.addFocusListener();
      }
    });

    // Solo si estamos en un iframe, pedimos el token al parent
    if (this.isInIframe) {
      this.isLoading = true; // Activar estado de carga
      this.authService.getTokenFromParent().subscribe(
        (authData) => {
          if (authData && authData.access_token) {
            this.isLoading = false; // Token recibido, quitar estado de carga
          }
        },
        (error) => {
          console.error('Error al recibir el token del parent:', error);
          //  this.router.navigate(['/auth/login']); // Redirigir a login si hay error
        }
      );
    }
    this.themeService.updateHeadContent();
  }

  private buildNavigationMenu(): void {
    const featureFlags = this.featureFlagsService.getFeatureFlags();
    const menuItems: SidenavItem[] = [
      {
        name: this.featureFlags.international_account ? 'Mi cuenta' : 'Inicio',
        routeOrFunction: '/app/home',
        icon: 'dashboard',
        position: 1,
        navigation: true,
        enabled: true,
      },
      ...(featureFlags.basic_modules
        ? [
            {
              name: 'Movimientos',
              routeOrFunction: '/app/activity',
              icon: 'list_alt',
              position: 2,
              navigation: true,
              enabled: true,
            },
            {
              name: 'Tarjetas',
              routeOrFunction: '/app/cards',
              icon: 'credit_card',
              position: 3,
              navigation: true,
              enabled: true,
            },
          ]
        : []),
      ...(featureFlags.balance_investments_module
        ? [
            {
              name: 'Inversiones',
              routeOrFunction: '/app/investments',
              icon: 'insert_chart',
              position: 4,
              navigation: true,
              enabled: true,
            },
          ]
        : []),
      ...(featureFlags.services_payment
        ? [
            {
              name: 'Pago de Servicios',
              routeOrFunction: '/app/services-payment',
              icon: 'lightbulb',
              position: 5,
              navigation: true,
              enabled: true,
            },
          ]
        : []),
      ...(featureFlags.insurance_module
        ? [
            {
              name: 'Seguros',
              routeOrFunction: '/app/insurance',
              icon: 'verified_user',
              position: 6,
              navigation: true,
              enabled: true,
            },
          ]
        : []),
      ...(featureFlags.international_account
        ? [
            {
              name: 'Facturas',
              routeOrFunction: '/app/invoice',
              icon: 'description',
              position: 2,
              navigation: true,
              enabled: true,
            },
            {
              name: 'Operaciones',
              routeOrFunction: '/app/operations',
              icon: 'list_alt',
              position: 3,
              navigation: true,
              enabled: true,
            },
          ]
        : []),
      {
        name: 'Cerrar sesión', // Always enabled
        action: () => this.logoutUser(), // ✅ Explicitly use an arrow function
        enabled: true,
        position: 7,
        navigation: true,
        icon: 'logout',
      },
      {
        name: 'Mi perfil', // Always enabled
        routeOrFunction: '/app/account-info',
        icon: 'groups',
        position: 8,
        navigation: false,
        enabled: false,
      },
      {
        name: 'Ayuda', // Always enabled
        routeOrFunction: '/app/help',
        icon: 'groups',
        position: 9,
        navigation: false,
        enabled: false,
      },
    ];
    this.sidenavService.addItems(menuItems);
  }

  ngOnDestroy(): void {
    // Unsubscribe to avoid memory leaks
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
    if (this.featureFlagsSubscription) {
      this.featureFlagsSubscription.unsubscribe();
    }
    this.sessionManagementService.stopMonitoring();
  }

  private addFocusListener(): void {
    if (this.focusListener) {
      console.log('Focus listener already added. Skipping...');
      return;
    }

    this.focusListener = this.handleFocusEvent.bind(this);
    window.addEventListener('focus', this.focusListener);
    console.log('Focus listener added.');
  }

  private removeFocusListener(): void {
    if (this.focusListener) {
      window.removeEventListener('focus', this.focusListener);
      this.focusListener = null;
      console.log('Focus listener removed.');
    }
  }
}
