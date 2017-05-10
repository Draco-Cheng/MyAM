import { Injectable } from '@angular/core';

import { ConfigHandler } from '../handler/config.handler';
import { RequestHandler } from '../handler/request.handler';

@Injectable() export class ProfileService {
  private endpoint_db = this.config.get('server_domain') + '/db';

  constructor(
    private config: ConfigHandler,
    private request: RequestHandler
  ) {};

  getUserProfile() {
    return this.config.get('user');
  }

  getUserDatabase() {
    return this.config.get('database');
  }

  isLogin() {
    return this.config.get('isLogin');
  }

  async getBreakpointDbList(uid, database) {
    const _url = this.endpoint_db + '/breakpoint/list';
    const _data = {
      uid: uid,
      db: database
    };

    const _resault = await this.request.post(_url, _data);

    return  { data: _resault };
  }
}
