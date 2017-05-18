import { Component } from '@angular/core';

import { RecordsService } from '../../../service/records.service';
import { TypeService } from '../../../service/type.service';

import './records.view.style.less';

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
  selector: 'records-content',
  template: require('./records.view.template.html'),
  providers: [
    RecordsService,
    TypeService
  ],
  host: {
    '(window:scroll)': 'onRecordScroll($event)'
  }
})

export class RecordsViewComponent {
  private __isInit = false;
  private __meta = {};

  private records;
  private showTypeMap;
  private qureyCondition = {
    cashType: 0,
    cid: null,
    start_date: formatDate(Date.now() - 1000 * 60 * 60 * 24 * 60),
    end_date: formatDate(Date.now()),
    tids_json: null,
    type_query_set: 'intersection',
    memo: null,
    value_greater: null,
    value_less: null,
    limit: '',
    orderBy: ['date', 'DESC']
  };

  qureyConditionTidsObj = {};

  constructor(
    private recordsService: RecordsService,
    private typeService: TypeService
  ) {};

  async ngOnInit() {
    await this.getRecord();
    this.__isInit = true;
  };

  async __checkDataUpToDate() {}

  async getRecord() {
    this.__meta['records'] = await this.recordsService.get(this.qureyCondition);
    this.records = this.__meta['records']['data'];
  };

  getSelectionCallback = cid => {
    this.qureyCondition.cid = cid;
  }

  getQureyConditionTidsArr() {
    let _arr = [];
    for (let key in this.qureyConditionTidsObj) {
      _arr.push({ tid: key, label: this.qureyConditionTidsObj[key] })
    }
    return _arr;
  }

  async conditionChange() {
    await this.buildQureyConditionTidsArr();
    await this.getRecord();
  }

  async buildQureyConditionTidsArr() {
    let _tidsList = Object.keys(this.qureyConditionTidsObj);
    let _arr = [];

    for (let i = 0; i < _tidsList.length; i++) {
      let _list = await this.typeService.getNodeAllChilds(_tidsList[i]);
      _arr.push(_list);
    }

    this.qureyCondition['tids_json'] = _arr.length ? JSON.stringify(_arr) : null;
  }

  typeMapCallback = async(tid, label) => {
    if (!tid) {
      this.showTypeMap = false;
      this.conditionChange();
      return;
    }

    if (this.qureyConditionTidsObj[tid])
      delete this.qureyConditionTidsObj[tid];
    else
      this.qureyConditionTidsObj[tid] = label;
  }

  removeQureyConditionTids(tid) {
    delete this.qureyConditionTidsObj[tid];
    this.conditionChange();
  }

  onRecordScroll(event) {}
}
