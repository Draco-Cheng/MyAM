import { Component } from '@angular/core';
import { RecordsService } from '../../service/records.service';
import { TypeService } from '../../service/type.service';
import { CurrencyService } from '../../service/currency.service';

import './records.style.less';

@Component({
  selector: 'content',
  template: require('./records.template.html'),
  providers: [
    RecordsService,
    TypeService,
    CurrencyService
  ]
})
export class RecordsComponent {
  private records;
  private typeMap = {};
  private currencies;
  private currencyMap = {};

  async getRecord() {
    this.records = await this.recordsService.get();
  };

  async getTypeMap() {
    const _types = await this.typeService.get();
    _types.forEach(element => {
      this.typeMap[element.tid] = element;
    });
  };

  async getCurrencyMap() {
    this.currencies = await this.currencyService.get();
    this.currencies.forEach(element => {
      this.currencyMap[element.cid] = element;
    });
  };

  tidToLabel(tidStrArr: string) {
    const tids = tidStrArr.split(/,/g);
    let types = [];

    tids.forEach(tid => {
      types.push({
        'tid': tid,
        'label': this.typeMap[tid].type_label
      });
    })
    return types;
  }

  cidToLabel(cid: any) {
  	return this.currencyMap[cid].type;
  }

  constructor(
    private recordsService: RecordsService,
    private typeService: TypeService,
    private currencyService: CurrencyService
  ) {
    this.getRecord();
    this.getTypeMap();
    this.getCurrencyMap();
  };
}
