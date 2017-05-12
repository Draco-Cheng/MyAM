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
  private activedDb;
  private selectedDb;
  private breakpointDbList;
  private profileMap = profileMap;
  private popOutAddDb;

  private pwd_original;
  private pwd_new;
  private pwd_confirm;


  constructor(
    private profileService: ProfileService
  ) {};


  async ngOnInit() {
    this.getUserProfile();
    this.getDatabaseName();
    await this.getBreakpointDbList();

    if (!this.user['dbList'].length)
      this.openAddDbPopOut();

    this.__isInit = true;
  };

  async __checkDataUpToDate() {}

  getUserProfile() {
    this.user = this.profileService.getUserProfile();
  }

  getDatabaseName() {
    this.selectedDb = this.activedDb = this.profileService.getUserDatabase();
  }

  formatDate(date) {
    return new Date(date * 1).toDateString();
  }

  async getBreakpointDbList() {
    if (this.selectedDb) {
      var _res = await this.profileService.getBreakpointDbList(this.selectedDb);
      this.breakpointDbList = [];
      _res['data'].forEach(name => this.breakpointDbList.push({ 'dbName': name }));
    }
  }

  async delDB(dbName) {
    let _msg = `Are you sure, you want to delete database: ${dbName}?\nPlease Enter: "${dbName}" to confirm!`;
    if (prompt(_msg) == dbName) {
      await this.profileService.delDB(dbName);
      this.getUserProfile();

      this.selectedDb = this.user['dbList'][0];
      this.getBreakpointDbList();
      if (dbName == this.activedDb) {
        this.setActiveDb();
      }
    }
  }

  async delBreakpointDb(breakpointDb) {
    if (this.selectedDb) {
      var _res = await this.profileService.delBreakpointDb(this.selectedDb, breakpointDb);
      this.getBreakpointDbList();
    }
  }

  closeAddDbPopOut = (dbName ? ) => {
    if (dbName) {
      this.getUserProfile();
      this.selectedDb = dbName;
      this.getBreakpointDbList();
    }

    this.popOutAddDb = false;
  }

  openAddDbPopOut() {
    this.popOutAddDb = true;
  }

  setActiveDb() {
    this.profileService.setActiveDb(this.selectedDb);
    this.activedDb = this.selectedDb;
  }

  downloadDb(breakpointDb) {
    this.profileService.downloadDb(this.selectedDb, breakpointDb);
  }

  async save() {
    let _data = {};
    _data['name'] = this.user['name'];
    _data['mail'] = this.user['mail'];
    _data['breakpoint'] = this.user['breakpoint'];


    if (this.pwd_original && this.pwd_new &&this.pwd_new == this.pwd_confirm) {
      _data['pwd'] = this.pwd_original;
      _data['pwd2'] = this.pwd_new;
    }

    await this.profileService.set(_data);
  }
}
