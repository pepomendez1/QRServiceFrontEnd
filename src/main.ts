import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

// Suppress console logs in production or if debugMode is false
if (!environment.debugMode) {
  console.log = () => {}; // Disable console.log
  console.warn = () => {}; // Disable console.warn
  console.info = () => {}; // Disable console.info
  // Leave console.error enabled for critical error reporting
  console.error = () => {}; // Disable console.info
  console.debug = () => {}; // Disable console.debug
  console.table = () => {};
}

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.error(err));
//comentario 2
