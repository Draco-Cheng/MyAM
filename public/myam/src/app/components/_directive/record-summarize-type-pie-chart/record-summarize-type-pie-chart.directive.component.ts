import { Component, Input, Output } from '@angular/core';

import { RecordsService } from '../../../service/records.service';
import { TypeService } from '../../../service/type.service';
import { CurrencyService } from '../../../service/currency.service';
import { SummarizeService } from '../../../service/summarize.service';

import { NgxPieChartConf } from './ngx-pie-chart-conf';


import './record-summarize-type-pie-chart.style.less';

@Component({
  selector: '[record-summarize-type-pie-chart]',
  template: require('./record-summarize-type-pie-chart.template.html'),
  providers: [
    RecordsService,
    TypeService,
    CurrencyService,
    SummarizeService
  ]
})

export class RecordSummarizeTypePieChartDirectiveComponent {
  @Input() getRecord: Function;

  private __isInit = false;
  private __meta = {};

  private types;
  private typesFlat = {};
  private typesMapFlatMeta;
  private typeSummerizeForPieChart;
  private typePiChart;
  private typeIdSelected;


  private summarizeReady;

  constructor(
    private typeService: TypeService,
    private currencyService: CurrencyService,
    private summarizeService: SummarizeService,
  ) {};

  async ngOnInit() {
    await this.getTypes();
    await this.buildSummerize();
    this.__isInit = true;
  }

  async getTypes() {
    this.__meta['types'] = await this.typeService.get();
    this.typesMapFlatMeta = await this.typeService.getFlatMap();

    this.types = this.__meta['types']['data'];

    this.types.forEach(element => {
      this.typesFlat[element.tid] = element;
    });


  };

  async buildSummerize() {
    this.summarizeReady = false;

    let _records = this.getRecord();
    let _typeIdsForChart = [];

    let _typeList = await this.typeService.getChildsInNextLayer(this.typeIdSelected, true);

    let _typeSummerize = await this.summarizeService.buildSummerize(_records);


    let _pieCharData = await this.summarizeService.typeSummerizeToPieChart(_typeSummerize, _typeList['childs'], _typeList['unclassified']);

    console.log(this.typeSummerizeForPieChart)
    this.typeSummerizeForPieChart = new NgxPieChartConf(_pieCharData);


    setTimeout(() => this.summarizeReady = true);
  }
}