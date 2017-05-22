import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { HttpModule, JsonpModule } from '@angular/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// i18n
import { i18n } from '../i18n/i18n';

// Handler
import { ConfigHandler } from '../handler/config.handler';
import { RequestHandler } from '../handler/request.handler';
import { CacheHandler } from '../handler/cache.handler';
import { CryptHandler } from '../handler/crypt.handler';
import { NotificationHandler } from '../handler/notification.handler';


// APP Module
import { AppRoutingModule } from './app.routing';
import { AppComponent } from './app.component';

// Component
import { NavModule } from './navgation-bar/nav.module';
import { LoginModule } from './login/login.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { RecordsModule } from './records/records.module';
import { CurrencyModule } from './currency/currency.module';
import { TypesModule } from './types/types.module';
import { ProfileModule } from './profile/profile.module';
import { AboutModule } from './about/about.module';
import { NotificationBubbleModule } from './notification-bubble/notification-bubble.module';

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
    TypesModule,
    RecordsModule,
    ProfileModule,
    NotificationBubbleModule
  ],
  declarations: [
    AppComponent
  ],
  bootstrap: [AppComponent],
  providers: [
    ConfigHandler,
    RequestHandler,
    CacheHandler,
    CryptHandler,
    NotificationHandler
  ],
  exports: []
})
export class AppModule {}