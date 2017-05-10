import { Component } from '@angular/core';


import { ProfileService } from '../../../service/profile.service';

import './profile.view.style.less';

const profileMap = require('../profile.map.json');


@Component({
  selector: 'profile-content',
  template: require('./profile.view.template.html'),
  providers: [
    ProfileService
  ]
})

export class ProfileViewComponent {
  private __isInit = false;
  private __meta = {};

  private user;
  private currentDatabase;
  private selectedDb;
  private breakpointDbList;
  private profileMap = profileMap;
  private popOutAddDb;


  constructor(
    private profileService: ProfileService
  ) {};


  async ngOnInit() {
    this.getUserProfile();
    this.getDatabaseName();
    await this.getBreakpointDbList();
    this.__isInit = true;
  };

  async __checkDataUpToDate() {}

  getUserProfile() {
    this.user = this.profileService.getUserProfile();
  }

  getDatabaseName() {
    this.selectedDb = this.currentDatabase = this.profileService.getUserDatabase();
  }

  formatDate(date) {
    return new Date(date * 1).toDateString();
  }

  async getBreakpointDbList() {
    if (this.currentDatabase) {
      var _res = await this.profileService.getBreakpointDbList(this.user.uid, this.currentDatabase);
      this.breakpointDbList = [];
      _res['data'].forEach(name => this.breakpointDbList.push({ 'dbName': name }));
    }
  }

  closeAddDbPopOut = () => {
    this.popOutAddDb = false;
  };

  openAddDbPopOut() {
    this.popOutAddDb = true;
  }
}
