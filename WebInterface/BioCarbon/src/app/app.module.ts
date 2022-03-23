import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {NgxGaugeModule} from 'ngx-gauge';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HttpClientModule} from '@angular/common/http';
import {
  CategoryService, ChartAnnotationService,
  ChartModule, ColumnSeriesService, CrosshairService, DataLabelService,
  DateTimeService, LegendService,
  LineSeriesService, RangeColumnSeriesService,
  ScrollBarService, StackingColumnSeriesService, TooltipService, ZoomService
} from '@syncfusion/ej2-angular-charts';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {DatePipe} from '@angular/common';
import {HttpService} from './_services/http.service';
import {StorageService} from './_services/storage.service';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { NavBarComponent } from './components/nav-bar/nav-bar.component';
import {SidebarModule} from 'ng-sidebar';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    NavBarComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgxGaugeModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatCardModule,
    ChartModule,
    SidebarModule.forRoot(),
    NgbModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  providers: [HttpService, StorageService, CategoryService, DateTimeService, ScrollBarService, LineSeriesService, ColumnSeriesService,
    ChartAnnotationService, RangeColumnSeriesService, StackingColumnSeriesService, LegendService, TooltipService, ZoomService,
    CrosshairService, DataLabelService, DatePipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
