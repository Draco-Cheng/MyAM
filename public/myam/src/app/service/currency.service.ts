import { Injectable } from '@angular/core';

import { RequestHandler } from '../handler/request.handler';
import { CacheHandler } from '../handler/cache.handler';
import { ConfigHandler } from '../handler/config.handler';
import { NotificationHandler } from '../handler/notification.handler';

const currencyList = require('./currency.list.json');

let currencyExchangeCache = {};
let currencyMapForExchangeCache = null;

function cloneObj(obj) {
  return JSON.parse(JSON.stringify(obj));
};

@Injectable() export class CurrencyService {
  private currencyList = currencyList;
  private endpoint = '/currency';

  constructor(
    private request: RequestHandler,
    private config: ConfigHandler,
    private cacheHandler: CacheHandler,
    private notificationHandler: NotificationHandler
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

  getCurrencyList() {
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

      if (_resualt['success'])
        return _resolveCache(_resualt['data']);
      else
        this.notificationHandler.broadcast('error', _resualt['message']);
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

      let _output = {
        flatMap: _flatMap,
        structureMap: _structureMap
      }

      currencyMapForExchangeCache = _output;

      return _resolveCache(_output);
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

    if (_resault['success']) {
      this.wipe();
      this.notificationHandler.broadcast('success', 'Updated success!');
    } else {
      this.notificationHandler.broadcast('error', _resault['message']);
    }

    return _resault;
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

    if (_resault['success']) {
      this.wipe();
      this.notificationHandler.broadcast('success', 'Add success!');
    } else {
      this.notificationHandler.broadcast('error', _resault['message']);
    }

    return _resault;
  }

  async del(del_cid) {
    const _url = this.endpoint + '/del';
    const _data = {
      del_cid: del_cid
    };

    const _resault = await this.request.post(_url, _data);

    if (_resault['success']) {
      this.wipe();
      this.notificationHandler.broadcast('success', 'Deleted success!');
    } else {
      this.notificationHandler.broadcast('error', _resault['message']);
    }

    return _resault;
  }

  setDefaultCid(cid) {
    localStorage.setItem(this.config.get('uid') + '.cid', cid);
    this.config.set('cid', cid);
  }

  exchange(sCid, tCid, value) {
    const _sCid = sCid.toString();
    const _tCid = tCid.toString();

    let _currencyExchangeCache = currencyExchangeCache;
    let _currencyMapForExchangeCache = currencyMapForExchangeCache;

    if (!_currencyMapForExchangeCache) {
      return console.error('[currency.exchange] currencyMapForExchangeCache not ready... please get currency map first!');
    }

    if (!_currencyExchangeCache[_sCid] || !_currencyExchangeCache[_sCid][_tCid]) {
      const _map = _currencyMapForExchangeCache;
      const _flatMap = _map['flatMap'];
      const _structureMap = _map['structureMap'];
      const _mainCurrencyList = Object.keys(_structureMap);

      let _sIndex = _sCid;
      let _tIndex = _tCid;

      // the list for initial _s from sorce, _t from target cid
      let _sList = [];
      let _sTypeList = [];
      let _sRateList = [];
      let _tList = [];
      let _tTypeList = [];
      let _tRateList = [];

      // the list remove duplicate cid (precisely rate), concat from _sList and _tList
      let _pList = [];
      let _pTypeList = [];
      let _pRateList = [];

      // the list remove duplicate type and cid, made from _pList
      let _list = [];
      let _typeList = [];
      let _rateList = [];

      // rate 
      let _pRate = 1;
      let _rate = 1;

      // get sCid currency list to main currency
      let _sStopFlag = false;
      do {
        _sList.push(_sIndex);
        _sTypeList.push(_flatMap[_sIndex]['type']);
        _sRateList.push(_flatMap[_sIndex]['rate']);

        if (!_flatMap[_sIndex]['main'])
          _sIndex = _flatMap[_sIndex]['to_cid'].toString();
        else
          _sStopFlag = true;
      } while (!_sStopFlag);

      // get tCid currency list to main currency
      let _tStopFlag = false;
      do {
        _tList.unshift(_tIndex);
        _tTypeList.unshift(_flatMap[_tIndex]['type']);
        _tRateList.unshift(1 / _flatMap[_tIndex]['rate']);

        if (!_flatMap[_tIndex]['main'])
          _tIndex = _flatMap[_tIndex]['to_cid'].toString();
        else
          _tStopFlag = true;

      } while (!_tStopFlag);

      // add main currency to list
      if (_sIndex != _tIndex) {
        let _sIndexOf = _mainCurrencyList.indexOf(_sIndex);
        let _tIndexOf = _mainCurrencyList.indexOf(_tIndex);

        if (_sIndexOf < _tIndexOf) {
          _mainCurrencyList.slice(_sIndexOf + 1, _tIndexOf).forEach(mCid => {
            _sList.push(mCid);
            _sTypeList.push(_flatMap[mCid]['type']);
            _sRateList.push(1 / _flatMap[mCid]['rate']);
          })
        } else {
          _mainCurrencyList.slice(_tIndexOf + 1, _sIndexOf).forEach(mCid => {
            _tList.unshift(mCid);
            _tTypeList.unshift(_flatMap[mCid]['type']);
            _tRateList.unshift(_flatMap[mCid]['rate']);
          })
        }
      }

      // initial _pList concat sList & tList
      _pList = [..._sList, ..._tList];
      _pTypeList = [..._sTypeList, ..._tTypeList];
      _pRateList = [..._sRateList, ..._tRateList];

      // remove duplicat path (precise rate path)
      let _pListCkeckIndex = 0;
      do {
        let _pListReverse = [..._pList].reverse();
        let _pListReverseCkeckIndex = (_pList.length - 1) - _pListReverse.indexOf(_pList[_pListCkeckIndex]);

        if (_pListReverseCkeckIndex - _pListCkeckIndex >= 1) {
          _pRateList[_pListCkeckIndex] = 1;
          _pRateList[_pListReverseCkeckIndex] = 1;
        }

        if (_pListReverseCkeckIndex - _pListCkeckIndex > 1) {
          let _spliceStart = _pListCkeckIndex + 1;
          let _spliceNumber = _pListReverseCkeckIndex - _spliceStart;
          _pList.splice(_spliceStart, _spliceNumber);
          _pTypeList.splice(_spliceStart, _spliceNumber);
          _pRateList.splice(_spliceStart, _spliceNumber);
        }


        _pListCkeckIndex += 1;
      } while (_pListCkeckIndex < _pList.length);


      // initial list
      _list = [..._pList];
      _typeList = [..._pTypeList];
      _rateList = [..._pRateList];

      // remove duplicat type (short type rate path)
      let _typeListCkeckIndex = 0;
      do {
        let _typeListReverse = [..._typeList].reverse();
        let _typeListReverseCkeckIndex = (_typeList.length - 1) - _typeListReverse.indexOf(_typeList[_typeListCkeckIndex]);

        if (_typeListReverseCkeckIndex - _typeListCkeckIndex > 1) {
          let _spliceStart = _typeListCkeckIndex + 1;
          let _spliceNumber = _typeListReverseCkeckIndex - _spliceStart;

          _list.splice(_spliceStart, _spliceNumber);
          _typeList.splice(_spliceStart, _spliceNumber);
          _rateList.splice(_spliceStart, _spliceNumber);
          _rateList[_typeListCkeckIndex] = 1;
        }
        _typeListCkeckIndex += 1;
      } while (_typeListCkeckIndex < _typeList.length);

      // caculate the rate
      _pRateList.forEach(r => {
        _pRate = _pRate * r;
      });
      _rateList.forEach(r => _rate = _pRate * r);

      // write sCid->tCid resualt the cache 
      _currencyExchangeCache[_sCid] = _currencyExchangeCache[_sCid] || {};
      _currencyExchangeCache[_sCid][_tCid] = {
        rate: _rate,
        track: _list,
        precise_rate: _pRate,
        precise_track: _pList,
        fromType: _flatMap[_sCid]['type'],
        toType: _flatMap[_tCid]['type']
      }

      // write tCid-> sCid resualt the cache 
      _currencyExchangeCache[_tCid] = _currencyExchangeCache[_tCid] || {};
      _currencyExchangeCache[_tCid][_sCid] = {
        rate: 1 / _rate,
        track: [..._list].reverse(),
        precise_rate: 1 / _pRate,
        precise_track: [..._pList].reverse(),
        fromType: _flatMap[_tCid]['type'],
        toType: _flatMap[_sCid]['type']
      }
    }

    let _cObj = _currencyExchangeCache[_sCid][_tCid];

    return {
      value: value * _cObj['rate'],
      track: _cObj['track'],
      precise_value: value * _cObj['precise_rate'],
      precise_track: _cObj['precise_track'],
      type: _cObj['toType']
    };
  }
}
