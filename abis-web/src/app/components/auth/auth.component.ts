import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { AuthenticatedResult, OidcClientNotification } from "angular-auth-oidc-client";
import { BehaviorSubject, Observable } from "rxjs";

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})

// Страница логина (Но в абис такой не будет так как импользуем sso)
export class AuthComponent implements OnInit {


  userDataChanged$: Observable<OidcClientNotification<any>> | undefined;
  userData$: Observable<any> | undefined; // данные пользователя (логин, пароль)
  isAuthenticated$: Observable<AuthenticatedResult> | undefined; // проверка прошла ли аутентификация

  checkSessionChanged$: Observable<boolean> | undefined; //сменилась ли сессия
  checkSessionChanged: any;

  loginForm: any = {
    login: '',
    password: ''
  }

  userName$: BehaviorSubject<string> | undefined;

  constructor(
    private router: Router
  ) { }

  ngOnInit(): void {

  }



  login(){
    this.router.navigate(['my-account']);

    // Старт авторизации
    //this.oathService.initLoginFlow();
  }
}
