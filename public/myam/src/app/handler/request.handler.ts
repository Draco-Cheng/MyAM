import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';

import { i18n } from '../i18n/i18n';

import { ConfigHandler } from './config.handler';
import { CryptHandler } from './crypt.handler';

var buildResObj = (arg0 ? , arg1 ? , arg2 ? ) => {
  let _obj = {
    success: null,
    code: null,
    message: null,
    data: null
  };

  _obj.success = arg0 == 200;
  _obj.code = arg0;

  if (arg2 === undefined) {
    if (typeof arg1 == 'string') {
      _obj.message = arg1;
      _obj.data = null;
    } else {
      _obj.message = '';
      _obj.data = arg1;
    }
  } else {
    _obj.message = arg1;
    _obj.data = arg2;
  }

  return _obj;
}

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

  async post(path: string, formObj ? : any) {
    let _data = formObj ? JSON.parse(JSON.stringify(formObj)) : {};
    let _salt = Date.now().toString();

    _data['db'] = (formObj && formObj['db']) || this.config.get('database');

    if (!_data['db']) {
      return { code: '401', message: 'NO_DB_SELECT', success: false, data: null };
    }

    this.headers.set('Auth-Salt', _salt);
    this.headers.set('Auth-Token', this.encrypt(this.authTokenBase + _salt));

    // <any[]> predefine resolve return value type
    return new Promise < any > ((resolve, reject) => {
      this.http.post(this.config.get('server_domain') + path, JSON.stringify(_data), { headers: this.headers })
        .subscribe(
          data => resolve(buildResObj(data.status, data.json())),
          error => {
            let _msg;
            try {
              _msg = i18n('ajax', error.json()['message']) || error.json()['message'];
            } catch (e) {
              _msg = error;
            };
            resolve(buildResObj(error.status, _msg))
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

  async download(path: string, formObj: {}) {
    let _salt = Date.now().toString();

    formObj['db'] = formObj['db'] || this.config.get('database');

    return new Promise((resolve, reject) => {

      var xhttp = new XMLHttpRequest();
      xhttp.open("POST", this.config.get('server_domain') + path, true);
      xhttp.responseType = "blob";
      xhttp.onreadystatechange = () => {
        if (xhttp.readyState == 4) {
          if (xhttp.status == 200) {
            this.downloadFile(xhttp.getResponseHeader('x-filename'), xhttp.response);
          }

          let _res;
          try {
            let _msg = JSON.parse(xhttp.response)['message'];
            _res = i18n('ajax', _msg) || _msg;
          } catch (e) {
            _res = xhttp.response;
          }

          resolve(buildResObj(xhttp.status, _res));
        }
      };

      xhttp.setRequestHeader('Auth-UID', this.headers.get('Auth-UID'));
      xhttp.setRequestHeader('Auth-Salt', _salt);
      xhttp.setRequestHeader('Auth-Token', this.encrypt(this.authTokenBase + _salt));
      xhttp.setRequestHeader('Content-Type', 'application/json');

      xhttp.send(JSON.stringify(formObj));
    });
  }

  async upload(path: string, formObj: {}) {
    let _salt = Date.now().toString();
    let _formData = new FormData();
    let _self = this;

    return new Promise((resolve, reject) => {

      var xhttp = new XMLHttpRequest();

      xhttp.upload.addEventListener("progress", evt => {
        if (evt.lengthComputable) {
          console.log('Upload progress: ', evt.loaded + '/' + evt.total)
        } else {
          // No data to calculate on
        }
      }, false);

      xhttp.addEventListener("load", () => {
        let _res;
        try {
          let _msg = JSON.parse(xhttp.response)['message'];
          _res = i18n('ajax', _msg) || _msg;
        } catch (e) {
          _res = xhttp.response;
        }

        resolve(buildResObj(xhttp.status, _res));
      }, false);

      xhttp.open('POST', this.config.get('server_domain') + path, true);
      xhttp.setRequestHeader('Auth-UID', this.headers.get('Auth-UID'));
      xhttp.setRequestHeader('Auth-Salt', _salt);
      xhttp.setRequestHeader('Auth-Token', this.encrypt(this.authTokenBase + _salt));
      xhttp.onload = function(e) {};

      for (let _key in formObj) {
        _formData.append(_key, formObj[_key]);
      }

      xhttp.send(_formData); // multipart/form-data
    });
  }


  async login(path: string, formObj: any) {
    let _data = {};
    let _salt = Date.now();
    let _formObj = formObj ? JSON.parse(JSON.stringify(formObj)) : {};

    _data['acc'] = _formObj['acc'];
    _data['salt'] = _salt;
    _data['token'] = this.encrypt(this.encrypt(_formObj['pwd']) + _salt);
    _data['keep'] = _formObj['keep'];

    // <any[]> predefine resolve return value type
    return new Promise < any > ((resolve, reject) => {
      this.http.post(this.config.get('server_domain') + path, JSON.stringify(_data), { headers: this.headers })
        .subscribe(
          data => {
            let _data = data.json();
            let _uid = _data['uid'];

            this.authTokenBase = this.encrypt(_salt + this.encrypt(_formObj['pwd']));

            if (_formObj['keep']) {
              localStorage.setItem('token', _uid + ',' + this.encrypt(_salt + _salt + this.encrypt(_formObj['pwd'])));
            } else {
              localStorage.removeItem('token');
            }

            this.headers.set('Auth-UID', _data['uid']);

            resolve(buildResObj(data.status, _data));
          }, error => {
            let _msg;
            try {
              _msg = i18n('ajax', error.json()['message']) || error.json()['message'];
            } catch (e) {
              _msg = error;
            };
            resolve(buildResObj(error.status, _msg))
          });
    });
  };

  async loginByToken(path: string, formObj: any) {
    let _data = {};
    let _salt = Date.now();
    let _formObj = formObj ? JSON.parse(JSON.stringify(formObj)) : {};

    _data['uid'] = _formObj['uid'];
    _data['salt'] = _salt;
    _data['token'] = this.encrypt(_formObj['token'] + _salt);


    // <any[]> predefine resolve return value type
    return new Promise < any > ((resolve, reject) => {
      this.http.post(this.config.get('server_domain') + path, JSON.stringify(_data), { headers: this.headers })
        .subscribe(
          data => {
            let _data = data.json();
            let _uid = _data['uid'];

            this.authTokenBase = this.encrypt(_salt + _formObj['token']);
            localStorage.setItem('token', _uid + ',' + this.encrypt(_salt + _salt + _formObj['token']));

            this.headers.set('Auth-UID', _data['uid']);

            resolve(buildResObj(data.status, _data));
          }, error => {
            let _msg;
            try {
              _msg = i18n('ajax', error.json()['message']) || error.json()['message'];
            } catch (e) {
              _msg = error;
            };
            resolve(buildResObj(error.status, _msg))
          });
    });
  }

};
