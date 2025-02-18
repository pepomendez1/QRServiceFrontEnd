import { Component, EventEmitter, Output, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { MatSidenav } from '@angular/material/sidenav';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ThemeService } from 'src/app/services/layout/theme-service';
import { SidenavService } from '../sidenav/sidenav.service';
import { SidenavItem } from '../sidenav/sidenav-item.interface';
import { StoreDataService } from 'src/app/services/store-data.service';
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
  toggleModeEnabled: boolean = false; // To store the value of toggle_mode_enable
  defaultOption: string = 'left'; // Default option for the slider button

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private storeService: StoreDataService,
    private themeService: ThemeService,
    private sidenavService: SidenavService
  ) {}

  ngOnInit(): void {
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
      this.toggleModeEnabled = initConfig?.toggle_mode_enable || false;

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
    this.router.navigate(['/app/account-info']);
  }

  goToHelp(): void {
    this.router.navigate(['app/help']);
  }
}
