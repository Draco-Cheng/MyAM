import { Injectable } from '@angular/core';
import { RequestHandler } from '../handler/request.handler';
import { CacheHandler } from '../handler/cache.handler';

var config = require('../config.json');

let cache = {
  'type': null,
  'typeFlatMap': null
};

@Injectable() export class TypeService {

  private endpoint = config.server_domain + '/type';

  constructor(
    private request: RequestHandler,
    private cacheHandler: CacheHandler
  ) {};

  wipe() {
    this.cacheHandler.wipe('type');
    this.cacheHandler.wipe('type.flatmap');
  }

  async get(formObj ? : any) {
    const _cacheName = 'type';
    const _cache = await this.cacheHandler.get(_cacheName, true);

     if (_cache.status == 1) {
      return _cache;
    } else {
      const _resolveCache = this.cacheHandler.regAsyncReq(_cacheName);
      const _url = this.endpoint + '/get'
      const _resault = await this.request.post(_url);

      return _resolveCache(_resault);
    }
  }

  async getFlatMap(formObj ? : any) {
    const _cacheName = 'type.flatmap';
    const _cache = await this.cacheHandler.get(_cacheName, true);

     if (_cache.status == 1) {
      return _cache;
    } else {
      const _resolveCache = this.cacheHandler.regAsyncReq(_cacheName);

      let _reObj = {};
      const _formObj = formObj || {};
      const _url = this.endpoint + '/getMaps'
      const _res = await this.request.post(_url);

      _res.forEach(ele => {
        _reObj[ele.tid] = _reObj[ele.tid] || {};
        _reObj[ele.tid][ele.sub_tid] = ele.sequence;
      });

      return _resolveCache(_reObj);      
    };
  }
}
