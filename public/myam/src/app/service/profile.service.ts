import { Injectable } from '@angular/core';

import { ConfigHandler } from '../handler/config.handler';
import { RequestHandler } from '../handler/request.handler';
import { CacheHandler } from '../handler/cache.handler';
import { CryptHandler } from '../handler/crypt.handler';

@Injectable() export class ProfileService {
  private endpoint_db = this.config.get('server_domain') + '/db';
  private endpoint_profile = this.config.get('server_domain') + '/profile';
  private encrypt;

  constructor(
    private config: ConfigHandler,
    private cacheHandler: CacheHandler,
    private request: RequestHandler,
    private cryptHandler: CryptHandler
  ) {
    this.encrypt = cryptHandler.encrypt;
  };

  getUserProfile() {
    return this.config.get('user');
  }

  getUserDatabase() {
    return this.config.get('database');
  }

  isLogin() {
    return this.config.get('isLogin');
  }

  async getBreakpointDbList(database) {
    const _url = this.endpoint_db + '/breakpoint/list';
    const _data = {
      db: database
    };

    const _resault = await this.request.post(_url, _data);

    return { data: _resault };
  }



  async delBreakpointDb(database, breakpoint) {
    const _url = this.endpoint_db + '/breakpoint/del';
    const _data = {
      db: database,
      breakpoint: breakpoint
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

  async uploadDB(dbName, file) {
    const _url = this.endpoint_db + '/upload';
    const _data = {
      name: dbName,
      file: file
    };

    const _resault = await this.request.upload(_url, _data);

    if(_resault['success']){
      let _user = this.getUserProfile();
      _user['dbList'].push(dbName);

      this.config.set('user', _user);      
    }


    return _resault;
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

    if(_resault && dbName == this.config.get('database') ){
      this.config.set('database', '');
      this.setActiveDb('');
    }

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

  async downloadDb(dbName, breakpoint ? ) {
    const _url = this.endpoint_db + '/download';

    let _data = {}
    _data['db'] = dbName;

    if (breakpoint) {
      _data['breakpoint'] = breakpoint;
    }

    const _resault = await this.request.download(_url, _data);

    return { data: _resault };
  }

  async renameDb(dbName, newDbName) {
    const _url = this.endpoint_db + '/rename';

    let _data = {}
    _data['db'] = dbName;
    _data['newDbName'] = newDbName;

    const _resault = await this.request.post(_url, _data);

    if(_resault && dbName == this.config.get('database') ){
      this.config.set('database', newDbName);
      this.setActiveDb(newDbName);
    }

    return { data: _resault };    
  }

  async set(formObj) {
    const _url = this.endpoint_profile + '/set';
    const _currentProfile = this.getUserProfile();

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

      if (_resault && _data['token']) {
        location.href = '';
      } else {
        return { data: _resault };
      }

    }

  }
}
