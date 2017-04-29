import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { HttpModule, JsonpModule } from '@angular/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Handler
import { RequestHandler } from '../handler/request.handler';
import { CacheHandler } from '../handler/cache.handler';

// APP Module
import { AppRoutingModule } from './app.routing';
import { AppComponent } from './app.component';

// Component
import { NavModule } from './navgation-bar/nav.module';
import { LoginModule } from './login/login.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { RecordsModule } from './records/records.module';
import { CurrencyModule } from './currency/currency.module';
import { AboutModule } from './about/about.module';

@NgModule({
  imports: [
    BrowserModule,
    CommonModule,
    NavModule,
    AppRoutingModule,
    HttpModule,
    JsonpModule,
    FormsModule,

    // Module
    LoginModule,
    DashboardModule,
    AboutModule,
    CurrencyModule,
    RecordsModule
  ],
  declarations: [
    AppComponent
  ],
  bootstrap: [AppComponent],
  providers: [
    RequestHandler,
    CacheHandler
  ],
  exports: []
})
export class AppModule {}
