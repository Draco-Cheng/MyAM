import { Component } from '@angular/core';

import { RecordsService } from '../../../service/records.service';

import './records.view.style.less';

@Component({
  selector: 'records-content',
  template: require('./records.view.template.html'),
  providers: [
    RecordsService
  ],
  host: {
    '(window:scroll)': 'onRecordScroll($event)'
  }
})

export class RecordsViewComponent {
  private __isInit = false;
  private __meta = {};

  private records;
  private qureyCondition = {
    cashType: 0,
    cid: null,
    orderBy: ['date', 'DESC'],
    start_date: null,
    end_date: null,
    type_query_set: 'intersection',
    memo: null,
    value_greater: null,
    value_less: null,
    limit: 10
  };

  constructor(
    private recordsService: RecordsService
  ) {};

  async ngOnInit(){
    await this.getRecord();
    this.__isInit = true;   
  };

  async __checkDataUpToDate(){}

  async getRecord() {
    this.__meta['records'] = await this.recordsService.get(this.qureyCondition);
    this.records = this.__meta['records']['data'];
  };

  onRecordScroll(event){
  }
}