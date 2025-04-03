import {
  CanActivateFn,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { inject } from '@angular/core';
import { StoreDataService } from '../store-data.service';
import { iframeGuard } from './iframe.guard';
import { appGuard } from './app.guard';
import { Observable, switchMap, of, from } from 'rxjs';

export const dynamicGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<boolean | import('@angular/router').UrlTree> => {
  const storeDataService = inject(StoreDataService);
  const router = inject(Router);

  return storeDataService.getStore().pipe(
    switchMap((store) => {
      const isIframeMode = store.isIframe ?? false;
      console.log('🔍 Dynamic Guard - isIframe:', isIframeMode);

      // ✅ Call the appropriate guard
      const selectedGuard = isIframeMode ? iframeGuard : appGuard;
      const guardResult = selectedGuard(route, state);

      // ✅ Ensure everything is wrapped inside an Observable
      if (guardResult instanceof Observable) {
        return guardResult; // ✅ Already an observable, return it
      } else if (guardResult instanceof Promise) {
        return from(guardResult); // ✅ Convert Promise to Observable
      } else {
        return of(guardResult); // ✅ Convert boolean to Observable
      }
    })
  );
};
