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

  private typeMap = {};
  private currencies;
  private currencyMap = {};

  async getTypeMap() {
    const _types = await this.typeService.get();
    _types.forEach(element => {
      this.typeMap[element.tid] = element;
    });
  };

  async getCurrencyMap() {
    this.currencies = await this.currencyService.get();
    this.currencies.forEach(element => {
      this.currencyMap[element.cid] = element;
    });
  };

  tidToLabel(tidStrArr: string) {
    const tids = tidStrArr ? tidStrArr.split(/,/g) : [];
    let types = [];

    tids.forEach(tid => {
      types.push({
        'tid': tid,
        'label': this.typeMap[tid].type_label
      });
    });

    return types;
  }

  cidToLabel(cid: any) {
    return this.currencyMap[cid].type;
  }

  removeTypeInRecord(record, type) {
    let _tidArr = record.tids.split(',');
    record.tids = _tidArr.filter(tid => tid != type.tid).join(',');
    this.recordChange(record);
  }

  recordChange(record) {
    record.isChange = true;
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

  constructor(
    private recordsService: RecordsService,
    private typeService: TypeService,
    private currencyService: CurrencyService
  ) {
    this.getTypeMap();
    this.getCurrencyMap();
  };
}