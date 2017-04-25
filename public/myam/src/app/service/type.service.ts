import { Injectable } from '@angular/core';
import { RequestHandler } from '../handler/request.handler';

var config = require('../config.json');

let cache = {
  'type': null,
  'typeFlatMap': null
};

@Injectable() export class TypeService {

  private endpoint = config.server_domain + '/type';

  constructor(private request: RequestHandler) {};

  wipe() {
    for (let _key in cache) {
      delete cache[_key];
    }
  }

  async get(formObj ? : any) {

    if (cache['type'])
      return cache['type'];

    const _url = this.endpoint + '/get'

    return cache['type'] = this.request.post(_url);
  }

  async getFlatMap(formObj ? : any) {

    if (cache['typeFlatMap'])
      return cache['typeFlatMap'];

    let _reObj = {};
    const _formObj = formObj || {};
    const _url = this.endpoint + '/getMaps'
    const _res = await this.request.post(_url);

    _res.forEach(ele => {
      _reObj[ele.tid] = _reObj[ele.tid] || {};
      _reObj[ele.tid][ele.sub_tid] = ele.sequence;
    });

    return cache['typeFlatMap'] = _reObj;
  }
}
