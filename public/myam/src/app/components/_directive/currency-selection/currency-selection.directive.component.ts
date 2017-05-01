import { Component, Input, ElementRef, ViewChild } from '@angular/core';

import { CurrencyMapDirectiveComponent } from './currency-map.directive.component';

import { CurrencyService } from '../../../service/currency.service';

import './currency-selection.style.less';

@Component({
  selector: '[currency-selection]',
  template: require('./currency-selection.template.html'),
  providers: [CurrencyService],

})

export class CurrencySelectionDirectiveComponent {
  //*************************************
  // Note for who want to use this module
  //-------------------------------------
  // neceesary input
  @Input() callback: Function;
  //*************************************
  // optional input
  @Input() inputCid ? : any;
  //*************************************


  @ViewChild('currencySelectInput') currencySelectInput: ElementRef;

  private __isInit = false;
  private __meta = {};

  private cid;
  private currencyStructureMap;
  private currencyFlatMap;
  private quickSelectList;
  private showCurrencyMap;

  constructor(
    private currencyService: CurrencyService,
    private elementRef: ElementRef
  ) {};

  async ngOnInit() {
    await this.getCurrency();
    this.cid = this.inputCid || null;
    this.__isInit = true;
  };

  async __checkDataUpToDate() {
    if (this.__meta['currencyMap']['legacy']) {
      await this.getCurrency();
    }
  }

  async getCurrency() {
    this.__meta['currencyMap'] = await this.currencyService.getMap();
    this.currencyStructureMap = this.__meta['currencyMap']['data']['structureMap'];
    this.currencyFlatMap = this.__meta['currencyMap']['data']['flatMap'];

    var _quickSelectList = [];
    for (let _key in this.currencyFlatMap) {
      this.currencyFlatMap[_key].quickSelect && _quickSelectList.push(this.currencyFlatMap[_key]);
    }
    this.quickSelectList = _quickSelectList;
  };

  cidToType(cid) {
    return this.currencyFlatMap[cid].type;
  }


  onSelect(cid) {
    if (cid == -1)
      this.showCurrencyMap = true;
    else
      this.callback(cid);
  }

  typMapCallcak = (function(_self) {
    return cid => {
      _self.showCurrencyMap = false;
      _self.cid = cid || _self.inputCid;
      _self.callback(_self.cid);
    };
  })(this);

  objKeys(obj) {
    return Object.keys(obj);
  };
}
