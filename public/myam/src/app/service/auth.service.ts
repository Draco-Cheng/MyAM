import { Injectable } from '@angular/core';

import { RequestHandler } from '../handler/request.handler';

import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';


var config = require('../config.json');

var User = {
  isLogin: true
};

@Injectable() export class AuthGuard implements CanActivate {

  constructor(private router: Router) {};

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    console.log('AuthGuard#canActivate called');
    return new Promise((resolve: Function, reject: Function) => {
      !User.isLogin && this.router.navigate(['/login']);
      resolve(User.isLogin);
    });
  }
}

export class AuthService {
  login(formObj: any) {

    console.log("[AuthService] login:", formObj);

    return new Promise(resolve => {
      User.isLogin = true;
      setTimeout(resolve, 3000);
    });
  }
}
