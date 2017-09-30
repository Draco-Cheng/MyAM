import { Component, ElementRef, ViewChild } from '@angular/core';

import { RecordsService } from '../../../service/records.service';
import { TypeService } from '../../../service/type.service';
import { CurrencyService } from '../../../service/currency.service';
import { SummarizeService } from '../../../service/summarize.service';

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

// For performance issue move scroll binding out of component
let __componentThis;

function onScroll(evt) {
  if (!__componentThis) return;
  if (__componentThis.records_pool.length <= __componentThis.records_index || __componentThis.records_index >= 500)
    return;

  const _target = evt['target']['scrollingElement'];
  if (_target.scrollHeight - (_target.scrollTop + window.innerHeight) <= 1) {
    __componentThis.showMoreBtn.nativeElement.click();
  }
};
window.onscroll = onScroll;

@Component({
  selector: 'records-content',
  template: require('./records.view.template.html'),
  providers: [
    RecordsService,
    TypeService,
    CurrencyService,
    SummarizeService    
  ],

  /*
  host: {
    '(window:scroll)': 'onRecordScroll($event)'
  }
  */
})

export class RecordsViewComponent {
  private __isInit = false;
  private __meta = {};

  @ViewChild('showMoreBtn') showMoreBtn: ElementRef;
  @ViewChild('recordSummarizeTypeFlat') recordSummarizeTypeFlat;
  @ViewChild('recordSummarizeTypePieChart') recordSummarizeTypePieChart;
  @ViewChild('recordSummarizeLineChart') recordSummarizeLineChart;

  private records;
  private records_pool = [];
  private records_push_number = 25;
  private records_index;

  private typeSummerize;
  private daySummerize;

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
    private typeService: TypeService,
    private summarizeService: SummarizeService
  ) {};

  async ngOnInit() {
    await this.getRecord();

    __componentThis = this;

    this.__isInit = true;
  };

  async getRecord() {
    this.__meta['records'] = await this.recordsService.get(this.qureyCondition);
    this.records_pool = this.__meta['records']['data'] || [];
    this.records = [];
    this.records_index = 0;
    this.lazyPushRecords();

    await this.buildSummarize();
  };

  async buildSummarize() {
    this.typeSummerize = await this.summarizeService.buildTypeSummerize(this.records_pool);
    this.daySummerize = await this.summarizeService.buildDaySummerize(this.records_pool);
    this.recordSummarizeTypeFlat && this.recordSummarizeTypeFlat.buildSummerize();
    this.recordSummarizeTypePieChart && this.recordSummarizeTypePieChart.buildSummerize();
    this.recordSummarizeLineChart && this.recordSummarizeLineChart.buildSummerize();

  }

  lazyPushRecords() {
    this.records.push(...(this.records_pool.slice(this.records_index, this.records_index + this.records_push_number)));
    this.records_index = this.records_index + this.records_push_number;
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
      let _list = await this.typeService.getAllChildsInTree(_tidsList[i]);

      _list.length || _list.push(_tidsList[i]);

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

  showMoreRecord() {
    this.lazyPushRecords();
  }

  scrollToTop() {
    document.scrollingElement.scrollTop = 0;
  }

  putTypeSummerizeToDirective = () => {
    return this.typeSummerize;
  }

  putDaySummerizeToDirective = () => {
    return this.daySummerize;
  }
}
