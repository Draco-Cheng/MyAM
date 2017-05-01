import { Component, Input } from '@angular/core';

import { RecordsService } from '../../../service/records.service';
import { TypeService } from '../../../service/type.service';

import './record-table.style.less';

@Component({
  selector: 'records-table',
  template: require('./record-table.template.html'),
  providers: [
    RecordsService,
    TypeService
  ]
})


export class RecordTableDirectiveComponent {
  @Input() records: any;

  private __isInit = false;
  private __meta = {};

  private types;
  private typesFlat = {};

  constructor(
    private recordsService: RecordsService,
    private typeService: TypeService
  ) {};

  async ngOnInit() {
    await this.getTypes();

    this.adjustRecordData();
    this.__isInit = true;
  }
  
  async __checkDataUpToDate(){
    if(this.__meta['types']['legacy']){
      await this.getTypes();
    }
  }

  async getTypes() {
    this.__meta['types'] = await this.typeService.get();
    this.types = this.__meta['types']['data'];

    this.types.forEach(element => {
      this.typesFlat[element.tid] = element;
    });
  };

  ObjKey(obj) {
    return Object.keys(obj);
  }

  adjustRecordData() {
    this.records.forEach(record => {
      let _map = {};
      record.tids.forEach(tid => _map[tid] = true);
      record.tids = _map;
    })
  }

  tidToLabel(tid: string) {
    return this.typesFlat[tid].type_label;
  }

  removeTypeInRecord(record, tid) {
    delete record.tids[tid];
    this.recordChange(record);
  }

  recordChange(record) {
    record.isChange = true;
  }

  getRecordTypeMapSwitch(record) {
    let _self = this;
    return (tid) => {
      if (record.tids[tid])
        delete record.tids[tid];
      else
        record.tids[tid] = true;

      _self.recordChange(record);
    };
  }

  getSelectionCallback(record) {
    return cid => {
      record.cid = cid;
      this.recordChange(record);
    }
  }

  async saveRecord(record) {

    const _resault1 = await this.recordsService.set(record);
    const _resault2 = await this.recordsService.setType(record.rid, Object.keys(record.tids));

    if (_resault1['data'] && _resault2['data'])
      record.isChange = false;
  }

  async delRecord(record) {
    const _resault = await this.recordsService.del(record);
    if (_resault['data']) {
      record.status = 'removed';
      record.isChange = false;
      record.rid = null;
    }
  }

  async reAdd(record) {
    const _resault = await this.recordsService.set(record);
    record.rid = _resault['data'][0].rid;
    const _resault2 = await this.recordsService.setType(record.rid, Object.keys(record.tids));
    if (_resault['data']) {
      record.status = '';
      record.isChange = false;
    }
  }


}
