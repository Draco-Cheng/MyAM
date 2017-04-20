import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';

import { Observable } from 'rxjs/Observable';

var config = require('../config.json');

@Injectable() export class RecordsService {

  private endpoint = config.server_domain + '/record'; // URL to web API

  constructor(public http: Http) {}

  headers = new Headers({
    'Content-Type': 'application/json'
  });

  async get(formObj ? : any) {
    const _url = this.endpoint + '/get';
    const _data = {
      db: config.database,
      orderBy: ["rid", "DESC"],
      limit: 10
    };

    return new Promise((resolve, reject) => {
      this.http.post(_url, JSON.stringify(_data), { headers: this.headers })
        .subscribe(
          data => {
            resolve(data.status == 200 ? data.json() : null );
          }
        );
    });

  }

  async set(recordObj ? : any) {
    const _url = this.endpoint + '/set';
    const _data = {
      db: config.database,
      rid: recordObj.rid,
      cashType: recordObj.cashType,
      cid: recordObj.cid,
      value: recordObj.value,
      memo: recordObj.memo,
      date: recordObj.date
    };

    return new Promise((resolve, reject) => {
      this.http.post(_url, JSON.stringify(_data), { headers: this.headers })
        .subscribe(
          data => {
            resolve(data.status == 200 ? data.json() : null );
          }
        );
    });
  };

  async setType(recordObj ? : any) {
    const _url = this.endpoint + '/setTypes';
    const _data = {
      db: config.database,
      rid: recordObj.rid,
      tids_json: recordObj.tids ? recordObj.tids.split(',') : []
    };

    return new Promise((resolve, reject) => {
      this.http.post(_url, JSON.stringify(_data), { headers: this.headers })
        .subscribe(
          data => {
            resolve(data.status == 200 ? data.json() : null );
          }
        );
    });
  };

  async del(recordObj ? : any) {
    const _url = this.endpoint + '/del';
    const _data = {
      db: config.database,
      rid: recordObj.rid
    };

    return new Promise((resolve, reject) => {
      this.http.post(_url, JSON.stringify(_data), { headers: this.headers })
        .subscribe(
          data => {
            resolve(data.status == 200 ? data.json() : null );
          }
        );
    });
  };
}
