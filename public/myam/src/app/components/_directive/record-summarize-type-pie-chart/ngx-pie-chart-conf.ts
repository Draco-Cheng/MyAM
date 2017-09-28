export class NgxPieChartConf {
  single: any[];
  multi: any[];

  view: any[] = [700, 400];

  // options
  showLegend = true;

  // pie
  showLabels = true;
  explodeSlices = false;
  doughnut = true;

  constructor(single) {
    Object.assign(this, { single });

    if (window.innerWidth < 730) {
      // padding left, right 15px;
      this.view[0] = window.innerWidth - 30;
      this.showLegend = false;
    }
  }

  onSelect(event) {
    console.log(event);
  }

}