import { Component, Input, ElementRef, ViewChild } from '@angular/core';

import './type-map-panel-pop-out.style.less';

@Component({
  selector: '[type-map-panel-pop-out]',
  template: require('./type-map-panel-pop-out.template.html'),
  providers: []
})

export class TypeMapPanelPopOutDirectiveComponent {
  //*************************************
  // Note for who want to use this module
  //-------------------------------------
  // neceesary input
  @Input() selectedTids: Object;
  @Input() disabledTids ? : Object;
  @Input() callback: Function;
  //*************************************
  // optional input
  //*************************************

  constructor() {};

  async ngOnInit() {}
}
