import { Injectable } from '@angular/core';

import { ConfigHandler } from '../handler/config.handler';
import { RequestHandler } from '../handler/request.handler';
import { CacheHandler } from '../handler/cache.handler';
import { NotificationHandler } from '../handler/notification.handler';

let tidRelatedCache = {
  'nodeAllParents': {},
  'nodeAllChilds': {}
};

@Injectable() export class TypeService {

  private endpoint = '/type';

  constructor(
    private request: RequestHandler,
    private cacheHandler: CacheHandler,
    private config: ConfigHandler,
    private notificationHandler: NotificationHandler
  ) {};

  wipe(id ? : String) {
    if (id) {
      this.cacheHandler.wipe(id);
    } else {
      this.cacheHandler.wipe('type');
      this.cacheHandler.wipe('type.flatmap');
    }

    tidRelatedCache['nodeAllParents'] = {};
    tidRelatedCache['nodeAllChilds'] = {};
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

      if (_resault['success'])
        return _resolveCache(_resault['data']);
      else
        this.notificationHandler.broadcast('error', _resault['message']);

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
      const _resault = < any[] > await this.request.post(_url);

      if (_resault['success']) {
        _resault['data'].forEach(ele => {
          _reObj[ele.tid] = _reObj[ele.tid] || { childs: {}, parents: {} };
          _reObj[ele.tid]['childs'][ele.sub_tid] = ele.sequence || 1;

          _reObj[ele.sub_tid] = _reObj[ele.sub_tid] || { childs: {}, parents: {} };
          _reObj[ele.sub_tid]['parents'][ele.tid] = ele.sequence || 1;
        });

        return _resolveCache(_reObj);
      } else {
        this.notificationHandler.broadcast('error', _resault['message']);
      }
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

    if (_resault['success']) {
      this.wipe();
      this.notificationHandler.broadcast('success', 'Updated success!');
    } else {
      this.notificationHandler.broadcast('error', _resault['message']);
    }
  }

  async add(formObj ? : any) {
    const _urlSet = this.endpoint + '/set';
    const _urlSetMap = this.endpoint + '/setMaps';
    const _parentsArr = Object.keys(formObj.parents);

    const _dataSet = {
      tid: formObj.tid,
      type_label: formObj.type_label,
      cashType: formObj.cashType,
      master: formObj.master ? 1 : 0,
      quickSelect: formObj.quickSelect ? 1 : 0,
      showInMap: formObj.showInMap ? 1 : 0
    };
    const _resault = await this.request.post(_urlSet, _dataSet);
    const _tid = _resault['data'][0]['tid'];

    if (!_resault['success']) {
      this.notificationHandler.broadcast('error', _resault['message']);
      return _resault;
    }

    for (let _i = 0; _i < _parentsArr.length; _i++) {
      const _ptid = _parentsArr[_i];
      const _dataSetMap = {
        tid: _ptid,
        sub_tid: _tid
      };

      let _resaultSetMap = await this.request.post(_urlSetMap, _dataSetMap);

      if (!_resaultSetMap['success']) {
        this.notificationHandler.broadcast('error', _resaultSetMap['message']);
      } else {
        this.notificationHandler.broadcast('success', 'Add success!');
      }
    }

    this.wipe();
    return _resault;
  }

  async del(del_tid) {
    const _url = this.endpoint + '/del'
    const _data = {
      del_tid: del_tid
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


  async unlinkParant(p_tid, c_tid) {
    const _url = this.endpoint + '/delMaps'
    const _data = {
      del_tid: p_tid,
      del_sub_tid: c_tid
    }
    const _resault = await this.request.post(_url, _data);


    if (_resault['success'])
      this.wipe('type.flatmap');
    else
      this.notificationHandler.broadcast('error', _resault['message']);

    return _resault;
  }

  async linkParant(p_tid, c_tid) {
    const _url = this.endpoint + '/setMaps'
    const _data = {
      tid: p_tid,
      sub_tid: c_tid
    }
    const _resault = await this.request.post(_url, _data);

    if (_resault['success'])
      this.wipe('type.flatmap');
    else
      this.notificationHandler.broadcast('error', _resault['message']);

    return _resault;
  }

  async getNodeAllParents(tid) {
    if (!tidRelatedCache['nodeAllParents'][tid]) {
      let _map = (await this.getFlatMap())['data'];
      let _arr = [];
      this.getNodeAllParentsRecursive(_map, _arr, tid);
      tidRelatedCache['nodeAllParents'][tid] = _arr;
    }
    return tidRelatedCache['nodeAllParents'][tid];
  }
  getNodeAllParentsRecursive(map, arr, tid) {
    if (!map[tid] || !map[tid]['parents'] || arr.indexOf(tid) != -1) return;
    let _keys = Object.keys(map[tid]['parents']);
    arr.push(tid);
    _keys.forEach(k => {
      if (arr.indexOf(k) == -1) {
        this.getNodeAllParentsRecursive(map, arr, k);
      }
    });
  }

  async getNodeAllChilds(tid) {
    if (!tidRelatedCache['nodeAllChilds'][tid]) {
      let _map = (await this.getFlatMap())['data'];
      let _arr = [];
      this.getNodeAllChildsRecursive(_map, _arr, tid);
      tidRelatedCache['nodeAllChilds'][tid] = _arr;
    }
    return tidRelatedCache['nodeAllChilds'][tid];
  }
  getNodeAllChildsRecursive(map, arr, tid) {
    if (!map[tid] || !map[tid]['childs'] || arr.indexOf(tid) != -1) return;
    arr.push(tid);
    let _keys = Object.keys(map[tid]['childs']);
    _keys.forEach(k => {
      if (arr.indexOf(k) == -1) {
        this.getNodeAllChildsRecursive(map, arr, k);
      }
    });
  }
}