import { Injectable } from '@angular/core';

import { ConfigHandler } from '../handler/config.handler';
import { RequestHandler } from '../handler/request.handler';
import { CacheHandler } from '../handler/cache.handler';
import { CryptHandler } from '../handler/crypt.handler';
import { NotificationHandler } from '../handler/notification.handler';

@Injectable() export class ProfileService {
  private endpoint_db = this.config.get('server_domain') + '/db';
  private endpoint_profile = this.config.get('server_domain') + '/profile';
  private encrypt;

  constructor(
    private config: ConfigHandler,
    private cacheHandler: CacheHandler,
    private request: RequestHandler,
    private cryptHandler: CryptHandler,
    private notificationHandler: NotificationHandler
  ) {
    this.encrypt = cryptHandler.encrypt;
  };

  getConfig() {
    return this.config.get();
  }

  async updateConfigProfile() {
    const _urlProfile = this.endpoint_profile + '/get';
    const _resaultProfile = await this.request.post(_urlProfile);

    if (!_resaultProfile['success'])
      return this.notificationHandler.broadcast('error', _resaultProfile['message']);

    const _urlDbList = this.endpoint_db + '/dbList';
    const _resaultDbList = await this.request.post(_urlDbList);

    if (!_resaultDbList['success'])
      return this.notificationHandler.broadcast('error', _resaultDbList['message']);

    let _userProfile = _resaultProfile['data']['user'][0];
    _userProfile['dbList'] = _resaultDbList['data']['dbList'];

    this.config.setUserProfile(_userProfile);
  }

  async getBreakpointDbList(database) {
    const _url = this.endpoint_db + '/breakpoint/list';
    const _data = {
      db: database
    };

    const _resault = await this.request.post(_url, _data);

    if (!_resault['success'])
      this.notificationHandler.broadcast('error', _resault['message']);

    return _resault;
  }



  async delBreakpointDb(database, breakpoint) {
    const _url = this.endpoint_db + '/breakpoint/del';
    const _data = {
      db: database,
      breakpoint: breakpoint
    };

    const _resault = await this.request.post(_url, _data);

    if (!_resault['success'])
      this.notificationHandler.broadcast('error', _resault['message']);

    return _resault;
  }

  async createDB(dbName, mainCurrenciesType) {
    const _url = this.endpoint_db + '/create';
    const _data = {
      db: dbName,
      mainCurrenciesType: mainCurrenciesType
    };

    const _resault = await this.request.post(_url, _data);

    if (!_resault['success'])
      this.notificationHandler.broadcast('error', _resault['message']);

    await this.updateConfigProfile();

    return _resault;
  }

  async uploadDB(dbName, file) {
    const _url = this.endpoint_db + '/upload';
    const _data = {
      name: dbName,
      file: file
    };

    const _resault = await this.request.upload(_url, _data);

    if (_resault['success']) {
      await this.updateConfigProfile();
    }

    return _resault;
  }

  async delDB(dbName) {
    const _url = this.endpoint_db + '/del';
    const _data = {
      db: dbName
    };

    const _resault = await this.request.post(_url, _data);

    await this.updateConfigProfile();

    if (_resault['success'] && dbName == this.config.get('database')) {
      this.config.set('database', '');
      this.setActiveDb('');
    }

    if (!_resault['success'])
      this.notificationHandler.broadcast('error', _resault['message']);

    return _resault;
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

  async downloadDb(dbName, breakpoint ? ) {
    const _url = this.endpoint_db + '/download';

    let _data = {}
    _data['db'] = dbName;

    if (breakpoint) {
      _data['breakpoint'] = breakpoint;
    }

    const _resault = await this.request.download(_url, _data);

    return _resault;
  }

  async renameDb(dbName, newDbName) {
    const _url = this.endpoint_db + '/rename';

    let _data = {}
    _data['db'] = dbName;
    _data['newDbName'] = newDbName;

    const _resault = await this.request.post(_url, _data);

    await this.updateConfigProfile();

    if (_resault['success'] && dbName == this.config.get('database')) {
      this.config.set('database', newDbName);
      this.setActiveDb(newDbName);
    }

    if (!_resault['success'])
      this.notificationHandler.broadcast('error', _resault['message']);

    return _resault;
  }

  async set(formObj) {
    const _url = this.endpoint_profile + '/set';
    const _currentProfile = this.config.get('user');

    const _data = {};

    ['breakpoint', 'mail', 'name'].forEach(key => {
      if (_currentProfile[key] != formObj[key])
        _data[key] = formObj[key];
    });

    if (formObj['pwd'] && formObj['pwd2']) {
      _data['token'] = this.encrypt(this.encrypt(formObj['pwd']));
      _data['token2'] = this.encrypt(formObj['pwd2']);
    }

    if (Object.keys(_data).length) {
      const _resault = await this.request.post(_url, _data);

      if (!_resault['success'])
        this.notificationHandler.broadcast('error', _resault['message']);

      if (_resault['success'] && _data['token']) {
        location.href = '';
      } else {
        await this.updateConfigProfile();
        return { data: _resault };
      }

    }

  }
}
