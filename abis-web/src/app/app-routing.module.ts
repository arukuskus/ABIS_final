import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomePageComponent } from './components/home-page/home-page.component';
import { InstanceComponent } from './components/instance/instance.component';
import { InstancesComponent } from './components/instances/instances.component';
import { ReceiptAddComponent } from './components/receipt-add/receipt-add.component';
import { ReceiptInfoComponent } from './components/receipt-info/receipt-info.component';
import { ReceiptListComponent } from './components/receipt-list/receipt-list.component';
import { ReceiptPageComponent } from './components/receipt-page/receipt-page.component';

const routes: Routes = [
 
  // главная страница
  { path: '', component: HomePageComponent },
  // страница постулений
  { 
    path: 'receipts', 
    component: ReceiptPageComponent, //заголовок и routeroutlet
    pathMatch: 'prefix',
    children: [
      {path: '', component: ReceiptListComponent,  pathMatch: 'full'}, //список поступлений
      {path: ':id', component: ReceiptInfoComponent, pathMatch: 'full'}, //карточка поступлений
      {path: 'receipt/add', component: ReceiptAddComponent, pathMatch: 'full'} // карточка добавления поступления
    ]
 },

  { 
    path: 'instance', 
    component: InstanceComponent,
    pathMatch: 'prefix',
    children: [
      { path: 'instances', component: InstancesComponent, pathMatch: 'full' },
    ] 
  },


  { path: '**', component: HomePageComponent } // универсальный маршрут
  //{ path: '', pathMatch: 'full', redirectTo: '/welcome' },
  //{ path: 'welcome', loadChildren: () => import('./pages/welcome/welcome.module').then(m => m.WelcomeModule) }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
