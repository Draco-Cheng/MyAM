import { Component, Input, Output } from '@angular/core';

import { RecordsService } from '../../../service/records.service';
import { TypeService } from '../../../service/type.service';
import { CurrencyService } from '../../../service/currency.service';

import './record-summarize-type-flat.style.less';

function roundPrice(num) {
  return Math.round(num * 100) / 100;
}

@Component({
  selector: '[record-summarize-type-flat]',
  template: require('./record-summarize-type-flat.template.html'),
  providers: [
    RecordsService,
    TypeService,
    CurrencyService
  ]
})

export class RecordSummarizeTypeFlatDirectiveComponent {
  @Input() getRecord;

  private __isInit = false;
  private __meta = {};

  private types;
  private typesFlat = {};
  private typeSummerize;

  private currencyFlatMap;

  private defaultCid;

  constructor(
    private recordsService: RecordsService,
    private typeService: TypeService,
    private currencyService: CurrencyService
  ) {};

  async ngOnInit() {
    await this.getTypes();
    await this.getCurrency();
    this.buildSummerize();
    this.__isInit = true;
  }

  async getCurrency() {
    const _currencyMap = await this.currencyService.getMap();
    this.currencyFlatMap = _currencyMap['data']['flatMap'];
    this.defaultCid = this.currencyService.getDefaultCid();
  }

  async getTypes() {
    this.__meta['types'] = await this.typeService.get();
    this.types = this.__meta['types']['data'];

    this.types.forEach(element => {
      this.typesFlat[element.tid] = element;
    });
  };

  async buildSummerize() {
    let _records = this.getRecord();
    let _typeSummerize = this.typeSummerize = {};

    _typeSummerize['types'] = {};
    _typeSummerize['total'] = {};
    _typeSummerize['sum'] = {};

    for (let _record of _records) {
      let _parents = {};
      for (let _tid of _record.tids) {
        let _allRelateNode = await this.typeService.getNodeAllParents(_tid);
        for (let _ptid of _allRelateNode) {
          _parents[_ptid] = true;
        }
      }

      for (let _tid in _parents) {
        if (!_typeSummerize['types'][_tid])
          _typeSummerize['types'][_tid] = {};

        if (!_typeSummerize['types'][_tid][_record.cid]) {
          _typeSummerize['types'][_tid][_record.cid] = {
            count: 0,
            priceCost: 0,
            priceEarn: 0
          };
        }

        const _tcItem = _typeSummerize['types'][_tid][_record.cid];
        _tcItem['count'] += 1;
        _tcItem[_record['cashType'] == -1 ? 'priceCost' : 'priceEarn'] += _record['value'];
      }

      if (!_typeSummerize['total'][_record.cid]) {
        _typeSummerize['total'][_record.cid] = {
          count: 0,
          priceCost: 0,
          priceEarn: 0
        }
      }

      const _cItem = _typeSummerize['total'][_record.cid];
      _cItem['count'] += 1;
      _cItem[_record['cashType'] == -1 ? 'priceCost' : 'priceEarn'] += _record['value'];

    }

    let _sumCost = 0;
    let _sumEarn = 0;
    let _sumCount = 0;
    for (let _cid in _typeSummerize['total']) {
      if (_cid == this.defaultCid) {
        _sumCost += _typeSummerize['total'][_cid]['priceCost'];
        _sumEarn += _typeSummerize['total'][_cid]['priceEarn'];
      } else {
        _sumCost += this.currencyEx(_cid, _typeSummerize['total'][_cid]['priceCost']);
        _sumEarn += this.currencyEx(_cid, _typeSummerize['total'][_cid]['priceEarn']);
      }

      _sumCount += _typeSummerize['total'][_cid]['count'];

    }
    _typeSummerize['sum']['priceCost'] = roundPrice(_sumCost);
    _typeSummerize['sum']['priceEarn'] = roundPrice(_sumEarn);
    _typeSummerize['sum']['sum'] = roundPrice(_sumEarn - _sumCost);;
    _typeSummerize['sum']['count'] = _sumCount;

    this.typeSummerize = _typeSummerize;
  }

  objKey(obj) {
    return Object.keys(obj);
  }

  cidToLabel(cid) {
    return this.currencyFlatMap[cid]['type'];
  }

  currencyEx(cid, value) {
    return this.currencyService.exchange(cid, this.defaultCid, value)['value'];
  }

  getSumForDefaultCid() {

  }
}
