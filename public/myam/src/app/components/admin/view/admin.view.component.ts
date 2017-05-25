import { Component } from '@angular/core';


import { AdminServer } from '../../../service/admin.service';
import { ProfileService } from '../../../service/profile.service';

import './admin.view.style.less';

function cloneObj(obj) {
  return JSON.parse(JSON.stringify(obj));
};

@Component({
  selector: 'admin-content',
  template: require('./admin.view.template.html'),
  providers: [
    ProfileService,
    AdminServer
  ]
})

export class AdminViewComponent {
  private __isInit = false;
  private __meta = {};

  private profileMap;

  private userList;

  constructor(
    private profileService: ProfileService,
    private adminServer: AdminServer
  ) {

  };


  async ngOnInit() {
    this.__meta['userList'] = await this.adminServer.getUserList();
    this.userList = cloneObj(this.__meta['userList']['data']);
    this.profileMap = this.profileService.getProfileMap();

    this.__isInit = true;
  };

  async __checkDataUpToDate() {}

  loginInfoToStr(str) {
    let _info = str.split('|');
    return [_info[0], this.dateString(_info[1])];
  }

  dateString(time) {
    return new Date(time * 1).toLocaleDateString();
  }

  objKeys(obj) {
    return Object.keys(obj);
  }

  async resetPwd(user) {
    let _data = {
      target_uid: user['uid'],
      newPwd: user['newPwd']
    };

    await this.adminServer.setUser(_data);

    user['newPwd'] = '';

  }

  async updateUser(user) {
    let _data = {
      target_uid: user['uid'],
      status: user['status'],
      permission: user['permission']
    }

    let _resault = await this.adminServer.setUser(_data);

    if (!_resault['success']) {
      for (let _metaUser of this.__meta['userList']['data']) {
        if (_metaUser['uid'] = user['uid']) {
          user['status'] = _metaUser['status'];
          user['permission'] = _metaUser['permission'];
          return;
        }

      }


    }
  }
}
