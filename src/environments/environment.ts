// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: true,
  region: 'us-east-2', // Cambia esto a tu región
  redirectUrl: 'http://localhost:4200/',
  apiUrl: 'https://qnji4j5blg.execute-api.us-east-2.amazonaws.com/Prod',
  debugMode: true,
  // apiUrl: 'https://xa9cbubdj2.execute-api.us-east-2.amazonaws.com/public',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
