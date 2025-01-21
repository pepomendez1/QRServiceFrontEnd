import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  Renderer2,
} from '@angular/core';
import { SidenavService } from '../sidenav/sidenav.service';
import { SidenavItem } from '../sidenav/sidenav-item.interface';
import { Router } from '@angular/router';
import { Observable } from 'rxjs'; // Import Observable from rxjs
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'], // Fix: changed `styleUrl` to `styleUrls`
})
export class NavigationComponent implements OnInit, AfterViewInit {
  sidenavItems$!: Observable<SidenavItem[]>; // Initialize without assignment
  currentlyOpen$!: Observable<SidenavItem[]>;

  constructor(
    private readonly sidenavService: SidenavService,
    @Inject(DOCUMENT) private readonly document: Document,
    private readonly cd: ChangeDetectorRef,
    private renderer: Renderer2,
    private readonly router: Router
  ) {}

  ngOnInit() {
    this.sidenavItems$ = this.sidenavService.items$;
    this.currentlyOpen$ = this.sidenavService.currentlyOpen$;
  }
  ngAfterViewInit(): void {}

  handleClick(item: SidenavItem) {
    this.router.navigate([item.routeOrFunction]);
  }
}
