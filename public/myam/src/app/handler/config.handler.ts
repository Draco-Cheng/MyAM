import { Injectable } from '@angular/core';

var config = require('../config.json');

function cloneObj(obj) {
  return JSON.parse(JSON.stringify(obj));
};


@Injectable() export class ConfigHandler {

  get(name ? ) {
    return name ? config[name] : config;
  }

  set(name, data) {
    let _newConfig = cloneObj(config);
    _newConfig[name] = typeof data == 'object' ? cloneObj(data) : data;

    config['legacy'] = true;
    config = _newConfig;
  }

  setUserProfile(userProfile) {
    this.set('user', userProfile);
    this.set('uid', userProfile['uid']);
    this.set('isLogin', true);

    let _uid = userProfile['uid'];
    let _dbList = userProfile['dbList'];

    if (_dbList.length) {
      let _localSaveDB = localStorage.getItem(_uid + '.db');

      if (_localSaveDB && _dbList.indexOf(_localSaveDB) != -1) {
        this.set('database', _localSaveDB);
      } else {
        this.set('database', _dbList[0]);
        localStorage.setItem(_uid + '.db', _dbList[0]);
      }
    }
  }

};
