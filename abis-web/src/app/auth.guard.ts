import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot, UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { OAuthService} from "angular-oauth2-oidc";
import {InitialAuthService} from "./services/auth-service/InitialAuthService";


@Injectable({ providedIn: 'root' })
export class AuthorizationGuard implements CanActivate {

  constructor(
    private router: Router,
    private oauthService: OAuthService, // библиотека Oauth2
    private initAuth: InitialAuthService // сервис авторизации
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {


    // Пользователь пытается обратиться к защищенному my-account
    if(!this.initAuth.isAuthorized) {

       // this.initAuth.initAuth().then(
       //   () => {
       //     this.initAuth.isAuthorized = true;
       //   }
       // )

      this.initAuth.isAuthorized = true;

    }
    return this.initAuth.isAuthorized;
  }
}
