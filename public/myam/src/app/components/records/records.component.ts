import { Component } from '@angular/core';

import { RecordsService } from '../../service/records.service';

import './records.style.less';

@Component({
  selector: 'content',
  template: require('./records.template.html'),
  providers: [
    RecordsService
  ]
})
export class RecordsComponent {
  private records;
  async getRecord() {
    this.records = await this.recordsService.get();
  };

  constructor(
    private recordsService: RecordsService
  ) {
    this.getRecord();
  };
}
