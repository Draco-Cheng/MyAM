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

  private currencyFlatMap;

  private defaultCid;

  private summarizeReady;

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
    this.typesMapFlatMeta = await this.typeService.getFlatMap();

    this.types = this.__meta['types']['data'];

    this.types.forEach(element => {
      this.typesFlat[element.tid] = element;
    });
  };

  async buildSummerize() {
    this.summarizeReady = false;

    this.typeSummerize = this.getTypeSummerize();

    setTimeout(() => this.summarizeReady = true);
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
    if(num == 0) return 0;
    return Math.round(num * 100) / 100 || 0.01;
  }
}
