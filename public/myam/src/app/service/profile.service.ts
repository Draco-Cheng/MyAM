import { Injectable } from '@angular/core';

import { ConfigHandler } from '../handler/config.handler';

@Injectable() export class ProfileService {

  constructor(
    private config: ConfigHandler
  ) {};

  getUserProfile() {
    return this.config.get('user');
  }

  getUserDatabase() {
    return this.config.get('database');
  }
}
