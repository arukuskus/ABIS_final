export const environment = {
  production: true,
  keycloak: {
    issuer: "http://localhost:8080/realms/SAT",
    redirectUri: "http://localhost:4200/my-account",
    clientId: "DEMO",
    scope: "openid profile",
  }
};
