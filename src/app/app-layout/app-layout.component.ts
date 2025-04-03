import {
  Component,
  ViewChild,
  AfterViewInit,
  ViewContainerRef,
  ChangeDetectorRef,
} from '@angular/core';
import { ThemeService } from '../services/layout/theme-service';
import { MatSidenav } from '@angular/material/sidenav';
import { SidePanelService } from '@fe-treasury/shared/side-panel/side-panel.service';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { OnboardingService } from '../services/onboarding.service';
import { SidenavItem } from './sidenav/sidenav-item.interface';
import { SidenavService } from './sidenav/sidenav.service';
import { SvgLibraryService } from '../services/svg-library.service';
import { StoreDataService } from '../services/store-data.service';
import { map } from 'rxjs/operators';
import { SafeHtml } from '@angular/platform-browser';
import { AuthService } from '../services/auth.service';
import { SessionManagementService } from '../services/session.service';
@Component({
  selector: 'app-layout',
  templateUrl: './app-layout.component.html',
  styleUrls: ['./app-layout.component.scss'],
})
export class AppLayoutComponent implements AfterViewInit {
  @ViewChild(MatSidenav) menuenav!: MatSidenav;
  @ViewChild('sidePanel') sidenav!: MatSidenav;
  @ViewChild('dynamicComponentContainer', { read: ViewContainerRef })
  container!: ViewContainerRef;

  sideNavigation$!: Observable<boolean>;
  topNavigation$!: Observable<boolean>;
  toggleInactivityMonitor$!: Observable<boolean>;
  inactivityMonitorStatus: boolean = false;
  sidenavItems$!: Observable<SidenavItem[]>; // Initialize without assignment
  logoUrl: SafeHtml | null = null;
  isPaddingZero = false;
  disableClose = false;
  isIframe = false; // Property to track if the user is in an iframe
  public userEmail: string | null = null;
  isMobile = false; // Property to track if the device is mobile

  accountName$: Observable<string | null> | undefined;
  constructor(
    private authService: AuthService, // injecting AuthService to manage user authentication  // injecting AuthService to manage user authentication
    private svgLibrary: SvgLibraryService, // injecting SvgLibraryService to load SVGs dynamically  // injecting StoreDataService to get the store configuration
    private storeService: StoreDataService,
    public sidePanelService: SidePanelService,
    private onboardingService: OnboardingService,
    private storeDataService: StoreDataService,
    private readonly sidenavService: SidenavService,
    private sessionManagementService: SessionManagementService,
    private observer: BreakpointObserver,
    private themeService: ThemeService, // injecting ThemeService to get the navigation configuration  // injecting ThemeService to get the navigation configuration  // injecting SidePanelService to open and close the side panel  // injecting SidePanelService to open and close the side panel
    private cdr: ChangeDetectorRef // Inject ChangeDetectorRef
  ) {}
  logoutUser(): void {
    this.authService.logoutUser();
  }
  ngAfterViewInit() {
    this.sidePanelService.setSidenav(this.sidenav);
    this.sidePanelService.setViewContainerRef(this.container);
  }
  ngOnInit() {
    // Get the value of toggle_inactivity_monitor from the store
    this.toggleInactivityMonitor$ = this.storeDataService
      .getStore()
      .pipe(
        map(
          (storeData) =>
            storeData.init_config?.toggle_inactivity_monitor === 'true'
        )
      );

    this.storeDataService.getStore().subscribe((storeData) => {
      // Set the toggle state based on inactivity_monitor_status
      // Default to true if the value is null, undefined, or an empty string
      this.inactivityMonitorStatus =
        storeData.init_config?.inactivity_monitor_status !== 'false'; // Defaults to true if not 'false'
    });

    this.isIframe = this.storeService.checkIframe();
    this.svgLibrary.currentLogo$.subscribe((logo) => {
      this.logoUrl = logo;
    });
    this.accountName$ = this.onboardingService.getFirstName();
    this.sidenavItems$ = this.sidenavService.items$;
    this.sideNavigation$ = this.themeService.config$.pipe(
      map((config) => config.navigation === 'side')
    );
    this.topNavigation$ = this.themeService.config$.pipe(
      map((config) => config.navigation === 'top')
    );
    this.observer.observe(['(max-width: 800px)']).subscribe((screenSize) => {
      this.isMobile = screenSize.matches;
    });

    // Close sidenav on navigation end
    this.sidenavService.open$.subscribe((isOpen) => {
      if (!isOpen && this.menuenav && !this.isIframe && this.isMobile) {
        this.menuenav.close();
      }
    });
    // Subscribe to changes in the padding flag from the service
    this.sidePanelService.paddingZeroChanged.subscribe((isZero: boolean) => {
      this.isPaddingZero = isZero;
      this.cdr.detectChanges(); // Ensure Angular detects the change
    });
    // Subscribe to disableClose change events
    this.sidePanelService.disableCloseChanged.subscribe((isDisabled) => {
      this.disableClose = isDisabled;
      this.cdr.detectChanges(); // Ensure Angular detects the change
    });
  }

  // Handle toggle change
  onToggleInactivityMonitor(): void {
    // Update the monitor state based on the toggle
    if (this.inactivityMonitorStatus) {
      this.sessionManagementService.startInactivityMonitoring();
    } else {
      this.sessionManagementService.stopInactivityMonitoring();
    }
  }
  // Method to close the side panel
  closeSidePanel() {
    this.sidePanelService.close();
  }
}
