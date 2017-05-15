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


  async login(formObj: any) {
    const _url = this.endpoint + '/login';
    console.log("[AuthService] login:", formObj);

    let _res = await this.request.login(_url, formObj);

    if (_res) {
      await this.config.setUserProfile(_res);

      this.router.navigate(_res['dbList'].length ? ['/dashboard'] : ['/profile']);
    }
  }

  async loginByToken() {
    const _url = this.endpoint + '/login';
    const _loginInfo = localStorage.getItem('token').split(',');
    let _res = await this.request.loginByToken(_url, { uid: _loginInfo[0], token: _loginInfo[1] });

    if (_res) {
      await this.config.setUserProfile(_res);
      !_res['dbList'].length && this.router.navigate(['/profile']);
    }

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
