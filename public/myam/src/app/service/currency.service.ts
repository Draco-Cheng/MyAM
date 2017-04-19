import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';

var config = require('../config.json');

@Injectable() export class CurrencyService {

  private typeUrl = config.server_domain + '/currency/get';

  constructor(public http: Http) {}

  headers = new Headers({
    'Content-Type': 'application/json'
  });

  async get(formObj ? : any)  {
    let head = new Headers({
      'Content-Type': 'application/json'
    });

    const _data = {
      db: config.database
    };

    // <any[]> predefine resolve return value type
    return new Promise<any[]>((resolve, reject) => {
      this.http.post(this.typeUrl, JSON.stringify(_data), { headers: this.headers })
        .subscribe(
          data => {
            resolve(data.json());
          }
        );
    });

  }
}
