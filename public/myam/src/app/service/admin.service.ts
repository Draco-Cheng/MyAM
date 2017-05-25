import { Injectable } from '@angular/core';

import { ConfigHandler } from '../handler/config.handler';
import { RequestHandler } from '../handler/request.handler';
import { CryptHandler } from '../handler/crypt.handler';
import { NotificationHandler } from '../handler/notification.handler';

function cloneObj(obj) {
  return JSON.parse(JSON.stringify(obj));
};

@Injectable() export class AdminServer {
  private endpoint = '/admin';
  private encrypt;

  constructor(
    private config: ConfigHandler,
    private request: RequestHandler,
    private cryptHandler: CryptHandler,
    private notificationHandler: NotificationHandler
  ) {
    this.encrypt = cryptHandler.encrypt;
  };

  async getUserList() {

    const _url = this.endpoint + '/userList';
    const _data = {};

    const _resault = await this.request.post(_url, _data);

    if (!_resault['success'])
      this.notificationHandler.broadcast('error', _resault['message']);

    return _resault;
  }

  async setUser(formObj){
    const _url = this.endpoint + '/setUser';
    const _data = formObj;

    if(_data['newPwd']) {
      _data['token'] = this.encrypt(_data['newPwd']);
      delete _data['newPwd'];
    }

    const _resault = await this.request.post(_url, _data);

    if (!_resault['success'])
      this.notificationHandler.broadcast('error', _resault['message']);
    else
      this.notificationHandler.broadcast('success', 'Update success!');

    return _resault;
  }
}
