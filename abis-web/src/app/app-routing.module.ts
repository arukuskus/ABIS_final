import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomePageComponent } from './components/home-page/home-page.component';
import { InstanceComponent } from './components/instance/instance.component';
import { ReceiptComponent } from './components/receipt/receipt.component';

const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'receipts', component: ReceiptComponent },
  { path: 'instance', component: InstanceComponent }
  //{ path: '', pathMatch: 'full', redirectTo: '/welcome' },
  //{ path: 'welcome', loadChildren: () => import('./pages/welcome/welcome.module').then(m => m.WelcomeModule) }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
