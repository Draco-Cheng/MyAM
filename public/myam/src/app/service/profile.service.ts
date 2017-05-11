import { Injectable } from '@angular/core';

import { ConfigHandler } from '../handler/config.handler';
import { RequestHandler } from '../handler/request.handler';
import { CacheHandler } from '../handler/cache.handler';

@Injectable() export class ProfileService {
  private endpoint_db = this.config.get('server_domain') + '/db';

  constructor(
    private config: ConfigHandler,
    private cacheHandler: CacheHandler,
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

    return { data: _resault };
  }

  async createDB(dbName, mainCurrenciesType) {
    const _url = this.endpoint_db + '/create';
    const _data = {
      db: dbName,
      mainCurrenciesType: mainCurrenciesType
    };

    const _resault = await this.request.post(_url, _data);

    let _user = this.getUserProfile();
    _user['dbList'].push(dbName);

    this.config.set('user', _user);

    return { data: _resault };
  }

  async delDB(dbName) {
    const _url = this.endpoint_db + '/del';
    const _data = {
      db: dbName
    };

    const _resault = await this.request.post(_url, _data);

    let _user = this.getUserProfile();
    _user['dbList'] = _user['dbList'].filter(name => name != dbName);

    this.config.set('user', _user);

    return { data: _resault };
  }

  wipeCache() {
    this.cacheHandler.wipe('currency');
    this.cacheHandler.wipe('currency.map');
    this.cacheHandler.wipe('type');
    this.cacheHandler.wipe('type.flatmap');
  }

  setActiveDb(dbName) {
    this.wipeCache();

    localStorage.setItem(this.config.get('uid') + '.db', dbName);

    this.config.set('database', dbName);
  }

  async downloadDb(dbName){
    const _url = this.endpoint_db + '/download';
    const _data = {
      db: dbName
    };

    const _resault = await this.request.download(_url, _data);

    return { data: _resault };
  }
}
