// import {Inject, Injectable, OnDestroy} from '@angular/core';
// import {OidcSecurityService} from "angular-auth-oidc-client";
// import {Observable, Subscription, throwError} from "rxjs";
// import {AuthConfigModule} from "../../auth/auth-config.module";
// import {HttpClient, HttpHeaders} from "@angular/common/http";
// import {Router} from "@angular/router";
// import {catchError} from "rxjs/operators";
// import {AuthenticatedResult} from "angular-auth-oidc-client/lib/auth-state/auth-result";
//
// @Injectable({
//   providedIn: 'root'
// })
// // Сервис авторизации (отвечает за проверку личности/выдачу токенов/учетных данных)
// export class AuthService implements OnDestroy {
//
//   // Проверка успешного входа
//   isAuthorized = false;
//
//   constructor(
//     public oidcSecurityService: OidcSecurityService,
//     private http: HttpClient,
//     private router: Router,
//     // @Inject('BASE_URL') private originUrl: string,
//     // @Inject('AUTH_URL') private authUrl: string,
//   ) {
//
//   }
//
//   private isAuthorizedSubscription: Subscription = new Subscription;
//
//   ngOnDestroy(): void {
//     if (this.isAuthorizedSubscription) {
//       this.isAuthorizedSubscription.unsubscribe();
//     }
//   }
//
//   public InitAuth(){
//
//     this.oidcSecurityService.getConfiguration(); // Настраиваем конфигурацию (по идее придет из настроек)
//     this.isAuthorizedSubscription = this.oidcSecurityService.isAuthenticated$.subscribe(
//       isAuth => {
//         if(isAuth.isAuthenticated){
//           this.isAuthorized = isAuth.isAuthenticated;
//         }
//       }
//     )
//   }
//
//   // // Состояние авторизации (генерируется каждый раз, когда происходит событие авторизации)
//   get isLoggedIn() {
//     return this.oidcSecurityService.isAuthenticated$;
//   }
//
//   // Получаем данные пользователя, при успешной авторизации
//   getUserData(): Observable<any> {
//     return this.oidcSecurityService.userData$;
//   }
//
//   // Возвращает токен идентификатора для входа
//   public getToken() {
//     return this.oidcSecurityService.getIdToken();
//   }
//
//   // Открываем страницу логина
//   Login() {
//     console.log('start login');
//     this.oidcSecurityService.authorize();
//   }
//   // Выходит из системы на сервере и локальном клиенте.
//   // Если состояние сервера изменилось, что подтверждается сеансом проверки, то выполняется только локальный выход.
//   Logout() {
//     console.log('start logoff');
//     this.oidcSecurityService.logoff();
//   }
//
//   // Гет запрос
//   get(url: string): Observable<any> {
//     return this.http.get(url, { headers: this.getHeaders() })
//       .pipe(catchError((error) => {
//         return throwError(error);
//       }));
//   }
//   // Пост запрос к ресурсу сайта с токеном доступа
//   post(url: string, data: any): Observable<any> {
//     const body = JSON.stringify(data);
//     return this.http.post(url, body, { headers: this.getHeaders() })
//       .pipe(catchError((error) => {
//         return throwError(error);
//       }));
//   }
//
//   // Полученный токен положим в заголовок
//   private appendAuthHeader(headers: HttpHeaders) {
//     const token = this.oidcSecurityService.getIdToken();
//
//     if (token === '') { return headers; }
//
//     const tokenValue = 'Bearer ' + token;
//     return headers.set('Authorization', tokenValue);
//   }
//
//   private getHeaders() {
//     let headers = new HttpHeaders();
//     headers = headers.set('Content-Type', 'application/json');
//     return this.appendAuthHeader(headers);
//   }
// }
