import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

import { MatSidenav } from '@angular/material/sidenav';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ThemeService } from 'src/app/services/layout/theme-service';
import { SidenavService } from '../sidenav/sidenav.service';
import { SidenavItem } from '../sidenav/sidenav-item.interface';
import { StoreDataService } from 'src/app/services/store-data.service';
import { FeatureFlagsService } from 'src/app/services/modules.service';
import { FocusMonitor } from '@angular/cdk/a11y';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  @Input() sidenav!: MatSidenav; // Input to accept the sidenav reference
  decodedToken: any = null;
  currentRouteName: string = ''; // This will store the name of the current route
  sideNavigation$!: Observable<boolean>;
  topNavigation$!: Observable<boolean>;
  toggleThemeEnabled: boolean = false; // To store the value of toggle_mode_enable
  toggleModuleEnabled: boolean = false; // To store the value of toggle_mode_enable
  defaultOption: string = 'left'; // Default option for the slider button
  featureFlags: any = null;
  selectedModule: any;
  isSidenavClosed = true; // Track whether the sidenav is closed
  isIframe: boolean = false;
  constructor(
    private featureFlagsService: FeatureFlagsService,
    private router: Router,
    private storeService: StoreDataService,
    private storeDataService: StoreDataService,
    private themeService: ThemeService,
    private sidenavService: SidenavService
  ) {}

  ngOnInit(): void {
    this.selectedModule = this.featureFlagsService.getFeatureFlags()
      .international_account
      ? 'international_account'
      : 'basic_modules';
    console.log('selected module for dropdon----', this.selectedModule);
    this.isIframe = this.storeDataService.checkIframe();
    // Listen for route changes
    this.sideNavigation$ = this.themeService.config$.pipe(
      map((config) => config.navigation === 'side')
    );
    this.topNavigation$ = this.themeService.config$.pipe(
      map((config) => config.navigation === 'top')
    );

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd) // Only listen to navigation end events
      )
      .subscribe(() => {
        this.updateRouteName();
      });

    // Initialize route name when component loads
    this.updateRouteName();
    this.storeService.getStore().subscribe((config) => {
      const initConfig = config.init_config;

      this.toggleThemeEnabled =
        initConfig?.toggle_mode_enable === 'true' ? true : false;
      this.toggleModuleEnabled =
        initConfig?.select_module_enable === 'true' ? true : false;
      const defaultMode = initConfig?.default_mode || 'light'; // Default to light if not provided
      this.defaultOption = defaultMode === 'dark' ? 'right' : 'left'; // Moon for dark, Sun for light
    });
  }

  toggleTheme(option: string): void {
    // Update the theme based on the selected option
    const theme = option === 'left' ? 'default' : 'dark';
    this.themeService.setStyle(theme);
  }
  updateRouteName() {
    // Get the current URL
    const currentRoute = this.router.url;

    // Subscribe to items$ from sidenavService to get the list of menu items
    this.sidenavService.items$.subscribe((items: SidenavItem[]) => {
      const matchingItem = items.find(
        (item) => item.routeOrFunction === currentRoute
      );

      // Update the currentRouteName with the name of the matched route
      this.currentRouteName = matchingItem
        ? matchingItem.name || 'Ruta desconocida'
        : 'Ruta desconocida';
    });
  }
  goToAccountInfo(): void {
    this.router.navigate(['app/account-info']);
  }

  goToHelp(): void {
    this.router.navigate(['app/help']);
  }

  onModuleChange(event: {
    value: 'basic_modules' | 'international_account';
  }): void {
    const selectedModule = event.value;

    // Update feature flags based on the selected module
    if (selectedModule === 'international_account') {
      this.featureFlagsService.updateFeatureFlags({
        international_account: true,
      });
    } else {
      this.featureFlagsService.updateFeatureFlags({
        basic_modules: true,
      });
    }
  }
}
