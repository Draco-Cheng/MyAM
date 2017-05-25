import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { LoginForm } from './login.form';

import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'content-mid-center',
  template: require('./login.template.html'),
  providers: [AuthService]
})
export class LoginComponent {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  private form = new LoginForm('', '', false);

  async onSubmit() {
    await this.authService.login(this.form);
  }
}
