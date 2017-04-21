import { Injectable } from '@angular/core';

import { RequestHandler } from '../handler/request.handler';

var config = require('../config.json');

@Injectable() export class CurrencyService {

  constructor(private request: RequestHandler) {};

  private typeUrl = config.server_domain + '/currency/get';

  async get(formObj ? : any)  {
    return this.request.post(this.typeUrl);
  }
}
