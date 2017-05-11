var Promise = require("promise");
var controller = {
  dbFile: require('../controller/dbFile.js')
};
var fs = require('fs');
var dateFormat = require('dateformat');
// logger is special function so its not in the controller object
var logger = require('../controller/logger.js');
var config = require('../config.js');


exports.dbList = async data => {
  logger.debug(data.reqId, 'Check Database Folder ' + (data['uid'] || 'All') + ' exist or not...');
  let _meta = data['meta'];
  let _resMeta = data['resMeta'];

  _meta['path'] = config.dbFolder + 'users/' + (_meta['uid'] ? _meta['uid'] + '/' : '');

  let _pool = [];

  let _list = await controller.dbFile.readdir(data);
  _list.forEach(ele => {
    ele.isDir && _pool.push(ele.name);
  })
  _resMeta['dbList'] = _pool;

  return data;
}

exports.breackPointDbList = async data => {
  logger.debug(data.reqId, 'Check breackPointDbList Database Folder' + (data['uid'] || 'All') + ' exist or not...');
  let _meta = data['meta'];
  let _resMeta = data['resMeta'];

  _meta['path'] = config.dbFolder + 'users/' + _meta['uid'] + '/' + _meta['database'] + '/breackpoint/';


  let _pool = [];

  let _list = await controller.dbFile.readdir(data);

  _list.forEach(ele => {
    !ele.isDir && _pool.push(ele.name);
  })
  _resMeta['dbList'] = _pool;

  return data;
}


var _backupDB = function(data, callback) {
  data = data || {};
  logger.debug(data.reqId, "Check Database Folder" + data.dbFileName + " exist or not...");

  controller.dbFile.checkFile({ checkFile: config.dbFolder + data.dbFileName })
    .then(function(_tempData) {
      if (_tempData.fileExists) {
        if (controller.dbFile.createFolder(config.backupFolder + data.dbFileName))
          return controller.dbFile.copyFile(config.dbFolder + data.dbFileName, config.backupFolder + data.dbFileName + "/" + dateFormat(Date.now(), "yyyymmdd") + "-bk-" + data.dbFileName);
      }
      callback();
    })
    .then(function(data) { callback(); })
    .catch(console.error);

}
exports.backupDB = Promise.denodeify(_backupDB);


var _renameDB = function(data, callback) {
  data = data || {};
  logger.debug(data.reqId, "Check Database Folder" + data.dbFileName + " exist or not...");

  if (!fs.existsSync(config.dbFolder + data.dbFileName)) {
    data.code = 412;
    return callback(data)
  }

  if (fs.existsSync(config.dbFolder + data.dbFileRename) || fs.existsSync(config.backupFolder + data.dbFileRename)) {
    data.code = 409;
    return callback(data)
  }

  if (controller.dbFile.renameFile(config.dbFolder + data.dbFileName, config.dbFolder + data.dbFileRename)) {
    if (fs.existsSync(config.backupFolder + data.dbFileName))
      controller.dbFile.renameFile(config.backupFolder + data.dbFileName, config.backupFolder + data.dbFileRename);

    return callback();
  } else {
    data.code = 500;
    return callback(data);
  }
}
exports.renameDB = Promise.denodeify(_renameDB);


exports.delDB = async data => {
  logger.debug(data['reqId'], 'Check Database Folder ' + data['dbPath'] + ' exist or not...');

  if (!fs.existsSync(data['dbPath'])) {
    data['error'] = {
      code: 412,
      message: 'DB_NOT_FOUND'
    };
    return data;
  }

  data['meta'] = {
    'delPath': data['dbPath']
  };

  await controller.dbFile.removeFolder(data);

  return data;

  /*
      if (controller.dbFile.createFolder(config.backupFolder + data.dbFileName))
      controller.dbFile.copyFile(config.dbFolder + data.dbFileName, config.backupFolder + data.dbFileName + "/" + dateFormat(Date.now(), "yyyymmdd") + "-bk-delete-" + data.dbFileName)
      .then(function() {
        setTimeout(function() {
          controller.dbFile.renameFile(config.backupFolder + data.dbFileName, config.backupFolder + "[legecy-" + Date.now() + "]" + data.dbFileName);
          fs.unlinkSync(config.dbFolder + data.dbFileName);
          callback();
        })
      });
  */
}

/*var _downloadDB = function(data, callback) {
  data = data || {};

  if (!fs.existsSync(data.dbFileName)) {
    data.code = 412;
    return callback(data)
  }

  var _fileName = config.uploadTempDir + dateFormat(Date.now(), "yyyymmdd-HHMM") + "-" + data.dbFileName;

  controller.dbFile.copyFile(config.dbFolder + data.dbFileName, _fileName)
    .then(function() {
      data.downloadLink = _fileName.replace("./public/", "/");
      callback(null, data);
      setTimeout(function() {
        fs.unlinkSync(_fileName);
      }, 1000 * 60 * 30)
    });

}
exports.downloadDB = Promise.denodeify(_downloadDB);*/

exports.checkFileExist = async data => {
  const _path = data['meta']['path'];

  data['resault'] = !!fs.existsSync(data['dbPath']);
  return data;

}

//***************************** syncDB *****************************
var _syncTimeout = {};
var _syncList = [];
var _syncDB = function(data) {
  if (_syncList.indexOf(data.dbFileName) == -1)
    _syncList.push(data.dbFileName);
}
exports.syncDB = Promise.denodeify(_syncDB);

process.on('uncaughtException', function(err) { process.exit(); });
process.on('SIGINT', function(err) { process.exit(); });
process.on('SIGHUP', function(err) { process.exit(); });
process.on('exit', function(err) {
  _syncList.forEach(function(dbName) {
    logger.debug("syncDB Database Folder" + dbName + " ...");
    if (fs.existsSync(config.dbFolder + dbName))
      if (controller.dbFile.createFolder(config.backupFolder + dbName))
        fs.writeFileSync(config.backupFolder + dbName + "/sync-" + dbName, fs.readFileSync(config.dbFolder + dbName));
  })
});
