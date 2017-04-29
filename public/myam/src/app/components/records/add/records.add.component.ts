import { Component } from '@angular/core';

import { RecordsService } from '../../../service/records.service';

import { TypeService } from '../../../service/type.service';

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
    TypeService
  ]
})

export class RecordsAddComponent {
  private __isInit = false;
  private __meta = {};

  private newRecord = newRecord;
  private records;
  private types;
  private typesFlat = {};
  private typesMapFlat = null;  

  constructor(
    private recordsService: RecordsService,
    private typeService: TypeService
  ) {};

  async ngOnInit(){
    await this.getRecord();
    await this.getTypes();
    await this.getTypesFlatMap();
    
    this.__isInit = true;   
  };

  async __checkDataUpToDate(){
    if(this.__meta['types']['lagacy']) {
      await this.getTypes();
    }
    if(this.__meta['typesMapFlat']['lagacy']) {
      await this.getTypesFlatMap();
    }
  }

  async getRecord() {
    this.__meta['records'] = await this.recordsService.get();
    this.records = this.__meta['records']['data'];
  };

  async getTypes() {
    this.__meta['types'] = await this.typeService.get();
    this.types = this.__meta['types']['data'];
    this.types.forEach(element => {
      this.typesFlat[element.tid] = element;
    });
  };

  async getTypesFlatMap() {
    this.__meta['typesMapFlat'] = await this.typeService.getFlatMap();
    this.typesMapFlat = this.__meta['typesMapFlat']['data'];
  };

  async addRecord() {
    let _record = cloneObj(this.newRecord);
    const _resault = await this.recordsService.set(_record);
    _record.rid = _resault['data'][0].rid;
    const _resault2 = await this.recordsService.setType(_record.rid, Object.keys(_record.tids));

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

  getSelectionCallback(record){
    return cid => {
      record.cid = cid;
    }
  }
}
