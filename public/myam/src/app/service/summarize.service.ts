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

  async buildDaySummerize(records) {
    let _records = records;
    let _currencyService = this.currencyService;
    let _defaultCid = _currencyService.getDefaultCid();
    let _summerizeTemp = {};
    let _daySummerize = [];

    _records.forEach(record => {
      let _date = record['date'];

      let _dayRecord = _summerizeTemp[_date] = _summerizeTemp[_date] || { 'cost': 0, 'earn': 0, 'date': _date };
      let _price = _currencyService.exchange(record['cid'], _defaultCid, record['value'])['value'];
      _dayRecord[record['cashType'] == -1 ? 'cost' : 'earn'] += _price;
    });

    Object.keys(_summerizeTemp)
      .sort()
      .forEach(date => _daySummerize.push(_summerizeTemp[date]));

    return _daySummerize;
  }

  async buildTypeSummerize(records) {
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


  async typeSummerizeToPieChart(typeSummerize, typelist, unclassifiedTypeList, showTypeNone ? ) {
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

    if (unclassifiedTypeList) {
      for (let i = 0; i < unclassifiedTypeList.length; i++) {

        let _tid = unclassifiedTypeList[i];
        let _costSum = 0;
        let _earnSum = 0;

        for (let _cid in typeSummerize['types'][_tid]) {
          let _typeSumRecord = typeSummerize['types'][_tid][_cid];
          _costSum += this.currencyService.exchange(_cid, null, _typeSumRecord['priceCost'])['value'];
          _earnSum += this.currencyService.exchange(_cid, null, _typeSumRecord['priceEarn'])['value'];
        }

        if (_costSum || _earnSum) {
          const _tidLabel = 'Unclassified Types';
          _costSum && _ngxChartData.push({ 'name': `[C] ${_tidLabel}`, 'value': _costSum });
          _earnSum && _ngxChartData.push({ 'name': `[E] ${_tidLabel}`, 'value': _earnSum });
        }
      }
    }

    if (showTypeNone && typeSummerize['typeNone']) {
      let _typeNoneSum = typeSummerize['typeNone'];
      let _typeNoneCostSum = 0;
      let _typeNoneEarnSum = 0;

      for (let _cid in _typeNoneSum) {
        let _typeNoneSumRecord = _typeNoneSum[_cid];
        _typeNoneCostSum += this.currencyService.exchange(_cid, null, _typeNoneSumRecord['priceCost'])['value'];
        _typeNoneEarnSum += this.currencyService.exchange(_cid, null, _typeNoneSumRecord['priceEarn'])['value'];
      }

      if (_typeNoneCostSum || _typeNoneEarnSum) {
        const _tidLabel = 'No Type Records';
        _typeNoneCostSum && _ngxChartData.push({ 'name': `[C] ${_tidLabel}`, 'value': _typeNoneCostSum });
        _typeNoneEarnSum && _ngxChartData.push({ 'name': `[E] ${_tidLabel}`, 'value': _typeNoneEarnSum });
      }

    }

    return _ngxChartData;
  }

  async daySummerizeToLineChart(daySummerize) {
    let _ngxChartData = {};

    ['Cost', 'Earn', 'Sum'].forEach(valeType => {
      _ngxChartData[valeType] = {
        'name': valeType,
        'series': []
      };
    });

    let _valueCost = 0;
    let _valueEarn = 0;

    daySummerize.forEach(dayRecord => {
      _valueCost += dayRecord['cost'] || 0;
      _valueEarn += dayRecord['earn'] || 0;

      _ngxChartData['Cost']['series'].push({ name: dayRecord['date'], value: _valueCost });
      _ngxChartData['Earn']['series'].push({ name: dayRecord['date'], value: _valueEarn });
      _ngxChartData['Sum']['series'].push({ name: dayRecord['date'], value: _valueEarn - _valueCost });
    });

    return _ngxChartData;
  }
}