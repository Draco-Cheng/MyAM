import { Component, Input } from '@angular/core';


import { CurrencyService } from '../../../service/currency.service';

import './currency-edit-map.style.less';

const currencyList = require('../currency.list.json');

@Component({
  selector: '[currency-edit-map]',
  template: require('./currency-edit-map.template.html'),
  providers: []
})

export class CurrencyEditMapDirectiveComponent {
  @Input() currentNode ? : any;
  @Input() currencyStructureMap ? : any;
  @Input() currencyFlatMap ? : any;

  private currencyList = currencyList;

  constructor(
    private currencyService: CurrencyService
  ) {};

  objKeys(obj) {
    return Object.keys(obj);
  };

  getType( tid ) {
    return this.currencyFlatMap[tid].type;
  }

  getSelectionCallback(currency){
    return cid => {
      currency.to_cid = cid;
    }
  }

  async del(node) {
    let _resault = await this.currencyService.del(node.cid);
  }

  async save(node){
    let _resault = await this.currencyService.set(node);
    node.isChange = false;
  }
}
