import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { authCodeFlowConfig } from "../../auth/auth.config";
import { BehaviorSubject } from "rxjs";
import { InitialAuthService } from "../../services/auth-service/InitialAuthService";

@Component({
  selector: 'app-user-page',
  templateUrl: './user-page.component.html',
  styleUrls: ['./user-page.component.css']
})

// Просто тестовый компонент пользователя при успешной аутентификации через sso keycloak
export class UserPageComponent implements OnInit {

  constructor(
    private router: Router,
    private authService: InitialAuthService
  ) { }

  userName$: BehaviorSubject<string> | undefined;
  ngOnInit(): void {
    //this.Oauth.configure(authCodeFlowConfig);
  }


  // Выйти на домашнюю страницу сайта
  logout(){
    this.authService.logoutSession();
  }


}
