import { Component, Input } from '@angular/core';


import './currency-map.style.less';

@Component({
  selector: '[currency-map]',
  template: require('./currency-map.template.html'),
  providers: []
})

export class CurrencyMapDirectiveComponent {
  @Input() currentNode ? : any;
  @Input() currencyStructureMap ? : any;
  @Input() currencyFlatMap ? : any;
  @Input() callback: any;
  @Input() inputCid ? : any;

  constructor() {};

  select() {
    if(this.currentNode.cid != this.inputCid) {
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
