import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { SidenavService } from './sidenav.service';
import { ThemeService } from 'src/app/services/layout/theme-service';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
})
export class SidenavComponent implements OnInit, OnDestroy {
  menuItems = [
    {
      name: 'Inicio',
      routeOrFunction: '/app/home',
      icon: 'dashboard',
      position: 1,
      enabled: true,
    },
    {
      name: 'Pagos múltiples',
      routeOrFunction: '/app/multiple-payments',
      icon: 'groups',
      position: 2,
      enabled: false,
    },
    {
      name: 'Inversiones',
      routeOrFunction: '/app/investments',
      icon: 'paid',
      position: 3,
      enabled: true,
    },
    {
      name: 'Tarjetas',
      routeOrFunction: '/app/cards',
      icon: 'credit_card',
      position: 4,
      enabled: true,
    },
    {
      name: 'Préstamos',
      routeOrFunction: '/app/lending',
      icon: 'approval_delegation',
      position: 5,
      enabled: false,
    },
  ];

  constructor(
    private sidenavService: SidenavService,
    private themeService: ThemeService
  ) {}

  ngOnDestroy() {}

  toggleCollapsed() {
    this.sidenavService.toggleCollapsed();
  }

  ngOnInit() {}
}
