import { Component } from '@angular/core';

import { CurrencyService } from '../../../service/currency.service';

import './currency.view.style.less';

const currencyList = require('../currency.list.json');

function formatDate(date) {
  var d = new Date(date),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
}


@Component({
  selector: 'currency-content',
  template: require('./currency.view.template.html'),
  providers: [
    CurrencyService
  ]
})

export class CurrencyViewComponent {
  private __isInit = false;
  private __meta = {};
  
  private currencyFlatMap;
  private currencyStructureMap;
  private currencyList = currencyList;

  private newCurrency = {
    type: '',
    rate: 1,
    to_cid: this.currencyService.getDefaultCid(),
    memo: '',
    main: false,
    quickSelect: true,
    date: formatDate(Date.now()),
  };


  constructor(
    private currencyService: CurrencyService
  ) {};


  async ngOnInit() {
    await this.getCurrency();
    this.__isInit = true;
  };

  async __checkDataUpToDate(){
    if(this.__meta['currencyMap']['legacy']){
      await this.getCurrency();
    }
  }

  async getCurrency() {
    this.__meta['currencyMap'] = await this.currencyService.getMap();
    this.currencyStructureMap = this.__meta['currencyMap']['data']['structureMap'];
    this.currencyFlatMap = this.__meta['currencyMap']['data']['flatMap'];
  };

  getType(tid) {
    return this.currencyFlatMap[tid].type;
  }

  getCurrentMainType() {
    return this.getType( Object.keys(this.currencyStructureMap)[0] ); 
  }

  getSelectionCallback(currency){
    return cid => {
      currency.to_cid = cid;
    }
  }

  async save(newCurrency) {
    let _resault = await this.currencyService.add(newCurrency);

    newCurrency.memo = '';
    newCurrency.type = '';
    newCurrency.rate = 1;
    newCurrency.main = false;
  }

}
