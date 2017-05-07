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

  constructor(
    private profileService: ProfileService,
    private authService: AuthService
  ) {}

  getUserProfile() {
    return this.profileService.getUserProfile();
  }

  getDatabaseName() {
    return this.profileService.getUserDatabase();
  }

  async logout() {
    await this.authService.logout();
    location.href = '';
  }
}
