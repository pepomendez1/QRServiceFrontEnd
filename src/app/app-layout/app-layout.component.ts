import {
  Component,
  ViewChild,
  AfterViewInit,
  ViewContainerRef,
  Type,
  ChangeDetectorRef,
} from '@angular/core';
import { ThemeService } from '../services/layout/theme-service';
import { MatSidenav } from '@angular/material/sidenav';
import { BalanceComponent } from '../components/treasury/balance/balance.component';
import { SidePanelService } from '@fe-treasury/shared/side-panel/side-panel.service';
import { TransferComponent } from '../components/treasury/transfer/transfer.component';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { RefreshService } from '@fe-treasury/shared/refresh-service/refresh-service';
import { Router } from '@angular/router';
import { OnboardingService } from '../services/onboarding.service';
import { SidenavItem } from './sidenav/sidenav-item.interface';
import { SidenavService } from './sidenav/sidenav.service';
import { SvgLibraryService } from '../services/svg-library.service';
import { StoreDataService } from '../services/store-data.service';
import { map } from 'rxjs/operators';
import { CookieService } from '../services/cookie.service';
import { SafeHtml } from '@angular/platform-browser';
import { AuthService } from '../services/auth.service';
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
  sidenavItems$!: Observable<SidenavItem[]>; // Initialize without assignment
  logoUrl: SafeHtml | null = null;
  isPaddingZero = false;
  disableClose = false;
  public userEmail: string | null = null;
  isMobile = false; // Property to track if the device is mobile
  accountName$: Observable<string | null> | undefined;
  constructor(
    private authService: AuthService, // injecting AuthService to manage user authentication  // injecting AuthService to manage user authentication
    private svgLibrary: SvgLibraryService, // injecting SvgLibraryService to load SVGs dynamically  // injecting StoreDataService to get the store configuration
    private storeService: StoreDataService,
    public sidePanelService: SidePanelService,
    private onboardingService: OnboardingService,
    private readonly sidenavService: SidenavService,
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
    this.logoUrl = this.svgLibrary.getLogo();

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
  openBalance() {
    this.sidePanelService.open(BalanceComponent, 'Balance');
  }
  openTransfer() {
    this.sidePanelService.open(TransferComponent, 'Transferencia');
  }
  // Method to close the side panel
  closeSidePanel() {
    this.sidePanelService.close();
  }
}
