import { Component, Input } from '@angular/core';

import './record-type-quick-list.style.less';

@Component({
  selector: 'record-type-quick-list',
  template: require('./record-type-quick-list.template.html'),
  providers: []
})

export class RecordQuickListDirectiveComponent {
  @Input() types: any;
  @Input() recordTids: any;
  @Input() recordTidSwitch: Function;

  private typeQuickList;

  constructor() {};

  ngOnInit() {
    this.typeQuickList = this.types.filter(type => type.quickSelect);
  };

  isCheck(type) {

    return this.recordTids[type.tid];
  }
}
