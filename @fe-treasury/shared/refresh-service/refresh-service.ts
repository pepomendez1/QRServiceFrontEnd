import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RefreshService {
  private refreshSubject = new Subject<void>();

  // Expose the observable for components to listen to
  refresh$ = this.refreshSubject.asObservable();

  // Method to trigger a refresh
  sendRefreshSignal() {
    this.refreshSubject.next();
  }
}
