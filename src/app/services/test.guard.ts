import { CanActivateFn, Router } from '@angular/router';

export const testGuard: CanActivateFn = () => {
  console.log('Any route hit');
  return true;
};
