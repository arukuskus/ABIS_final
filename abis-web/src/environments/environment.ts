// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  keycloak: {
    issuer: "http://localhost:8080/realms/SAT",
    redirectUri: "http://localhost:4200/my-account",
    clientId: "DEMO",
    scope: "openid profile",
    responseType: "code",
    showDebugInformation: true,
    logoutUrl: 'http://localhost:4200',
    skipIssuerCheck: true
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
