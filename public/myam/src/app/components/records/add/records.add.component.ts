import { Component } from '@angular/core';

import { RecordsService } from '../../../service/records.service';

import { TypeService } from '../../../service/type.service';
import { CurrencyService } from '../../../service/currency.service';

import './records.add.style.less';

const config = require('../../../config.json');

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}

function cloneObj(obj){
  return JSON.parse(JSON.stringify(obj));
};

let newRecord = {
  cashType: -1,
  value: 0,
  tids: {},
  memo: '',
  date: formatDate(Date.now()),
  cid: config.cid
};

@Component({
  selector: 'records-content',
  template: require('./records.add.template.html'),
  providers: [
    RecordsService,
    TypeService,
    CurrencyService
  ]
})

export class RecordsAddComponent {
  private isReady = false;
  private newRecord = newRecord;
  private records;
  private types;
  private typesFlat = {};
  private typesMapFlat = null;
  private currencies;
  private currencyMap = {};

  constructor(
    private recordsService: RecordsService,
    private typeService: TypeService,
    private currencyService: CurrencyService
  ) {};

  async ngOnInit(){
    await this.getRecord();
    await this.getTypes();
    await this.getCurrencyMap();
    await this.getTypesFlatMap();
    this.isReady = true;   
  };

  async getRecord() {
    this.records = await this.recordsService.get();
  };

  async getTypes() {
    this.types = await this.typeService.get();
    this.types.forEach(element => {
      this.typesFlat[element.tid] = element;
    });
  };

  async getTypesFlatMap() {
    this.typesMapFlat = await this.typeService.getFlatMap();
  };

  async getCurrencyMap() {
    this.currencies = await this.currencyService.get();
    this.currencies.forEach(element => {
      this.currencyMap[element.cid] = element;
    });
  };

  async addRecord() {
    let _record = cloneObj(this.newRecord);
    _record.tids = Object.keys(_record.tids);
    const _resault = await this.recordsService.set(_record);
    _record.rid = _resault[0].rid;
    const _resault2 = await this.recordsService.setType(_record);

    if(_resault){
      this.records.unshift(_record);

      this.newRecord.value = 0;
      this.newRecord.tids = {};
      this.newRecord.memo = '';
    }
  };
  
  tidToLabel(tid: string) {
    return this.typesFlat[tid].type_label;
  }

  removeTypeInRecord(tid) {
    delete this.newRecord.tids[tid];
  }

  getRecordTypeMapSwitch(record) {
    let _self = this;
    return ( tid ) => {
      if(this.newRecord.tids[tid])
        delete this.newRecord.tids[tid];
      else
        this.newRecord.tids[tid] = true;;
    };
  }

  getRecordTidsArr(){
    return Object.keys(this.newRecord.tids);
  }
}
