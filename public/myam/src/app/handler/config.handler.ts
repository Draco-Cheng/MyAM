import { Injectable } from '@angular/core';

var config = require('../config.json');

function cloneObj(obj) {
  return JSON.parse(JSON.stringify(obj));
};

@Injectable() export class ConfigHandler {
  constructor() {};

  get(name: string) {
    return typeof config[name] == 'object' ? cloneObj(config[name]) : config[name];
  }

  set(name: string, data) {
    config[name] = typeof data == 'object' ? cloneObj(data) : data;
  }
};
