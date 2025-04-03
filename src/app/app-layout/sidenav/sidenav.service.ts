import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { SidenavItem } from './sidenav-item.interface';
import { MediaObserver } from '@angular/flex-layout';

@Injectable({
  providedIn: 'root',
})
export class SidenavService {
  private _items = new BehaviorSubject<SidenavItem[]>([]);

  items$ = this._items.asObservable();

  get items(): SidenavItem[] {
    return this._items.getValue();
  }

  set items(items: SidenavItem[]) {
    this._items.next(items);
  }

  /**
   * Currently Open
   * @type {BehaviorSubject<SidenavItem[]>}
   * @private
   */
  private _currentlyOpen = new BehaviorSubject<SidenavItem[]>([]);

  currentlyOpen$ = this._currentlyOpen.asObservable();
  get currentlyOpen(): SidenavItem[] {
    return this._currentlyOpen.getValue();
  }

  set currentlyOpen(currentlyOpen: SidenavItem[]) {
    this._currentlyOpen.next(currentlyOpen);
  }

  private openSource = new BehaviorSubject<boolean>(false);
  open$ = this.openSource.asObservable();

  private _collapsedSubject = new BehaviorSubject<boolean>(false);

  constructor(private router: Router, private mediaObserver: MediaObserver) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.close(); // Close sidenav on navigation end
      });
  }
  open(): void {
    this.openSource.next(true);
  }

  close(): void {
    this.openSource.next(false);
  }

  toggle(): void {
    this.openSource.next(!this.openSource.getValue());
  }

  toggleCollapsed() {
    this._collapsedSubject.next(!this._collapsedSubject.getValue());
  }
  addItems(items: SidenavItem[]): void {
    // Clear existing items before adding new ones
    this._items.next([]);

    // Add new items
    items.forEach((item) => this.addItem(item));
  }

  addItem(item: SidenavItem) {
    // Check if the item already exists in the list
    const foundIndex = this.items.findIndex(
      (existingItem) => existingItem.routeOrFunction === item.routeOrFunction
    );
    if (foundIndex === -1) {
      // Add the item if it doesn't exist
      this.items = [...this.items, item];
      // Sort items by position
      this.items = this.items.sort(
        (a, b) => (a.position || 0) - (b.position || 0)
      );
    }
  }
}
