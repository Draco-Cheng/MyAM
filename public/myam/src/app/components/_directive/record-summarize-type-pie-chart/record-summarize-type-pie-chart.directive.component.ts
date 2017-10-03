import { Component, Input, Output } from '@angular/core';

import { TypeService } from '../../../service/type.service';
import { SummarizeService } from '../../../service/summarize.service';

import { NgxPieChartConf } from './ngx-pie-chart-conf';


import './record-summarize-type-pie-chart.style.less';

@Component({
  selector: '[record-summarize-type-pie-chart]',
  template: require('./record-summarize-type-pie-chart.template.html'),
  providers: [
    TypeService,
    SummarizeService
  ]
})

export class RecordSummarizeTypePieChartDirectiveComponent {
  @Input() getTypeSummerize: Function;

  private __isInit = false;
  private __meta = {};
  private typesMapFlat;
  
  private typePiChart;
  private typeIdSelected = "OVERVIEW";
  private typeSummerize;
  private typeSummerizeForPieChart;
  private sumTidsHasChilds;

  constructor(
    private typeService: TypeService,
    private summarizeService: SummarizeService,
  ) {};

  async ngOnInit() {
    await this.getTypes();
    await this.buildSummerize();
    this.__isInit = true;
  }

  async getTypes() {
    this.typesMapFlat = (await this.typeService.getFlatMap())['data'];
  };

  async buildSummerize() {
    let _typeIdsForChart = [];

    this.typeSummerize = this.getTypeSummerize();

    await this.buildPieChartData(this.typeSummerize);

    this.typeIdSelected = "OVERVIEW";
    this.sumTidsHasChilds = await this.getSumTidsHasChilds(this.typeSummerize);
  }

  async getSumTidsHasChilds(summerize) {
    let _summerize = summerize || this.typeSummerize;
    let _typesMapFlat = this.typesMapFlat;

    let _sumTypeIds = Object.keys(_summerize['types']);
    let _sumTypeParentTidsFlat = {};

    _sumTypeIds.forEach( tid => {
      !!_typesMapFlat[tid] && Object.assign(_sumTypeParentTidsFlat, _typesMapFlat[tid]['parents']);
    });

    return Object.keys(_sumTypeParentTidsFlat);
    
  }

  async buildPieChartData(summerize ? ) {
    let _summerize = summerize || this.typeSummerize;


    let _typeListChild;
    let _typeListUnclassified;
    let _childsList;
    let _showTypeNone;
    switch (this.typeIdSelected) {
      case "OVERVIEW":
         _childsList= await this.typeService.getChildsInNextLayer(null, true);
        _typeListChild = _childsList['childs'];
        _typeListUnclassified = _childsList['unclassified'];
        _showTypeNone = true;
        break;
      case "UNCLASSIFIED_TYPE":
        _childsList = await this.typeService.getChildsInNextLayer(null, true);
        _typeListChild = _childsList['unclassified'];
        break;
      default:
        _childsList = await this.typeService.getChildsInNextLayer(parseInt(this.typeIdSelected), true);
        _typeListChild = _childsList['childs'];
        break;
    }

    let _pieCharData = await this.summarizeService.typeSummerizeToPieChart(_summerize, _typeListChild, _typeListUnclassified, _showTypeNone);
    this.typeSummerizeForPieChart = new NgxPieChartConf(_pieCharData);
  }

  tidToLabel(tid) {
    return this.typeService.tidToLable(tid);
  }

  onSelectTid() {
    this.buildPieChartData();
  }
}