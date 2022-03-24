import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {DashboardComponent} from './dashboard/dashboard.component';
import {LoginComponent} from './login/login.component';
import {ChartsComponent} from './charts/charts.component';
import {AddComponent} from './devices/add/add.component';
import {ConfigureComponent} from './devices/configure/configure.component';
import {CreateComponent} from './users/create/create.component';
import {ProfileComponent} from './users/profile/profile.component';

const routes: Routes = [
  {path: '', redirectTo: '/Login', pathMatch: 'full' },
  {path: 'Login', component: LoginComponent},
  {path: 'Dashboard' , component: DashboardComponent},
  {path: 'Charts', component: ChartsComponent},
  {path: 'AddDevice', component: AddComponent},
  {path: 'Devices', component: ConfigureComponent},
  {path: 'Profile', component: ProfileComponent},
  {path: 'CreateAccount', component: CreateComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
