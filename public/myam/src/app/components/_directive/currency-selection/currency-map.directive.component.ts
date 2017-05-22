import { Component, Input } from '@angular/core';


import './currency-map.style.less';

@Component({
  selector: '[currency-map]',
  template: require('./currency-map.template.html'),
  providers: []
})

export class CurrencyMapDirectiveComponent {
  //*************************************
  // Note for who want to use this module
  //-------------------------------------
  // neceesary input
  @Input() callback: Function;
  @Input() currencyStructureMap ? : Object;
  @Input() currencyFlatMap ? : Object;
  //*************************************
  // optional input
  @Input() inputCid ? : any;
  //*************************************
  // internal input
  @Input() currentNode ? : any;
  //*************************************

  constructor() {};

  select() {
    if (this.currentNode.cid != this.inputCid) {
      this.callback(this.currentNode.cid);
      this.inputCid = this.currentNode.cid;
    }
  }

  objKeys(obj) {
    return Object.keys(obj);
  };

  getType(tid) {
    return this.currencyFlatMap[tid].type;
  }

}
