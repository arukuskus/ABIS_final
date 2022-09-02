import { Injectable } from "@angular/core";
import { AuthConfig, OAuthService, NullValidationHandler } from "angular-oauth2-oidc";

import { JwtHelperService } from "@auth0/angular-jwt";
import { filter } from "rxjs/operators";
import { Router } from "@angular/router";

@Injectable({
  providedIn: "root",
})

export class InitialAuthService {
  private jwtHelper: JwtHelperService = new JwtHelperService();

  // tslint:disable-next-line:variable-name
  private _decodedAccessToken: any;
  // tslint:disable-next-line:variable-name
  private _decodedIDToken: any;
  get decodedAccessToken() {
    return this._decodedAccessToken;
  }
  get decodedIDToken() {
    return this._decodedIDToken;
  }

  isAuthorized = false;

  constructor(
    private oauthService: OAuthService,
    private authConfig: AuthConfig,
    public router: Router,
  ) { }

  async initAuth(): Promise<any> {
    return new Promise<void>((resolveFn, rejectFn) => {

      // setup oauthService
      this.oauthService.configure(this.authConfig);
      this.oauthService.setStorage(localStorage);
      this.oauthService.tokenValidationHandler = new NullValidationHandler();

      // subscribe to token events
      this.oauthService.events
        .pipe(filter((e: any) => e.type === "token_received"))
        .subscribe(({ type }) => {
          this.handleNewToken();
        });


      // Проверяем авторизацию (смотрит есть ли токены и привязвается к initImplicitFlow(), если нет допустимого токена)
      this.oauthService.loadDiscoveryDocumentAndLogin().then(
        (isLoggedIn) => {

          // Вроде разрешаем пользователю доступ к приложению
          if (isLoggedIn) {
            this.oauthService.setupAutomaticSilentRefresh();
            resolveFn();
          } else {
            // Вызываем аутентификацию через keycloak
            this.oauthService.initImplicitFlow();
            rejectFn();
          }
        },
        (error) => {
          console.log({ error });
          if (error.status === 400) {
            location.reload();
          }
        }
      );
    });
  }

  private handleNewToken() {
    this._decodedAccessToken = this.jwtHelper.decodeToken(
      this.oauthService.getAccessToken()
    );

    this._decodedIDToken = this.jwtHelper.decodeToken(
      this.oauthService.getIdToken()
    );
  }

  logoutSession() {
    // не знаю надо ли отзывать токен перед выходом
    this.oauthService.revokeTokenAndLogout();
    this.oauthService.logOut();
  }
}
