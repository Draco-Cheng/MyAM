import { Component } from '@angular/core';
import { Router } from '@angular/router';


import { AuthService } from '../../../service/auth.service';

require('./register.style.less')

@Component({
  selector: 'content-mid-center',
  template: require('./register.template.html'),
  providers: [AuthService]
})
export class RegisterComponent {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  private form = {
    name: '',
    account: '',
    pwd: '',
    pwd2: '',
    mail: ''
  };

  async onSubmit() {
    if(this.form['pwd'] != this.form['pwd2'])
      return;

    const _resault = await this.authService.register(this.form);
  }
}
