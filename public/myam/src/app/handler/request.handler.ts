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

    _data['db'] = (formObj && formObj['db']) || this.config.get('database');

    if (!_data['db']) {
      return { code: '401', message: 'NO_DB_SELECT', success: false, data:  null};
    }

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

  downloadFile(fileName, data) {
    var blob = new Blob([data], { type: 'multipart/form-data' });
    var url = window.URL.createObjectURL(data);
    var a = document.createElement("a");

    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  async download(url: string, formObj: {}) {
    let _salt = Date.now().toString();

    formObj['db'] = formObj['db'] || this.config.get('database');

    // <any[]> predefine resolve return value type
    return new Promise < any[] > ((resolve, reject) => {

      var xhttp = new XMLHttpRequest();
      xhttp.open("POST", url, true);
      xhttp.responseType = "blob";
      xhttp.onreadystatechange = () => {
        if (xhttp.readyState == 4 && xhttp.status == 200) {
          this.downloadFile(xhttp.getResponseHeader('x-filename'), xhttp.response)
        }
      };

      xhttp.setRequestHeader('Auth-UID', this.headers.get('Auth-UID'));
      xhttp.setRequestHeader('Auth-Salt', _salt);
      xhttp.setRequestHeader('Auth-Token', this.encrypt(this.authTokenBase + _salt));
      xhttp.setRequestHeader('Content-Type', 'application/json');

      xhttp.send(JSON.stringify(formObj));
      // this.http.post(url, JSON.stringify(_data), { headers: this.headers })
      //   .subscribe(res => {
      //     //this.downloadFile(res['_body']);
      //     var contentDisposition = res.headers.get('Content-Disposition');
      //     console.log('contentDisposition', window['a'] = res)
      //   });
    });
  }


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
              } else {
                localStorage.removeItem('token');
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
          }, error => {
            resolve(null);
          });
    });
  }

};
