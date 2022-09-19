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
import { AuthModule } from './auth/auth.module'; // модуль авторизации
import { API_BASE_URL } from './services/ApiService'; // путь к бэку
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NZ_I18N, ru_RU } from 'ng-zorro-antd/i18n';
import { en_US } from 'ng-zorro-antd/i18n';
import { NzLayoutModule } from 'ng-zorro-antd/layout'; // какой-то стилизованный дфнщге
import { NzMenuModule } from 'ng-zorro-antd/menu'; // какая - то встроенная менюшка
import { NzGridModule } from 'ng-zorro-antd/grid'; // Это сеточка
import { NzTableModule } from 'ng-zorro-antd/table'; // Это табличка
import { NzButtonModule } from 'ng-zorro-antd/button'; // Это кнопочка
import { NzInputModule } from 'ng-zorro-antd/input'; // Это инпуты
import { NzFormModule } from 'ng-zorro-antd/form'; // Это формы
import { NzTabsModule } from 'ng-zorro-antd/tabs'; // Это табы
import { NzIconModule } from 'ng-zorro-antd/icon'; // Это значки
import { ReceiptPageComponent } from './components/receipt-page/receipt-page.component';
import { ReceiptInfoComponent } from './components/receipt-info/receipt-info.component';
import { ReceiptListComponent } from './components/receipt-list/receipt-list.component';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { ReceiptAddComponent } from './components/receipt-add/receipt-add.component';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { ModalModule } from 'ngx-modialog';
import { BootstrapModalModule } from 'ngx-modialog/plugins/bootstrap';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { NzUploadModule } from 'ng-zorro-antd/upload'; // тут загрузочку файлов подключаем
import { NzMessageService } from 'ng-zorro-antd/message';
import { FileWorkComponent } from './components/file-work/file-work.component';
import { NzModalModule } from 'ng-zorro-antd/modal';

registerLocaleData(en);

@NgModule({
  declarations: [
    AppComponent,
    AuthComponent,
    HomePageComponent,
    UserPageComponent,
    ReceiptPageComponent,
    ReceiptListComponent,
    ReceiptInfoComponent,
    ReceiptAddComponent,
    FileWorkComponent
  ],
  imports: [
    NzFormModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,  // чтобы работали реактивные формы
    BrowserAnimationsModule,
    NzLayoutModule,
    NzMenuModule,
    NzGridModule,
    NzTableModule,
    NzButtonModule,
    NzInputModule,
    NzTabsModule,
    NzIconModule,
    NzPageHeaderModule,
    NzPaginationModule,
    NzDropDownModule,
    NgxSmartModalModule.forRoot(),
    NzUploadModule,
    NzModalModule
   
    //AuthModule // раскомментировать, если понадобится доступ к приложению через keykloack
  ],
  providers: [
    {
      provide: API_BASE_URL,
      useValue: "https://localhost:7155"
    },
    { provide: NZ_I18N, useValue: ru_RU }, // чтобы у ant.d был английский, а не японский)))
    [NgxSmartModalService],
    [ NzMessageService ]

  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
