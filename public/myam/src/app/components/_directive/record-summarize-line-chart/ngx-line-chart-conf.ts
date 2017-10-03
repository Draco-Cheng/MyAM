export class NgxLineChartConf {
  single: any[];
  multi: any[];

  view = [700, 400];

  // options
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = true;
  showXAxisLabel = true;
  xAxisLabel = 'Time';
  showYAxisLabel = true;
  yAxisLabel = 'Money';
  timeline = true;

  // line, area
  autoScale = true;

  constructor(multi) {
    Object.assign(this, { multi: multi });


    // padding left, right 15px;
    this.view[0] = window.innerWidth - 50;
  }

  onSelect(event) {
    console.log(event);
  }
}