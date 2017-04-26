import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { HttpModule, JsonpModule } from '@angular/http';
import { CommonModule } from '@angular/common';

// Handler
import { RequestHandler } from '../handler/request.handler';

// APP Module
import { AppRoutingModule } from './app.routing';
import { AppComponent } from './app.component';

// Component
import { NavModule } from './navgation-bar/nav.module';
import { LoginModule } from './login/login.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { RecordsModule } from './records/records.module';
import { AboutModule } from './about/about.module';


@NgModule({
  imports: [
    BrowserModule,
    CommonModule,
    NavModule,
    AppRoutingModule,
    HttpModule,
    JsonpModule,

    LoginModule,
    DashboardModule,
    AboutModule,
    RecordsModule
  ],
  declarations: [AppComponent],
  bootstrap: [AppComponent],
  providers: [
    RequestHandler
  ]
})
export class AppModule {}
