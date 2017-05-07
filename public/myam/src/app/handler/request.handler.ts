import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { ConfigHandler } from './config.handler';
import { CryptHandler } from './crypt.handler';



@Injectable() export class RequestHandler {
  private encrypt;
  private authTokenBase;

  constructor(
    public http: Http,
    private config: ConfigHandler,
    private cryptHandler: CryptHandler
  ) {
    this.encrypt = cryptHandler.encrypt;
  };

  headers = new Headers({
    'Content-Type': 'application/json'
  });

  async post(url: string, formObj ? : any) {
    let _data = formObj ? JSON.parse(JSON.stringify(formObj)) : {};
    let _salt = Date.now().toString();

    _data['db'] = this.config.get('database');

    this.headers.set('Auth-Salt', _salt);
    this.headers.set('Auth-Token', this.encrypt(this.authTokenBase + _salt));

    // <any[]> predefine resolve return value type
    return new Promise < any[] > ((resolve, reject) => {
      this.http.post(url, JSON.stringify(_data), { headers: this.headers })
        .subscribe(
          data => {
            resolve(data['status'] == 200 ? data.json() : null);
          }
        );
    });
  };

  async login(url: string, formObj: any) {
    let _data = {};
    let _salt = Date.now();
    let _formObj = formObj ? JSON.parse(JSON.stringify(formObj)) : {};

    _data['acc'] = _formObj['acc'];
    _data['salt'] = _salt;
    _data['token'] = this.encrypt(this.encrypt(_formObj['pwd']) + _salt);
    _data['keep'] = _formObj['keep'];

    // <any[]> predefine resolve return value type
    return new Promise < any[] > ((resolve, reject) => {
      this.http.post(url, JSON.stringify(_data), { headers: this.headers })
        .subscribe(
          data => {
            if (data.status == 200) {
              let _data = data.json();
              let _uid = _data['uid'];

              this.authTokenBase = this.encrypt(_salt + this.encrypt(_formObj['pwd']));

              if (_formObj['keep']) {
                localStorage.setItem('token', _uid + ',' + this.encrypt(_salt + _salt + this.encrypt(_formObj['pwd'])));
              }

              this.headers.set('Auth-UID', _data['uid']);

              resolve(_data);
            } else {
              resolve(null);
            }
          }
        );
    });
  };

  async loginByToken(url: string, formObj: any) {
    let _data = {};
    let _salt = Date.now();
    let _formObj = formObj ? JSON.parse(JSON.stringify(formObj)) : {};

    _data['uid'] = _formObj['uid'];
    _data['salt'] = _salt;
    _data['token'] = this.encrypt(_formObj['token'] + _salt);

    // <any[]> predefine resolve return value type
    return new Promise < any[] > ((resolve, reject) => {
      this.http.post(url, JSON.stringify(_data), { headers: this.headers })
        .subscribe(
          data => {
            if (data.status == 200) {
              let _data = data.json();
              let _uid = _data['uid'];

              this.authTokenBase = this.encrypt(_salt + _formObj['token']);
              localStorage.setItem('token', _uid + ',' + this.encrypt(_salt + _salt + _formObj['token']));

              this.headers.set('Auth-UID', _data['uid']);

              resolve(_data);
            } else {
              resolve(null);
            }
          }
        );
    });
  };
};
