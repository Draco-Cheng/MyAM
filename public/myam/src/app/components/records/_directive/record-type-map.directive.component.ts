import { Component, Input } from '@angular/core';

import { TypeService } from '../../../service/type.service';

import './record-type-map.style.less';

@Component({
  selector: '[record-type-map]',
  template: require('./record-type-map.template.html'),
  providers: [TypeService]
})

export class RecordTypeMapDirectiveComponent {
  @Input() typesFlat: any;
  @Input() typesMapFlat: any;
  @Input() parentNodes ? : string;
  @Input() currentNode ? : number;
  @Input() recordTids: any;
  @Input() recordTidSwitch: Function;
  
  private childNode = [];

  constructor(
    private typeService: TypeService
  ) {};

  ngOnInit() {
    this.parentNodes = this.parentNodes || "";
    this.currentNode && (this.parentNodes += this.currentNode + ',');
    this.getChildNode();
  }

  getChildNode() {
    const _parentNodes = this.parentNodes;
    const _currentNode = this.currentNode;
    const _typesFlat = this.typesFlat;
    const _typesMapFlat = this.typesMapFlat;
    const _childNodes = this.childNode;

    if (_currentNode) {
      const _list = Object.keys(_typesMapFlat[_currentNode] || {});

      _list.forEach(tid => {
        _typesFlat[tid].showInMap && _parentNodes.indexOf(tid) == -1 && _childNodes.push(tid);
      })
    } else {
      let _unclassifiedNodes = {};
      let _listOfChild = [];

      for ( let _key in _typesMapFlat ) {
        if( _key != '_unclassified' )
        Object.keys(_typesMapFlat[_key]).forEach( tid => _listOfChild.push(tid));
      }

      for (let _tid in _typesFlat) {
        if (_typesFlat[_tid].master)
          _typesFlat[_tid].showInMap && _childNodes.push(_tid);
        else {

          _listOfChild.indexOf(_tid) == -1 && _typesFlat[_tid].showInMap && ( _unclassifiedNodes[_tid] = null );
        }
      }      

      if(Object.keys(_unclassifiedNodes).length){
        _typesMapFlat['_unclassified'] = _unclassifiedNodes;
        _childNodes.push('_unclassified');
      }
    }
  }

  isChecked(node) {
    return this.recordTids[node];
  }
}
