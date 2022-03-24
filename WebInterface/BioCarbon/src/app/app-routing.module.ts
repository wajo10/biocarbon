import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {DashboardComponent} from './dashboard/dashboard.component';
import {LoginComponent} from './login/login.component';
import {ChartsComponent} from './charts/charts.component';

const routes: Routes = [
  {path: '', redirectTo: '/Login', pathMatch: 'full' },
  {path: 'Login', component: LoginComponent},
  {path: 'Dashboard' , component: DashboardComponent},
  {path: 'Charts', component: ChartsComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
