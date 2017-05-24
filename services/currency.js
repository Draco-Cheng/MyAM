var logger = require('../controller/logger.js');

var controller = {
  dbController: require('../controller/dbController.js'),
  dbFile: require('../controller/dbFile.js')
};

exports.getCurrencies = async function(data) {
  try {
    await controller.dbFile.checkDB(data);
    await controller.dbController.connectDB(data);
    await controller.dbController.getCurrencies(data);
    await controller.dbController.closeDB(data);
  } catch (e) {
    logger.error(e);
    data['error'] = { code: 500 };
  }
  return data;
}

var createCurrency = async function(data) {
  try {
    const _meta = data['meta'];

    var _resault = _meta['currencies'];
    var _to_cid_isexist = false;
    var _cid_dependency = false;
    var _original_tocid = null;
    var _main_cid = false;

    _resault.forEach(currency => {
      if (data.to_cid == currency.cid)
        _to_cid_isexist = true;
      if (data.cid == currency.to_cid)
        _cid_dependency = true;
      if (data.cid == currency.cid)
        _original_tocid = currency.to_cid;
      if (!currency.to_cid && currency.main)
        _main_cid = currency.cid;
    });

    if (data.main) {
      if (!data.cid && !data.to_cid) {
        data.to_cid_rate = data.rate;
        data.main_cid = _main_cid;
        data.rate = 1;
        return await controller.dbController.setCurrencies(data);
      }

      if (!data.cid && data.to_cid) {
        data['error'] = { code: 424 };
        return data;
      }
    }

    if (!data.cid && !data.main) {
      return await controller.dbController.setCurrencies(data);
    }


    if (data.cid && data.main && data.to_cid != _original_tocid) {
      data['error'] = { code: 424, message: 'main_cid_cant_change_to_cid' };
      return data;
    }

    if (!_to_cid_isexist && _main_cid != data.cid) {
      data['error'] = { code: 424, message: 'to_cid_not_exist' };
      data.message = 'to_cid_not_exist';
      return data;
    }

    if (_cid_dependency && data.to_cid != _original_tocid) {
      data['error'] = { code: 424, message: 'to_cid_dependency' };
      return data;
    }

    delete data.main;

    return await controller.dbController.setCurrencies(data);
  } catch (e) {
    logger.error(e);
    data['error'] = { code: 500 };
  }
};

exports.setCurrencies = async function(data) {
  try {
    const _isNewData = !data.cid;

    await controller.dbController.connectDB(data);

    //*****************************
    // get currency list
    var _tempData = {
      db: data.db,
      reqId: data.reqId
    }
    await controller.dbController.getCurrencies(_tempData);

    //*****************************
    // check to_cid is exsist
    data['meta'] = { currencies: _tempData.resault }
    await createCurrency(data);
    if (data['error']) return data;

    //*****************************
    // update main currency if need
    if (data.main && !data.to_cid && data.to_cid_rate && data.main_cid) {
      await controller.dbController.updateMainCurrency(data);

      // if fail revert add main currency
      if (_isNewData && data['error']) {
        data.del_cid = data.cid;
        await delCurrencies(data);
      }
    }
    await controller.dbController.closeDB(data);

  } catch (e) {
    logger.error(e);
    data['error'] = { code: 500 };
  }

  return data;
}

var delCurrencies = exports.delCurrencies = async function(data) {
  try {
    data.limit = 1;

    await controller.dbController.connectDB(data);

    //*****************************
    // get rocords for check dependency
    data.cid = data.del_cid;
    await controller.dbController.getRecord(data);

    //*****************************
    // check rocords dependency
    var _resault = data.resault.length;

    data.to_cid = data.del_cid;
    delete data.cid;

    if (_resault) {
      data['error'] = { code: 424, message: 'record_dependencies' };
      return data;
    }


    //*****************************
    // check currencies dependency (no cilds)
    await controller.dbController.getCurrencies(data);
    var _resault = data.resault.length;
    data.to_cid = data.del_cid;
    delete data.to_cid;

    if (_resault) {
      data['error'] = { code: 424, message: 'currency_dependencies' };
      return data;
    }

    //*****************************
    // delete currency 
    await controller.dbController.delCurrencies(data);

    await controller.dbController.closeDB(data);
  } catch (e) {
    logger.error(e);
    data['error'] = { code: 500 };
  }

  return data;
}
