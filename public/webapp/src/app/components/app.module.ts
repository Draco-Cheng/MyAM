import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

import { AppRoutingModule } from './app.routing';

import { AppComponent } from './app.component';
import { NavModule } from './navgation-bar/nav.module';


import { LoginModule } from './login/login.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AboutModule } from './about/about.module';


@NgModule({
  imports: [
    BrowserModule,
    NavModule,
    AppRoutingModule,

    LoginModule,
    DashboardModule,
    AboutModule
  ],
  declarations: [AppComponent],
  bootstrap: [AppComponent]
})
export class AppModule {}
