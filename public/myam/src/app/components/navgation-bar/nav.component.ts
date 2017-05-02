import { Component } from '@angular/core';

import './nav.style.less';

@Component({
  selector: 'navView',
  template: require('./nav.template.html')
})
export class NavComponent { 
	private name = 'MyAM';

	currencySelect(tid) {
	}
}
