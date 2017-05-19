import { Injectable } from '@angular/core';

import { ConfigHandler } from '../handler/config.handler';
import { RequestHandler } from '../handler/request.handler';
import { NotificationHandler } from '../handler/notification.handler';

@Injectable() export class RecordsService {

  constructor(
    private request: RequestHandler,
    private config: ConfigHandler,
    private notificationHandler: NotificationHandler
  ) {};

  private endpoint = '/record'; // URL to web API

  async get(formObj ? : any) {
    const _url = this.endpoint + '/get';
    const _data = formObj || { orderBy: ['rid', 'DESC'], limit: 10 };

    let _resault = < any[] > await this.request.post(_url, _data);

    if (_resault['success']) {
      _resault['data'].forEach(record => {
        let _map = {};
        record.tids = record.tids ? record.tids.split(",") : [];
        record.tids.forEach(tid => _map[tid] = true);
        record.tidsObjMap = _map;
      });
    } else {
      this.notificationHandler.broadcast('error', _resault['message']);
    }

    return _resault;
  }

  async set(recordObj ? : any) {
    const _url = this.endpoint + '/set';
    const _data = {
      rid: recordObj.rid,
      cashType: recordObj.cashType,
      cid: recordObj.cid,
      value: recordObj.value,
      memo: recordObj.memo,
      date: recordObj.date
    };

    const _resault = await this.request.post(_url, _data);

    if (!_resault['success'])
      this.notificationHandler.broadcast('error', _resault['message']);

    return _resault;
  };

  async setType(rid: string, tids) {
    const _url = this.endpoint + '/setTypes';
    const _data = {
      rid: rid,
      tids_json: tids
    };

    const _resault = await this.request.post(_url, _data);

    if (!_resault['success'])
      this.notificationHandler.broadcast('error', _resault['message']);

    return _resault;
  };

  async del(recordObj ? : any) {
    const _url = this.endpoint + '/del';
    const _data = {
      rid: recordObj.rid
    };

    const _resault = await this.request.post(_url, _data);

    if (!_resault['success'])
      this.notificationHandler.broadcast('error', _resault['message']);

    return _resault;
  };
}
