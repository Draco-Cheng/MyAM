import { Injectable } from '@angular/core';
import { RequestHandler } from '../handler/request.handler';

var config = require('../config.json');

@Injectable() export class RecordsService {

  constructor(private request: RequestHandler) {};

  private endpoint = config.server_domain + '/record'; // URL to web API

  async get(formObj ? : any) {
    const _url = this.endpoint + '/get';
    const _data = {
      orderBy: ["rid", "DESC"],
      limit: 10
    };

    return this.request.post(_url, _data);

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

    return this.request.post(_url, _data);
  };

  async setType(recordObj ? : any) {
    const _url = this.endpoint + '/setTypes';
    const _data = {
      rid: recordObj.rid,
      tids_json: recordObj.tids ? recordObj.tids.split(',') : []
    };

    return this.request.post(_url, _data);
  };

  async del(recordObj ? : any) {
    const _url = this.endpoint + '/del';
    const _data = {
      rid: recordObj.rid
    };

    return this.request.post(_url, _data);
  };
}
