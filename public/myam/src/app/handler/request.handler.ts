import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Md5 } from 'ts-md5/dist/md5';

var config = require('../config.json');

@Injectable() export class RequestHandler {
  constructor(public http: Http) {};


  headers = new Headers({
    'Content-Type': 'application/json'
  });

  encryptMD5(str){
    str = str.split("");
    var _tempStr = <string> Md5.hashStr("");
    for (var i = 0; i < str.length; i++)
      _tempStr = <string> Md5.hashStr(_tempStr + Md5.hashStr(str[i]));
    return Md5.hashStr(_tempStr);
  }

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
