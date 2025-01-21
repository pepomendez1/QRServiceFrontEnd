import {
  Injectable,
  ViewContainerRef,
  ComponentRef,
  Type,
} from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { BehaviorSubject } from 'rxjs'; // Import BehaviorSubject

@Injectable({
  providedIn: 'root',
})
export class SidePanelService {
  private isPaddingZeroSubject = new BehaviorSubject<boolean>(false); // Subject for padding state
  paddingZeroChanged = this.isPaddingZeroSubject.asObservable(); // Expose as Observable

  private isDisableCloseSubject = new BehaviorSubject<boolean>(false); // Subject for disableClose state
  disableCloseChanged = this.isDisableCloseSubject.asObservable(); // Expose as Observable

  private closureOriginSubject = new BehaviorSubject<'timeout' | 'user' | null>(
    null
  );

  closureOriginChanged = this.closureOriginSubject.asObservable();

  private sidenav: MatSidenav | null = null;
  private container: ViewContainerRef | null = null;
  private componentRef: ComponentRef<any> | null = null;
  private pendingOpen: {
    component: Type<any>;
    title?: string;
    data?: any;
    disableClose?: boolean;
  } | null = null;

  // Property to store the title
  private _title: string = '';
  get title(): string {
    return this._title;
  }

  setSidenav(sidenav: MatSidenav) {
    this.sidenav = sidenav;

    // Process any pending open request
    if (this.pendingOpen) {
      this.open(this.pendingOpen.component, this.pendingOpen.title);
      this.pendingOpen = null;
    }
  }

  setViewContainerRef(container: ViewContainerRef) {
    this.container = container;
  }
  togglePadding(isZero: boolean) {
    this.isPaddingZeroSubject.next(isZero); // Notify observers of the change
  }
  toggleDisableClose(isDisabled: boolean) {
    console.log('DISABLE CLOSE= ', isDisabled);
    this.isDisableCloseSubject.next(isDisabled); // Notify observers of the disableClose change
  }
  open(
    component: Type<any>,
    title?: string,
    data?: any,
    disableClose: boolean = false
  ): ComponentRef<any> | null {
    if (this.sidenav && this.container) {
      this.container.clear();
      this.componentRef = this.container.createComponent(component);
      this._title = title || '';

      if (data && this.componentRef.instance) {
        this.componentRef.instance.data = data;
      }

      // Set the disableClose property for the sidenav
      this.toggleDisableClose(disableClose);
      this.sidenav.disableClose = disableClose;

      this.togglePadding(false);
      this.sidenav.open();
    } else {
      this.pendingOpen = { component, title, data: data || {} };
    }
    return this.componentRef;
  }

  // Set the closure origin
  setClosureOrigin(origin: 'timeout' | 'user' | null): void {
    console.log(`Setting closure origin to: ${origin}`);
    this.closureOriginSubject.next(origin); // Emit the new origin
  }

  // Get the current closure origin
  getClosureOrigin(): 'timeout' | 'user' | null {
    const origin = this.closureOriginSubject.getValue(); // Get the current value
    console.log(`Getting closure origin: ${origin}`);
    return origin;
  }

  // Close the sidenav with a specific origin
  close(origin: 'timeout' | 'user' = 'user'): void {
    console.log(`Closing side panel with origin: ${origin}`);

    // Emit the closure origin
    this.closureOriginSubject.next(origin);

    // Clean up the component
    if (this.componentRef) {
      this.componentRef.destroy();
      this.componentRef = null;
    }

    this._title = '';
    if (this.sidenav) {
      this.sidenav.close();
    }
  }

  toggle(
    component?: Type<any>,
    title?: string,
    data?: any,
    disableClose: boolean = false
  ) {
    if (this.sidenav && this.sidenav.opened) {
      this.close();
    } else {
      if (component) {
        this.open(component, title, data, disableClose);
      } else if (this.sidenav) {
        this.sidenav.open();
      } else {
        if (component) {
          this.pendingOpen = { component, title, data, disableClose };
        }
      }
    }
  }
}
