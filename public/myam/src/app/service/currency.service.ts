import { Injectable } from '@angular/core';

import { RequestHandler } from '../handler/request.handler';

var config = require('../config.json');

let cache = {
  'currency': null
};

@Injectable() export class CurrencyService {

  private endpoint = config.server_domain + '/currency';

  constructor(private request: RequestHandler) {};

  wipe() {
    for (let _key in cache) {
      delete cache[_key];
    }
  }

  async get(formObj ? : any) {

    if (cache['currency'])
      return cache['currency'];

    const _url = this.endpoint + '/get'

    return cache['currency'] = this.request.post(_url);
  }
}
