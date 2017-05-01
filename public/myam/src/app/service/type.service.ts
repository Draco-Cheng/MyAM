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

  wipe(id ? : String) {
    if (id) {
      this.cacheHandler.wipe(id);
    } else {
      this.cacheHandler.wipe('type');
      this.cacheHandler.wipe('type.flatmap');
    }
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
        _reObj[ele.tid] = _reObj[ele.tid] || { childs: {}, parents: {} };
        _reObj[ele.tid]['childs'][ele.sub_tid] = ele.sequence || 1;

        _reObj[ele.sub_tid] = _reObj[ele.sub_tid] || { childs: {}, parents: {} };
        _reObj[ele.sub_tid]['parents'][ele.tid] = ele.sequence || 1;
      });

      return _resolveCache(_reObj);
    };
  }

  async set(formObj ? : any) {
    const _url = this.endpoint + '/set'
    const _data = {
      tid: formObj.tid,
      type_label: formObj.type_label,
      cashType: formObj.cashType,
      master: formObj.master ? 1 : 0,
      quickSelect: formObj.quickSelect ? 1 : 0,
      showInMap: formObj.showInMap ? 1 : 0
    };
    const _resault = await this.request.post(_url, _data);

    _resault && this.wipe('type');
    return { data: _resault };
  }

  async unlinkParant(p_tid, c_tid) {
    const _url = this.endpoint + '/delMaps'
    const _data = {
      del_tid: p_tid,
      del_sub_tid: c_tid
    }  
    const _resault = await this.request.post(_url, _data);
    _resault && this.wipe('type.flatmap');
    return { data: _resault };
  }

  async linkParant(p_tid, c_tid) {
    const _url = this.endpoint + '/setMaps'
    const _data = {
      tid: p_tid,
      sub_tid: c_tid
    }  
    const _resault = await this.request.post(_url, _data);
    _resault && this.wipe('type.flatmap');
    return { data: _resault };
  }
}
