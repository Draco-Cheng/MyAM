import { Component } from '@angular/core';

import { ProfileService } from '../../service/profile.service';
import { AuthService } from '../../service/auth.service';

import './nav.style.less';

@Component({
  selector: 'navView',
  template: require('./nav.template.html'),
  providers: [
    ProfileService,
    AuthService
  ]
})
export class NavComponent {
  private name = 'MyAM';
  private __isInit;
  private __meta = {};

  private user;
  private isLogin;
  private database;

  constructor(
    private profileService: ProfileService,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    this.getConfig();
    this.__isInit = true;
  };

  async __checkDataUpToDate() {
    if (this.__meta['config']['legacy']) {
      this.getConfig();
    }
  }

  getConfig() {
    var _config = this.__meta['config'] = this.profileService.getConfig();
    this.user = _config['user'];
    this.isLogin = _config['isLogin'];
    this.database = _config['database'];
  }

  async logout() {
    await this.authService.logout();
    location.href = '';
  }
}
