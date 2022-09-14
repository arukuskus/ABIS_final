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
import { API_BASE_URL } from './services/ApiService';
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
import { NzFormModule } from 'ng-zorro-antd/form'; // Это формы
import { NzTabsModule } from 'ng-zorro-antd/tabs'; // Это табы
import { NzIconModule } from 'ng-zorro-antd/icon'; // Это значки
import { InstancesComponent } from './components/instances/instances.component';
import { ReceiptPageComponent } from './components/receipt-page/receipt-page.component';
import { ReceiptInfoComponent } from './components/receipt-info/receipt-info.component';
import { ReceiptListComponent } from './components/receipt-list/receipt-list.component';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { ReceiptAddComponent } from './components/receipt-add/receipt-add.component';
import { InstancesStore } from './services/instances.store';

registerLocaleData(en);

@NgModule({
  declarations: [
    AppComponent,
    AuthComponent,
    HomePageComponent,
    UserPageComponent,
    InstanceComponent,
    InstancesComponent,
    ReceiptPageComponent,
    ReceiptListComponent,
    ReceiptInfoComponent,
    ReceiptAddComponent
  ],
  imports: [
    NzFormModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,  // чтобы работали реактивные формы
    BrowserAnimationsModule,
    IconsProviderModule,
    NzLayoutModule,
    NzMenuModule,
    NzGridModule,
    NzTableModule,
    NzButtonModule,
    NzInputModule,
    NzTabsModule,
    NzIconModule,
    NzPageHeaderModule
    //AuthModule
  ],
  providers: [
    {
      provide: API_BASE_URL,
      useValue: "https://localhost:7155"
    },
    { provide: NZ_I18N, useValue: en_US }
    //NzTableModule // чтобы можно было пользоваться где угодно

  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
