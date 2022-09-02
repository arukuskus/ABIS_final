import { NgModule } from '@angular/core';
import { AuthModule } from 'angular-auth-oidc-client';


@NgModule({
    imports: [AuthModule.forRoot({
        config: {
          authority: 'http://localhost:8080/realms/SAT', //сервер проверки токена доступа
          redirectUrl: 'http://localhost:4200/my-account', //куда перенаправить пользователя после авторизации
          postLogoutRedirectUri: 'http://localhost:8080', //куда перейдем, когда разлогинимся
          clientId: 'DEMO', //это id клиента
          usePushedAuthorisationRequests: true,
          scope: 'openid profile address email phone offline_access', // 'openid profile offline_access ' + your scopes (тут не знаю, ввела как в постмане)
          responseType: 'code', //тут также в постмане
          silentRenew: true,
          useRefreshToken: true,
          ignoreNonceAfterRefresh: true,
          customParamsAuthRequest: {
            //prompt: 'consent', // login, consent
            // Параметры авторизации для request запроса
            grant_type: 'authorization_code',
            clientId: 'DEMO',
            code:'', // По идее должно приходить из get запроса
            redirectUrl: 'http://localhost:4200/my-account' // переходим в мой аккаунт
            },

    }
      })],
    exports: [AuthModule],
})
export class AuthConfigModule {}
