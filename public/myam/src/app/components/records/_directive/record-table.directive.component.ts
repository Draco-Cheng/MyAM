import { Component , Input} from '@angular/core';

import { RecordsService } from '../../../service/records.service';
import { TypeService } from '../../../service/type.service';
import { CurrencyService } from '../../../service/currency.service';

import './record-table.style.less';

@Component({
  selector: 'records-table',
  template: require('./record-table.template.html'),
  providers: [
    RecordsService,
    TypeService,
    CurrencyService
  ]
})


export class RecordTableDirectiveComponent {
  @Input() records: any;
  
  private isReady = false;
  private types;
  private typesFlat = {};
  private typesMapFlat = null;
  private currencies;
  private currencyMap = {};

  constructor(
    private recordsService: RecordsService,
    private typeService: TypeService,
    private currencyService: CurrencyService
  ) {};

  async ngOnInit(){
    await this.getTypes();
    await this.getCurrencyMap();
    await this.getTypesFlatMap();
    this.isReady = true;
  }

  async getTypes() {
    this.types = await this.typeService.get();
    this.types.forEach(element => {
      this.typesFlat[element.tid] = element;
    });
  };

  async getTypesFlatMap() {
    this.typesMapFlat = await this.typeService.getFlatMap();
  };

  async getCurrencyMap() {
    this.currencies = await this.currencyService.get();
    this.currencies.forEach(element => {
      this.currencyMap[element.cid] = element;
    });
  };

  tidToLabel(tid: string) {
    return this.typesFlat[tid].type_label;
  }

  cidToLabel(cid: any) {
    return this.currencyMap[cid].type;
  }

  removeTypeInRecord(record, tid) {
    record.tids = record.tids.filter(_tid => tid != _tid);
    this.recordChange(record);
  }

  recordChange(record) {
    record.isChange = true;
  }

  getRecordTypeMapSwitch(record) {
    let _self = this;
    return ( tid ) => {
      if(record.tids.indexOf(tid) == -1)
        record.tids.push(tid);
      else
        record.tids = record.tids.filter(_tid => _tid != tid);

      _self.recordChange(record);
    };
  }

  async saveRecord(record) {
    const _resault1 = await this.recordsService.set(record);
    const _resault2 = await this.recordsService.setType(record);

    if (_resault1 && _resault2)
      record.isChange = false;
  }

  async delRecord(record) {
    const _resault = await this.recordsService.del(record);
    if (_resault) {
      record.status = 'removed';
      record.isChange = false;
      record.rid = null;
    }
  }

  async reAdd(record) {
    const _resault = await this.recordsService.set(record);
    record.rid = _resault[0].rid;
    const _resault2 = await this.recordsService.setType(record);
    if (_resault) {
      record.status = '';
      record.isChange = false;
    }
  }


}