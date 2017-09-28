import { Injectable } from '@angular/core';

import { RequestHandler } from '../handler/request.handler';
import { CacheHandler } from '../handler/cache.handler';
import { ConfigHandler } from '../handler/config.handler';
import { NotificationHandler } from '../handler/notification.handler';

import { TypeService } from './type.service';
import { CurrencyService } from './currency.service';


@Injectable() export class SummarizeService {
  constructor(
    private typeService: TypeService,
    private currencyService: CurrencyService
  ) {};

  async buildSummerize(records) {
    let _records = records;
    let _typeService = this.typeService;
    let _currencyService = this.currencyService;
    let _defaultCid = _currencyService.getDefaultCid();
    let _typeSummerize = {};

    _typeSummerize['types'] = {};
    _typeSummerize['typeNone'] = {};
    _typeSummerize['total'] = {};
    _typeSummerize['sum'] = {};

    for (let _record of _records) {
      let _parents = {};
      for (let _tid of _record.tids) {
        let _allRelateNode = await _typeService.getAllParentsInTree(_tid);
        for (let _ptid of _allRelateNode) {
          _parents[_ptid] = true;
        }

        _parents[_tid] = true;
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

      if (Object.keys(_parents).length == 0) {
        if (!_typeSummerize['typeNone'][_record.cid]) {
          _typeSummerize['typeNone'][_record.cid] = {
            count: 0,
            priceCost: 0,
            priceEarn: 0
          };
        }

        const _ncItem = _typeSummerize['typeNone'][_record.cid];
        _ncItem['count'] += 1;
        _ncItem[_record['cashType'] == -1 ? 'priceCost' : 'priceEarn'] += _record['value'];
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
      if (_cid == _defaultCid) {
        _sumCost += _typeSummerize['total'][_cid]['priceCost'];
        _sumEarn += _typeSummerize['total'][_cid]['priceEarn'];
      } else {
        _sumCost += _currencyService.exchange(_cid, _defaultCid, _typeSummerize['total'][_cid]['priceCost'])['value'];
        _sumEarn += _currencyService.exchange(_cid, _defaultCid, _typeSummerize['total'][_cid]['priceEarn'])['value'];
      }

      _sumCount += _typeSummerize['total'][_cid]['count'];

    }
    _typeSummerize['sum']['priceCost'] = _sumCost;
    _typeSummerize['sum']['priceEarn'] = _sumEarn;
    _typeSummerize['sum']['sum'] = _sumEarn - _sumCost;
    _typeSummerize['sum']['count'] = _sumCount;

    return _typeSummerize;
  }


  async typeSummerizeToPieChart(typeSummerize, typelist, unclassifiedTypeList ? ) {
    let _ngxChartData = [];

    for (let i = 0; i < typelist.length; i++) {
      
      let _tid = typelist[i];
      let _costSum = 0;
      let _earnSum = 0;

      for (let _cid in typeSummerize['types'][_tid]) {
        let _typeSumRecord = typeSummerize['types'][_tid][_cid];
        _costSum += this.currencyService.exchange(_cid, null, _typeSumRecord['priceCost'])['value'];
        _earnSum += this.currencyService.exchange(_cid, null, _typeSumRecord['priceEarn'])['value'];
      }

      if (_costSum || _earnSum) {
        const _tidLabel = await this.typeService.tidToLable(_tid);

        _costSum && _ngxChartData.push({ 'name': `[C] ${_tidLabel}`, 'value': _costSum });
        _earnSum && _ngxChartData.push({ 'name': `[E] ${_tidLabel}`, 'value': _earnSum });
      }
    }

    return _ngxChartData;
  }
}