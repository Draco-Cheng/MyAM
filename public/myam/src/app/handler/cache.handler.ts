import { Injectable } from '@angular/core';

var Cache = {};

class cacheEle {
  status = -1; // -1 notReady, 0 async progress, 1 ready
  legacy = false;
  waitingQue = [];
  data = null;
  constructor() {};
}

@Injectable() export class CacheHandler {
  constructor() {};

  async wipe(name) {
    let _cache = Cache[name];

    if (_cache) {
      _cache['legacy'] = true;
      delete Cache[name];
    }
  }

  // if_not_exist_will_create_async_later: if not ready, return cache inmmediatly and set status to 'aync'
  async get(name: string, if_not_exist_will_create_async_later ? : boolean) {
    let _cache = Cache[name] = Cache[name] || new cacheEle();

    switch (_cache.status) {
      case -1:
        if (if_not_exist_will_create_async_later) {
          _cache.status = 0;
        }
        break;
      case 0:
        return new Promise(resolve => {
          _cache['waitingQue'].push(resolve);
        });
    }
    return Promise.resolve(_cache);
  };

  set(name: string, data) {
    let _cache = Cache[name] = Cache[name] || new cacheEle();
    _cache['legacy'] = false;
    _cache['status'] = 1;
    _cache['data'] = data;

    _cache['waitingQue'].forEach(func => func(_cache));
    _cache['waitingQue'] = [];
  }

  regAsyncReq(name) {
    let _cache = Cache[name] = Cache[name] || new cacheEle();
    _cache['status'] = 0;

    return data => {
      this.set(name, data);
      return _cache;
    };
  };


};
