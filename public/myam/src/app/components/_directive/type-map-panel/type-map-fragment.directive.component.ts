import { Component, Input } from '@angular/core';

import './type-map-fragment.style.less';

@Component({
  selector: '[type-map-fragment]',
  template: require('./type-map-fragment.template.html'),
  providers: []
})

export class TypeMapFragmentDirectiveComponent {
  //*************************************
  // Note for who want to use this module
  //-------------------------------------
  // neceesary input
  @Input() typesFlat: any;
  @Input() typesMapFlatMeta: any;
  @Input() callback: Function;
  @Input() selectedTids: Object;
  @Input() disabledTids ? : Object;
  //*************************************
  // internal input
  @Input() parentNodes ? : string;
  @Input() currentNode ? : number;
  //*************************************

  private childNode;
  private _typesMapFlatMeta;

  constructor() {};

  ngOnInit() {
    this.parentNodes = this.parentNodes || "";
    this.currentNode && (this.parentNodes += this.currentNode + ',');
    this._typesMapFlatMeta = this.typesMapFlatMeta;
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
          _typesFlat[tid].showInMap && _parentNodes.indexOf(tid) == -1 && _childNodes.push(tid);
        })
      }
    } else {
      let _unclassifiedNodes = {};
      let _listOfChild = [];

      for (let _key in _typesMapFlat) {
        if (_key != '_unclassified')
          Object.keys(_typesMapFlat[_key]['childs']).forEach(tid => _listOfChild.push(tid));
      }

      for (let _tid in _typesFlat) {
        if (_typesFlat[_tid].master)
          _typesFlat[_tid].showInMap && _childNodes.push(_tid);
        else {
          _listOfChild.indexOf(_tid) == -1 && _typesFlat[_tid].showInMap && (_unclassifiedNodes[_tid] = null);
        }
      }

      if (Object.keys(_unclassifiedNodes).length) {
        _typesMapFlat['_unclassified'] = { 'childs': _unclassifiedNodes };
        _childNodes.push('_unclassified');
      }
    }
  }

  onSelect(node) {
    this.callback(node, this.typesFlat[node].type_label);
  }

  classCheck(node) {
    if (this.disabledTids && this.disabledTids[node]) {
      return 'disabled';
    }
    if (this.selectedTids[node]) {
      return 'checked';
    }

    return '';
  }
}