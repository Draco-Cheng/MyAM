import { Component } from '@angular/core';

@Component({
  selector: 'navView',
  template: require('./nav.template.html')
})
export class NavComponent { name = 'MyAM'; }
