import { Component, Input } from '@angular/core';

import { TypeService } from '../../../service/type.service';

import './record-type-map.style.less';

@Component({
  selector: 'record-type-map',
  template: require('./record-type-map.template.html'),
  providers: [TypeService]
})

export class RecordTypeMapDirectiveComponent {
  @Input() typesFlat: any;
  @Input() typesMapFlat: any;
  @Input() parentNodes ? : string;
  @Input() currentNode ? : number;
  @Input() recordTids: number[];
  @Input() recordTidSwitch: Function;

  constructor(
    private typeService: TypeService
  ) {};

  ngOnInit() {
    this.parentNodes = this.parentNodes || "";
    this.currentNode && (this.parentNodes += this.currentNode + ',');
  }

  getChildNode() {
    const _parentNodes = this.parentNodes;
    const _currentNode = this.currentNode;
    const _typesFlat = this.typesFlat;
    const _typesMapFlat = this.typesMapFlat;

    let _childNodes = [];

    if (_currentNode) {
      const _list = Object.keys(_typesMapFlat[_currentNode] || {});

      _list.forEach(tid => {
        _parentNodes.indexOf(tid) == -1 && _childNodes.push(tid);
      })

    } else {
      for (let key in _typesFlat) {
        if (_typesFlat[key].master)
          _childNodes.push(key);
      }
    }
    return _childNodes;
  }

  isChecked(node) {
    return this.recordTids.indexOf(node) != -1;
  }
}
