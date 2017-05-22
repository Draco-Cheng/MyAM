import { Injectable } from '@angular/core';

var callbackPool = {};

@Injectable() export class NotificationHandler {
  constructor() {};



  broadcast(type: string, msg: string) {
    const _keys = Object.keys(callbackPool);

    console.info('[NotificationHandler] Broadcast to ' + _keys.length + ' clients, msg: [' + type + '] ' + msg);

    _keys.forEach(key => callbackPool[key](type, msg));
  }

  registCallback(callback: Function) {
    const _t = Date.now();
    callbackPool[_t] = callback;
    return _t;
  }

  unregistCallback(id) {
    delete callbackPool[id]
  }
};
