import { Injectable } from '@angular/core';

import { RequestHandler } from '../handler/request.handler';
import { ConfigHandler } from '../handler/config.handler';

import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';


@Injectable() export class AuthService {

  private endpoint = this.config.get('server_domain') + '/auth';

  constructor(
    private router: Router,
    private config: ConfigHandler,
    private request: RequestHandler
  ) {};

  async setConfigUserDb(userProfile) {
    this.config.set('user', userProfile);
    this.config.set('uid', userProfile['uid']);
    this.config.set('isLogin', true);

    let _uid = userProfile['uid'];
    let _dbList = userProfile['dbList'];

    if (_dbList.length) {
      this.config.set('database', localStorage.getItem(_uid + '.db') || _dbList[0]);
    }
  }

  async login(formObj: any) {
    const _url = this.endpoint + '/login';
    console.log("[AuthService] login:", formObj);

    let _res = await this.request.login(_url, formObj);

    if (_res) {
      await this.setConfigUserDb(_res);
      this.router.navigate(['/dashboard']);
    }
  }

  async loginByToken() {
    const _url = this.endpoint + '/login';
    const _loginInfo = localStorage.getItem('token').split(',');
    let _res = await this.request.loginByToken(_url, { uid: _loginInfo[0], token: _loginInfo[1] });

    if (_res)
      await this.setConfigUserDb(_res);

    return !!_res;
  }

  async logout() {
    const _url = this.endpoint + '/logout';
    console.log("[AuthService] logout");

    let _res = await this.request.post(_url);

    if (_res) {
      localStorage.removeItem('token');
    }
  }
}

@Injectable() export class AuthGuard implements CanActivate {
  private endpoint = this.config.get('server_domain') + '/auth';

  constructor(
    private router: Router,
    private config: ConfigHandler,
    private request: RequestHandler,
    private authService: AuthService
  ) {};

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    console.log('AuthGuard#canActivate called');
    return new Promise(async(resolve: Function, reject: Function) => {
      if (this.config.get('isLogin')) {
        return resolve(true);
      }

      if (localStorage.getItem('token') && await this.authService.loginByToken()) {
        return resolve(true);
      }

      localStorage.removeItem('token');

      this.router.navigate(['/login']);
      resolve(false);

    });
  }
}
