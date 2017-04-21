import { Injectable } from '@angular/core';
import { RequestHandler } from '../handler/request.handler';

var config = require('../config.json');

let cache = {
  'typeFlatMap' : null
};

@Injectable() export class TypeService {

  private endpoint = config.server_domain + '/type';

  constructor(private request: RequestHandler) {};

  async get(formObj ? : any) {
  	const _url = this.endpoint + '/get'
    return this.request.post(_url);
  }

  async getFlatMap(formObj ? : any) {
    const _formObj = formObj || {};

    console.log(cache['typeFlatMap'])
  	if( !_formObj.force &&  cache['typeFlatMap'])
  		return cache['typeFlatMap'];

    let _reObj = {};
  	const _url = this.endpoint + '/getMaps'
  	const _res = await this.request.post(_url);

    _res.forEach( ele => {
      _reObj[ele.tid] = _reObj[ele.tid] || {};
      _reObj[ele.tid][ele.sub_tid] = ele.sequence;
    });

    
    cache['typeFlatMap'] = _reObj;

    return  _reObj;
  }
}