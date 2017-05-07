import { Component } from '@angular/core';

import { TypeService } from '../../../service/type.service';

import './types.view.style.less';

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

  private showParentSelectPopOut;
  private newTypeParents = {};
  private newType = {
    type_label: '',
    cashType: 0,
    master: false,
    showInMap: true,
    quickSelect: true,
    parents: {}
  };

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

  getParents() {
    return Object.keys(this.newType.parents);
  }

  unlinkParant(p_tid) {
    delete this.newType.parents[p_tid];
  }

  getTypeMapCallback() {
    const _self = this;
    const _newTypeParents = _self.newType.parents;

    return async tid => {
      if (!tid)
        return _self.showParentSelectPopOut = false;

      if (_newTypeParents.hasOwnProperty(tid)) {
        delete _self.newType.parents[tid];
      } else {
        _self.newType.parents[tid] = true;
      }
    }
  }

  async add(node) {
    const _resault = await this.typeService.add(this.newType);
    if (_resault) {
      this.newType.type_label = '';
      this.newType.parents = {};
    }
  }
}
