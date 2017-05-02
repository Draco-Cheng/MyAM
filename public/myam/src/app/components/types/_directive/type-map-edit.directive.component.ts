import { Component, Input } from '@angular/core';

import { TypeService } from '../../../service/type.service';

import './type-map-edit.style.less';

@Component({
  selector: '[type-map-edit]',
  template: require('./type-map-edit.template.html'),
  providers: [TypeService]
})

export class TypeMapEditDirectiveComponent {
  //*************************************
  // Note for who want to use this module
  //-------------------------------------
  // neceesary input
  @Input() typesFlat ? : Object;
  @Input() typesMapFlatMeta ? : Object;
  //*************************************
  // internal input
  @Input() parentNodes ? : string;
  @Input() currentNode ? : number;
  //*************************************

  private childNode;
  private showParentSelectPopOut;
  private disabledTids = {};
  private _typesMapFlatMeta;

  constructor(
    private typeService: TypeService
  ) {};

  ngOnInit() {
    this.parentNodes = this.parentNodes || "";
    this.currentNode && (this.parentNodes += this.currentNode + ',');
    this._typesMapFlatMeta = this.typesMapFlatMeta;
    this.disabledTids[this.currentNode] = true;
    this.getChildNode();
  }
  __checkDataUpToDate() {
    if (this._typesMapFlatMeta['legacy']) {
      this._typesMapFlatMeta = this.typesMapFlatMeta;
      this.getChildNode();
    }
    return true;
  };

  getChildNode() {
    const _parentNodes = this.parentNodes;
    const _currentNode = this.currentNode;
    const _typesFlat = this.typesFlat;
    const _typesMapFlat = this._typesMapFlatMeta['data'];
    const _childNodes = this.childNode = [];

    if (_currentNode) {
      if (_typesMapFlat[_currentNode] && _typesMapFlat[_currentNode]['childs']) {
        const _list = Object.keys(_typesMapFlat[_currentNode]['childs']);
        _list.forEach(tid => {
          !_typesFlat[tid].isRemoved && _parentNodes.indexOf(tid) == -1 && _childNodes.push(tid);
        });
      }
    } else {
      let _unclassifiedNodes = {};
      let _listOfChild = [];

      for (let _key in _typesMapFlat) {
        if (_key != '_unclassified')
          Object.keys(_typesMapFlat[_key]['childs']).forEach(tid => _listOfChild.push(tid));
      }

      for (let _tid in _typesFlat) {
        if(_typesFlat[_tid].isRemoved)
          continue;
        if (_typesFlat[_tid].master)
          _childNodes.push(_tid);
        else {
          _listOfChild.indexOf(_tid) == -1 && (_unclassifiedNodes[_tid] = null);
        }
      }

      if (Object.keys(_unclassifiedNodes).length) {
        _typesMapFlat['_unclassified'] = { 'childs': _unclassifiedNodes };
        _childNodes.push('_unclassified');
      }
    }
  }

  getNodeParents(currentNode) {
    const _typesFlat = this.typesFlat;
    const _typesMapFlat = this._typesMapFlatMeta['data'];
    let _list = [];

    if (_typesMapFlat[currentNode] && _typesMapFlat[currentNode]['parents']) {
      Object.keys(_typesMapFlat[currentNode]['parents']).forEach(_pNode => {
        _list.push(_typesFlat[_pNode]);
      });
    }
    return _list;
  }

  getNodeParentsMap() {
    const _typesFlat = this.typesFlat;
    const _typesMapFlat = this._typesMapFlatMeta['data'];
    const _currentNode = this.currentNode;

    if (_typesMapFlat[_currentNode] && _typesMapFlat[_currentNode]['parents']) {
      return _typesMapFlat[_currentNode]['parents'];
    } else {
      return {};
    }
  }

  getTypeMapCallback() {
    const _self = this;
    const _typesMapFlat = _self._typesMapFlatMeta['data'];
    const _currentNode = _self.currentNode;
    const _typesFlat = _self.typesFlat;
    const _node = _typesFlat[_currentNode];

    return async tid => {
      if (!tid)
        return _self.showParentSelectPopOut = false;

      if (_typesMapFlat[_currentNode] && _typesMapFlat[_currentNode]['parents'].hasOwnProperty(tid)) {
        await _self.unlinkParant(tid);
      } else {
        await _self.linkParant(tid);
      }
    }
  }

  async save(node) {
    let _resault = await this.typeService.set(node);
    node.isChange = false;
  }

  async unlinkParant(p_tid) {
    if (p_tid != this.currentNode) {
      let _resault = await this.typeService.unlinkParant(p_tid, this.currentNode);
    }
  }

  async linkParant(p_tid) {
    if (p_tid != this.currentNode) {
      let _resault = await this.typeService.linkParant(p_tid, this.currentNode);
    }
  }

  async del() {
    let _resault = await this.typeService.del(this.currentNode);
    this.typesFlat[this.currentNode].isRemoved = true;
  }
}
