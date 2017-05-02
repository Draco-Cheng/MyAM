import { Component, Input, ElementRef, ViewChild } from '@angular/core';

import { TypeService } from '../../../service/type.service';

import './type-map-panel.style.less';

@Component({
  selector: '[type-map-panel]',
  template: require('./type-map-panel.template.html'),
  providers: [TypeService],

})

export class TypeMapPanelDirectiveComponent {
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

  private __isInit = false;
  private __meta = {};

  private types;
  private typesFlat = {};
  private typesMapFlatMeta;

  constructor(
    private typeService: TypeService,
    private elementRef: ElementRef
  ) {};

  async ngOnInit() {
    await this.getTypes();
    await this.getTypesFlatMap();
    this.__isInit = true;
  };

  async __checkDataUpToDate() {
    if (this.__meta['types']['legacy']) {
      await this.getTypes();
    }
    if (this.__meta['typesMapFlat']['legacy']) {
      await this.getTypesFlatMap();
    }
  }

  async getTypes() {
    this.__meta['types'] = await this.typeService.get();
    this.types = this.__meta['types']['data'];
    this.types.forEach(element => {
      this.typesFlat[element.tid] = element;
    });
  };

  async getTypesFlatMap() {
    this.__meta['typesMapFlat'] = await this.typeService.getFlatMap();
    this.typesMapFlatMeta = this.__meta['typesMapFlat'];
  };

}
