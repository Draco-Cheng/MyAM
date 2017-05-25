import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../service/auth.service';

import { LoginComponent } from './login.component';
import { RegisterComponent } from './register/register.component';
import { ChildRoutingModule } from './login.routing';

@NgModule({
  imports: [
    CommonModule,
    ChildRoutingModule,
    BrowserModule,
    FormsModule
  ],
  declarations: [
    LoginComponent,
    RegisterComponent
  ],
  providers: [AuthService]
})
export class LoginModule {}
