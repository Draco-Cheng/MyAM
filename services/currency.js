var Promise = require("promise");

var controller = {
  dbController: require('../controller/dbController.js'),
  dbFile: require('../controller/dbFile.js')
};

// logger is special function so its not in the controller object
var logger = require("../controller/logger.js");

var _getCurrencies = function(data, callback) {
  var _checkDB = controller.dbFile.checkDB(data);

  _checkDB.then(function(data) {
      return controller.dbController.connectDB(data);
    })
    .then(function(data) {
      return controller.dbController.getCurrencies(data);
    })
    .then(function(data) {
      return controller.dbController.closeDB(data);
    })
    .then(function(data) {
      callback(null, data);
    });

  _checkDB.catch(function(data) {
    callback(data)
  });
}
exports.getCurrencies = Promise.denodeify(_getCurrencies);

var _setCurrencies = function(data, callback) {
  controller.dbController.connectDB(data)
    .then(function(data) {
      var _tempData = {
        db: data.db,
        reqId: data.reqId
      }
      return controller.dbController.getCurrencies(_tempData);
    })
    .then(function(tempData) {
      var _resault = tempData.resault;
      //**** check to_cid is exsist ****
      var _to_cid_isexist = false;
      var _cid_dependency = false;
      var _original_tocid = null;
      var _main_cid = false;

      _resault.forEach(function(currency) {
        if (data.to_cid == currency.cid)
          _to_cid_isexist = true;
        if (data.cid == currency.to_cid)
          _cid_dependency = true;
        if (data.cid == currency.cid)
          _original_tocid = currency.to_cid;
        if (!currency.to_cid && currency.main)
          _main_cid = currency.cid;
      })

      if (data.main) {
        if (!data.cid && !data.to_cid) {
          data.to_cid_rate = data.rate;
          data.main_cid = _main_cid;
          data.rate = 1;

          return controller.dbController.setCurrencies(data);
        }

        if (!data.cid && data.to_cid) {
          data.code = 424;
          throw data;
        }
      }

      if (!data.cid && !data.main)
        return controller.dbController.setCurrencies(data);


      if (data.cid && data.main && data.to_cid != _original_tocid) {
        data.code = 424;
        data.message = "main_cid_cant_change_to_cid";
        throw data;
      }

      if (!_to_cid_isexist && _main_cid != data.cid) {
        data.code = 424;
        data.message = "to_cid_not_exist";
        throw data;
      }

      if (_cid_dependency && data.to_cid != _original_tocid) {
        data.code = 424;
        data.message = "to_cid_dependency";
        throw data;
      }

      delete data.main;

      return controller.dbController.setCurrencies(data);
    })
    .then(function(data) {
      if (data.main && !data.to_cid && data.to_cid_rate && data.main_cid) {
        return controller.dbController.updateMainCurrency(data);
      } else
        return new Promise(function(resolve, reject) { resolve(data) });
    })
    .nodeify(function(err) {
      controller.dbController.closeDB(data).then(function() {
        err && logger.error(data.reqId, err);
        callback(err, data);
      });
    });

}
exports.setCurrencies = Promise.denodeify(_setCurrencies);

var _delCurrencies = function(data, callback) {
  data.limit = 1;

  controller.dbController.connectDB(data)
    .then(function(data) {
      data.cid = data.del_cid;
      return controller.dbController.getRecord(data);
    })
    .then(function(data) {
      var _resault = data.resault.length;

      data.to_cid = data.del_cid;
      delete data.cid;

      if (_resault) {
        data.code = 424;
        data.message = "record_dependencies";
        throw data;
      } else
        return controller.dbController.getCurrencies(data);
    })
    .then(function(data) {
      var _resault = data.resault.length;
      data.to_cid = data.del_cid;
      delete data.to_cid;

      if (_resault) {
        data.code = 424;
        data.message = "currency_dependencies";
        throw data;
      } else
        return controller.dbController.delCurrencies(data);
    })
    .nodeify(function(err) {
      controller.dbController.closeDB(data).then(function() {
        err && logger.error(data.reqId, err);
        callback(err, data);
      });
    });

}
exports.delCurrencies = Promise.denodeify(_delCurrencies);
