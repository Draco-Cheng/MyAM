import { Injectable } from '@angular/core';

import { RequestHandler } from '../handler/request.handler';
import { CacheHandler } from '../handler/cache.handler';
import { NotificationHandler } from '../handler/notification.handler';

let tidRelatedCache = {
  'nodeAllParentsInTree': {},
  'nodeAllChildsInTree': {},
  'tidToLabelMap': null,
  'rootChildsInNextLayer': {
    'enableShowInMap': null,
    'disableShowInMap': null
  }
};

@Injectable() export class TypeService {

  private endpoint = '/type';

  constructor(
    private request: RequestHandler,
    private cacheHandler: CacheHandler,
    private notificationHandler: NotificationHandler
  ) {};

  wipe(id ? : String) {
    if (id) {
      this.cacheHandler.wipe(id);
    } else {
      this.cacheHandler.wipe('type');
      this.cacheHandler.wipe('type.flat');
      this.cacheHandler.wipe('type.flatmap');
    }

    tidRelatedCache['nodeAllParentsInTree'] = {};
    tidRelatedCache['nodeAllChildsInTree'] = {};
    tidRelatedCache['rootChildsInNextLayer'] = null;
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

      if (_resault['success']) {
        this.buildTidToLabelMap(_resault['data']);
        return _resolveCache(_resault['data']);
      } else {
        this.notificationHandler.broadcast('error', _resault['message']);
      }
    }
  }

  async getTypeFlat() {
    const _cacheName = 'type.flat';
    const _cache = await this.cacheHandler.get(_cacheName, true);

    if (_cache.status == 1) {
      return _cache;
    } else {
      const _resolveCache = this.cacheHandler.regAsyncReq(_cacheName);
      const _typeData = (await this.get())['data'];

      let _typeFlat = {};

      _typeData.forEach(element => {
        _typeFlat[element.tid] = element;
      });

      return _resolveCache(_typeFlat);
    }
  }

  buildTidToLabelMap(typeData) {
    tidRelatedCache['tidToLabelMap'] = tidRelatedCache['tidToLabelMap'] || {};
    typeData.forEach(type => tidRelatedCache['tidToLabelMap'][type.tid] = type.type_label);
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

  async getAllParentsInTree(tid) {
    if (!tidRelatedCache['nodeAllParentsInTree'][tid]) {
      let _map = (await this.getFlatMap())['data'];
      let _arr = [];
      this.getAllParentsInTreeRecursive(_map, _arr, tid);
      tidRelatedCache['nodeAllParentsInTree'][tid] = _arr;
    }
    return tidRelatedCache['nodeAllParentsInTree'][tid];
  }
  getAllParentsInTreeRecursive(map, arr, tid) {
    if (!map[tid] || !map[tid]['parents'] || arr.indexOf(tid) != -1) return;
    let _keys = Object.keys(map[tid]['parents']);
    arr.push(tid);
    _keys.forEach(k => {
      if (arr.indexOf(k) == -1) {
        this.getAllParentsInTreeRecursive(map, arr, k);
      }
    });
  }

  async getAllChildsInTree(tid) {
    if (!tidRelatedCache['nodeAllChildsInTree'][tid]) {
      let _map = (await this.getFlatMap())['data'];
      let _arr = [];
      this.getAllChildsInTreeRecursive(_map, _arr, tid);
      tidRelatedCache['nodeAllChildsInTree'][tid] = _arr;
    }
    return tidRelatedCache['nodeAllChildsInTree'][tid];
  }
  getAllChildsInTreeRecursive(map, arr, tid) {
    if (!map[tid] || !map[tid]['childs'] || arr.indexOf(tid) != -1) return;
    arr.push(tid);
    let _keys = Object.keys(map[tid]['childs']);
    _keys.forEach(k => {
      if (arr.indexOf(k) == -1) {
        this.getAllChildsInTreeRecursive(map, arr, k);
      }
    });
  }

  async getChildsInNextLayer(tid ? : number, disableShowInMap ? : boolean) {
    if (!tid) {
      const _cacheType = disableShowInMap ? 'disableShowInMap' : 'enableShowInMap';
      if (tidRelatedCache['rootChildsInNextLayer'][_cacheType]) {
        return tidRelatedCache['rootChildsInNextLayer'][_cacheType];
      } else {
        let _flatMap = (await this.getFlatMap())['data'];
        let _types = (await this.get())['data'];

        let _returnObj = {
          childs: [],
          unclassified: []
        };

        _types.forEach(_type => {
          let _tidInLoop = _type['tid'];

          if (!disableShowInMap && !_type['showInMap']) return;

          if (_type['master']) {
            _returnObj.childs.push(_tidInLoop);
          } else if (!_flatMap[_tidInLoop] || Object.keys(_flatMap[_tidInLoop].parents).length === 0) {
            _returnObj.unclassified.push(_tidInLoop);
          }
        });

        return tidRelatedCache['rootChildsInNextLayer'][_cacheType] = _returnObj;
      }
    } else {
      const _flatMap = (await this.getFlatMap())['data'];
      const _types = (await this.get())['data'];

      if (!_flatMap[tid]) return [];

      if (disableShowInMap) {
        return { 'childs': Object.keys(_flatMap[tid].childs) };
      } else {
        return { 'childs': Object.keys(_flatMap[tid].childs).filter(_tid => _types[_tid]['showInMap']) };
      }
    }
  }

  tidToLable(tid) {
    if (!tidRelatedCache['tidToLabelMap']) {
      console.error('[type.server] tidToLabelMap not ready yet, please at least trigger type.get once time.');
      return '';
    } else {
      return tidRelatedCache['tidToLabelMap'][tid];
    }
  }
}