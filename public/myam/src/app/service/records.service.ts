import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';

import { Observable } from 'rxjs/Observable';

var config = require('../config.json');

@Injectable() export class RecordsService {

  private recordUrl = config.server_domain + '/record/get'; // URL to web API

  constructor(public http: Http) {}

  headers = new Headers({
    'Content-Type': 'application/json'
  });

  async get(formObj ? : any) {
    let head = new Headers({
      'Content-Type': 'application/json'
    });

    const _data = {
      db: config.database,
      orderBy: ["rid", "DESC"],
      limit:10
    };

    return new Promise((resolve, reject) => {
      this.http.post(this.recordUrl, JSON.stringify(_data), { headers: this.headers })
        .subscribe(
          data => {
            resolve(data.json());
          }
        );
    });

  }
}
