import {APP_INITIALIZER, NgModule} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthComponent } from './components/auth/auth.component';
import { HomePageComponent } from './components/home-page/home-page.component';
import { UserPageComponent } from './components/user-page/user-page.component';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule} from "@angular/common/http";
import { InitialAuthService } from "./services/auth-service/InitialAuthService"; // подключаем конфигурацию Oauth 2
import { AuthModule } from './auth/auth.module';
import { InstanceComponent } from './components/instance/instance.component';
import { ReceiptComponent } from './components/receipt/receipt.component';
import { BASE_URL } from './services/ApiService';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NZ_I18N } from 'ng-zorro-antd/i18n';
import { en_US } from 'ng-zorro-antd/i18n';
import { IconsProviderModule } from './icons-provider.module';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu'; // какая - то встроенная менюшка
import { NzGridModule } from 'ng-zorro-antd/grid'; // Это сеточка
import { NzTableModule } from 'ng-zorro-antd/table'; // Это табличка
import { NzButtonModule } from 'ng-zorro-antd/button'; // Это кнопочка
import { NzInputModule } from 'ng-zorro-antd/input'; // Это инпуты

registerLocaleData(en);

@NgModule({
  declarations: [
    AppComponent,
    AuthComponent,
    HomePageComponent,
    UserPageComponent,
    InstanceComponent,
    ReceiptComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,  // чтобы работали реактиынфе формы
    BrowserAnimationsModule,
    IconsProviderModule,
    NzLayoutModule,
    NzMenuModule,
    NzGridModule,
    NzTableModule,
    NzButtonModule,
    NzInputModule

    //AuthModule
  ],
  providers: [
    {
      provide: BASE_URL,
      useValue: "https://localhost:7155"
    },
    { provide: NZ_I18N, useValue: en_US },
    //NzTableModule // чтобы можно было пользоваться где угодно

  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
