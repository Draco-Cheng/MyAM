import { Component, Input, Output } from '@angular/core';

import { RecordsService } from '../../../service/records.service';
import { SummarizeService } from '../../../service/summarize.service';

import { NgxLineChartConf } from './ngx-line-chart-conf';


import './record-summarize-line-chart.style.less';

@Component({
  selector: '[record-summarize-line-chart]',
  template: require('./record-summarize-line-chart.template.html'),
  providers: [
    RecordsService,
    SummarizeService
  ]
})

export class RecordSummarizeLineChartDirectiveComponent {
  @Input() getDaySummerize: Function;

  private __isInit = false;
  private __meta = {};

  private lineChartSelected = '';
  private daySummerize;
  private summerizeForLineChartObj;
  private summerizeForLineChart;

  constructor(
    private summarizeService: SummarizeService,
  ) {};

  async ngOnInit() {
    await this.buildSummerize();
    this.__isInit = true;
  }


  async buildSummerize() {

    this.daySummerize = this.getDaySummerize();
    await this.buildLineChartData(this.daySummerize);
  };

  async buildLineChartData(summerize) {
    const _summerize = summerize || this.daySummerize;
    this.summerizeForLineChartObj = await this.summarizeService.daySummerizeToLineChart(_summerize);
    this.renderLineChart();
  };

  renderLineChart() {
    switch (this.lineChartSelected) {
      case "":
        this.summerizeForLineChart = new NgxLineChartConf([this.summerizeForLineChartObj['Cost'], this.summerizeForLineChartObj['Earn']]);
        break;
      case "SUM":
        this.summerizeForLineChart = new NgxLineChartConf([this.summerizeForLineChartObj['Sum']]);
        break;
    }
  };

  onSelect() {
    this.renderLineChart();
  };
}