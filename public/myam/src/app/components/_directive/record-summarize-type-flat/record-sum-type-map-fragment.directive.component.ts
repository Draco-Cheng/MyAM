import { Component, Input } from '@angular/core';

import './record-sum-type-map-fragment.style.less';

@Component({
  selector: '[record-sum-type-map-fragment]',
  template: require('./record-sum-type-map-fragment.template.html'),
  providers: []
})

export class RecordSumTypeMapFragmentDirectiveComponent {
  //*************************************
  // Note for who want to use this module
  //-------------------------------------
  // neceesary input
  @Input() typesFlat: any;
  @Input() typesMapFlatMeta: any;
  @Input() typeSummerize: any;
  @Input() currencyEx: Function;
  @Input() defaultCid: any;
  @Input() currencyFlatMap: any;
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

  getChildNode() {
    const _parentNodes = this.parentNodes;
    const _currentNode = this.currentNode;
    const _typesFlat = this.typesFlat;
    const _typeSummerize = this.typeSummerize;
    const _typesMapFlat = this._typesMapFlatMeta['data'];
    const _childNodes = this.childNode = [];

    if (_currentNode) {
      if (_typesMapFlat[_currentNode] && _typesMapFlat[_currentNode]['childs']) {
        const _list = Object.keys(_typesMapFlat[_currentNode]['childs']);

        _list.forEach(tid => {
          _typeSummerize['types'][tid] && _parentNodes.indexOf(tid) == -1 && _childNodes.push(tid);
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
          _typeSummerize['types'][_tid] && _childNodes.push(_tid);
        else {
          _listOfChild.indexOf(_tid) == -1 && _typeSummerize['types'][_tid] && (_unclassifiedNodes[_tid] = null);
        }
      }

      if (Object.keys(_unclassifiedNodes).length) {
        _typesMapFlat['_unclassified'] = { 'childs': _unclassifiedNodes };
        _childNodes.push('_unclassified');
      }
    }
  }

  cidToLabel(cid) {
    return this.currencyFlatMap[cid]['type'];
  }

  objArr(Obj) {
    let _arr = [];
    for (let _key in Obj) {
      _arr.push({ key: _key, data: Obj[_key] })
    }
    return _arr;
  }

  roundPrice(num) {
    if(num == 0) return 0;
    return Math.round(num * 100) / 100 || 0.01;
  }
}
