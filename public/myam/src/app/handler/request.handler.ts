import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';

var config = require('../config.json');

@Injectable() export class RequestHandler {
  constructor(public http: Http) {}

  headers = new Headers({
    'Content-Type': 'application/json'
  });

  async post(url: string, formObj ? : any) {
    let _data = formObj ? JSON.parse(JSON.stringify(formObj)) : {};

    _data.db = config.database;

    // <any[]> predefine resolve return value type
    return new Promise < any[] > ((resolve, reject) => {
      this.http.post(url, JSON.stringify(_data), { headers: this.headers })
        .subscribe(
          data => {
            resolve(data.status == 200 ? data.json() : null);
          }
        );
    });
  };
};
