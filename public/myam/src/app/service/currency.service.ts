import { Injectable } from '@angular/core';

import { RequestHandler } from '../handler/request.handler';
import { CacheHandler } from '../handler/cache.handler';
import { ConfigHandler } from '../handler/config.handler';

const currencyList = require('./currency.list.json');


@Injectable() export class CurrencyService {

  private currencyList = currencyList;
  private endpoint = this.config.get('server_domain') + '/currency';

  constructor(
    private request: RequestHandler,
    private config: ConfigHandler,
    private cacheHandler: CacheHandler
  ) {};

  wipe() {
    this.cacheHandler.wipe('currency');
    this.cacheHandler.wipe('currency.map');
  }

  setConfigCid(defaultCid, flatMap) {
    let _uid = this.config.get('uid');
    let _localCid = localStorage.getItem(_uid + '.cid');
    if (_localCid && flatMap[_localCid]) {
      this.config.set('cid', _localCid);
    } else {
      this.config.set('cid', defaultCid);
      localStorage.setItem(_uid + '.cid', defaultCid);
    }
  }

  getDefaultCid() {
    return this.config.get('cid')
  }

  getCurrencyList(){
    return this.currencyList;
  }

  async get(formObj ? : any) {
    const _cacheName = 'currency';
    const _cache = await this.cacheHandler.get(_cacheName, true);
    if (_cache.status == 1) {
      return _cache;
    } else {
      const _resolveCache = this.cacheHandler.regAsyncReq(_cacheName);
      const _url = this.endpoint + '/get';
      const _resualt = await this.request.post(_url);
      return _resolveCache(_resualt);
    }
  }


  async getMap() {
    const _cacheName = 'currency.map';
    const _cache = await this.cacheHandler.get(_cacheName, true);

    if (_cache.status == 1) {
      return _cache;
    } else {
      const _resolveCache = this.cacheHandler.regAsyncReq(_cacheName);
      const _currency = (await this.get())['data'];
      let _structureMap = {};
      let _flatMap = {};
      let _rootCid;
      let _mainCurrencyList = [];

      // build flate map
      _currency.forEach(cur => {
        _flatMap[cur.cid] = cur;
        cur.childs = [];
      });

      // put child in parent
      _currency.forEach(cur => {
        if (cur.main) {
          if (cur.to_cid)
            _flatMap[cur.to_cid].preMain = cur.cid;
          else
            _rootCid = cur.cid;
        } else {
          _flatMap[cur.to_cid].childs.push(cur);
        }
      });
      
      // set config cid 
      this.setConfigCid(_rootCid, _flatMap);

      do {
        _structureMap[_rootCid] = _flatMap[_rootCid];
        _rootCid = _flatMap[_rootCid].preMain || null;
      } while (!!_rootCid);

      
      

      return _resolveCache({
        flatMap: _flatMap,
        structureMap: _structureMap
      });
    }
  }

  async set(formObj: any) {
    const _url = this.endpoint + '/set';
    const _data = {
      cid: formObj.cid,
      type: formObj.type,
      rate: formObj.rate,
      to_cid: formObj.to_cid,
      memo: formObj.memo,
      quickSelect: formObj.quickSelect,
      date: formObj.date,
      main: formObj.main
    };


    const _resault = await this.request.post(_url, _data);
    _resault && this.wipe();
    return { data: _resault };
  }

  async add(formObj: any) {
    const _url = this.endpoint + '/set';
    let _data = {
      type: formObj.type,
      rate: formObj.rate,
      to_cid: formObj.main ? null : formObj.to_cid,
      memo: formObj.memo,
      quickSelect: formObj.quickSelect,
      date: formObj.date,
      main: formObj.main
    };

    const _resault = await this.request.post(_url, _data);
    _resault && this.wipe();
    return { data: _resault };
  }

  async del(del_cid) {
    const _url = this.endpoint + '/del';
    const _data = {
      del_cid: del_cid
    };

    const _resault = await this.request.post(_url, _data);
    _resault && this.wipe();
    return { data: _resault };
  }
}
