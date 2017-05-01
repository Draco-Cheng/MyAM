import { Component } from '@angular/core';

import { TypeService } from '../../../service/type.service';

import './types.view.style.less';

const config = require('../../../config.json');


@Component({
  selector: 'currency-content',
  template: require('./types.view.template.html'),
  providers: [
    TypeService
  ]
})

export class TypesViewComponent {
  private __isInit = false;
  private __meta = {};

  private types;
  private typesFlat = {};
  private typesMapFlatMeta;

  constructor(
    private typeService: TypeService
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
  };

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


  reload () {
    this.__isInit =false;
    setTimeout(()=> {this.__isInit = true;}, 10)
  }
}
