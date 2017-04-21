import { Injectable } from '@angular/core';
import { RequestHandler } from '../handler/request.handler';

var config = require('../config.json');

@Injectable() export class TypeService {

  private typeUrl = config.server_domain + '/type/get';

  constructor(private request: RequestHandler) {};

  headers = new Headers({
    'Content-Type': 'application/json'
  });

  async get(formObj ? : any) {
    return this.request.post(this.typeUrl);
  }
}
