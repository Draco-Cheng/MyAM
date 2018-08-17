import { Component, Input, Output } from '@angular/core';

import { RecordsService } from '../../../service/records.service';
import { TypeService } from '../../../service/type.service';
import { CurrencyService } from '../../../service/currency.service';

import './record-summarize-type-flat.style.less';

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
  @Input() getTypeSummerize: Function;

  private __isInit = false;
  private __meta = {};

  private types;
  private typesFlat = {};
  private typesMapFlatMeta;
  private typeSummerize;
  private currencyTotalSummerize;

  private currencyFlatMap;

  private defaultCid;

  private summarizeReady;

  constructor(
    private recordsService: RecordsService,
    private typeService: TypeService,
    private currencyService: CurrencyService
  ) { };

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
    this.typesMapFlatMeta = await this.typeService.getFlatMap();

    this.types = this.__meta['types']['data'];

    this.types.forEach(element => {
      this.typesFlat[element.tid] = element;
    });
  };

  async buildSummerize() {
    this.summarizeReady = false;

    this.typeSummerize = this.getTypeSummerize();
    this.buildTotalByCurrencyType(this.typeSummerize['total']);

    setTimeout(() => this.summarizeReady = true);
  }

  buildTotalByCurrencyType(totalObj) {
    let _mergeTotal = this.currencyTotalSummerize = {};
    let _defaultCurrencyType = this.cidToLabel(this.defaultCid);

    for (let cid in totalObj) {
      let cType = this.cidToLabel(cid);
      if (!_mergeTotal[cType]) {
        _mergeTotal[cType] = {};
        _mergeTotal[cType]['count'] = 0;
        _mergeTotal[cType]['priceCost'] = 0;
        _mergeTotal[cType]['priceEarn'] = 0;

        if (_defaultCurrencyType != cType) {
          _mergeTotal[cType]['isExchange'] = true;
          _mergeTotal[cType]['priceCostExchange'] = 0;
          _mergeTotal[cType]['priceEarnExchange'] = 0;
        }
      }

      _mergeTotal[cType]['count'] += totalObj[cid]['count'];
      _mergeTotal[cType]['priceCost'] += totalObj[cid]['priceCost'];
      _mergeTotal[cType]['priceEarn'] += totalObj[cid]['priceEarn'];

      if (_defaultCurrencyType != cType) {
        _mergeTotal[cType]['priceCostExchange'] += this.currencyEx(cid, totalObj[cid]['priceCost']);
        _mergeTotal[cType]['priceEarnExchange'] += this.currencyEx(cid, totalObj[cid]['priceEarn']);
      }
    }
  }

  objKey(obj) {
    return Object.keys(obj);
  }

  cidToLabel(cid) {
    return this.currencyFlatMap[cid]['type'];
  }

  currencyEx = (cid, value) => {
    return this.currencyService.exchange(cid, this.defaultCid, value)['value'];
  }

  roundPrice(num) {
    if (num == 0) return 0;
    return Math.round(num * 100) / 100 || 0.01;
  }
}
