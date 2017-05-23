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
  let _responseObj = data['responseObj'];

  _meta['path'] = config.dbFolder + 'users/' + (_meta['uid'] ? _meta['uid'] + '/' : '');

  let _pool = [];

  let _list = await controller.dbFile.readdir(data);
  _list.forEach(ele => {
    ele.isDir && _pool.push(ele.name);
  })
  _responseObj['dbList'] = _pool;

  return data;
}

exports.breackPointDbList = async data => {
  let _meta = data['meta'];
  let _responseObj = data['responseObj'];

  logger.debug(data.reqId, 'Check breackPointDbList Database Folder ' + (_meta['uid'] || 'All') + ' exist or not...');

  _meta['path'] = config.dbFolder + 'users/' + _meta['uid'] + '/' + _meta['database'] + '/breakpoint/';


  let _pool = {};

  let _list = await controller.dbFile.readdir(data);

  _list.forEach(ele => {
    !ele.isDir && ele.name.indexOf('.db') != -1 && (_pool[ele.name] = ele);
  });
  _responseObj['breackPointList'] = _pool;


  return data;
}

exports.checkBackUp = async data => {
  const _resObj = data['responseObj'];
  if (!_resObj['breakpoint'] || !_resObj['dbList'].length) {
    return;
  }

  logger.debug(data.reqId, 'Check Database Backup Folder For User: ' + data['uid']);

  let _timeFlag = Date.now() - _resObj['breakpoint'] * 24 * 60 * 60 * 1000;
  let _tempData = {};
  let _uid = data['uid'];

  _tempData['reqId'] = data.reqId;
  _tempData['meta'] = {};
  _tempData['meta']['uid'] = data.uid;
  _tempData['responseObj'] = {};

  for (let _dbName of _resObj['dbList']) {
    _tempData['meta']['database'] = _dbName;
    await this.breackPointDbList(_tempData);

    let _breackPointList = _tempData['responseObj']['breackPointList'];
    let _breackPointNameList = Object.keys(_breackPointList).sort().reverse();
    let _needBackup = true;

    let _loopIndex = 0;
    let _lastBreakPointFileName;

    while (_loopIndex < _breackPointNameList.length) {
      let _breackPointName = _breackPointNameList[_loopIndex];
      let _bTime = new Date(_breackPointName.split('.')[0]);

      if (_bTime != 'Invalid Date') {
        if (_bTime > _timeFlag) {
          _needBackup = false;
        } else {
          _lastBreakPointFileName = _breackPointName;
        }
        _loopIndex = _breackPointNameList.length;
      } else {
        _loopIndex += 1;
      }
    };


    if (_needBackup) {
      let _dbFolderPath = config.dbFolder + 'users/' + _uid + '/' + _dbName;
      let _breackPointFolderPath = _dbFolderPath + '/breakpoint';
      let _dbFilePath = _dbFolderPath + '/database.db';

      if (_lastBreakPointFileName) {
        // if db not update skip backup
        let _info = fs.statSync(_dbFilePath);
        if (_info['mtime'] == _breackPointList[_lastBreakPointFileName]['stats']['mtime'])
          continue;
      }

      let _fileName = dateFormat(Date.now(), 'yyyy-mm-dd') + '.db';

      // copy to breakpoint folder
      controller.dbFile.createFolderSync(_breackPointFolderPath);
      controller.dbFile.copyFile(_dbFilePath, _breackPointFolderPath + "/" + _fileName);

      // make a copy to backup folder
      await makeBreakPointInBackupFolder(_uid, _dbName, _fileName);
    }
  }
}

var renameBackupFolder = (uid, dbName, newDbName) => {
  let _backupFolderPath = config.backupFolder + 'users/' + uid + '/';
  const _data = {
    meta: {
      source: _backupFolderPath + dbName,
      target: _backupFolderPath + newDbName
    }
  }

  var _resault = controller.dbFile.renameFile(_data);
  if (!_resault)
    logger.warn('[RenameBackupFolder] Fail... Check the log, but please ignore "no such file or directory"');

}

var deleteRenameBackupFolder = (uid, dbName) => {
  let _backupFolderPath = config.backupFolder + 'users/' + uid + '/';
  const _data = {
    meta: {
      source: _backupFolderPath + dbName,
      target: _backupFolderPath + dateFormat(Date.now(), 'yyyymmdd-HHMMss') + '.delete.' + dbName
    }
  }
  controller.dbFile.renameFile(_data);
}

var makeBreakPointInBackupFolder = async(uid, dbName, fileName) => {
  let _dbFolderPath = config.dbFolder + 'users/' + uid + '/' + dbName;
  let _dbFilePath = _dbFolderPath + '/database.db';
  let _backupFolderPath = config.backupFolder + 'users/' + uid + '/' + dbName + '/breakpoint';
  let _fileName = fileName || dateFormat(Date.now(), 'yyyy-mm-dd-HH-MM-ss') + '.db';

  controller.dbFile.createFolderSync(_backupFolderPath);
  await controller.dbFile.copyFile(_dbFilePath, _backupFolderPath + "/" + _fileName);
}


exports.renameDb = async data => {
  let _userPath = data['userPath'];
  let _uid = data['uid'];
  let _dbName = data['meta']['dbName'];
  let _newDbName = data['meta']['newDbName'];

  let _path = _userPath + '/' + _dbName;
  let _targetPath = _userPath + '/' + _newDbName;


  logger.debug(data.reqId, "Check Database Folder" + _path + " exist or not...");

  if (!fs.existsSync(_path)) {
    data['error'] = {
      code: 412,
      message: 'DB_NOT_EXIST'
    };
    return data;
  }

  logger.debug(data.reqId, "Check Target Database Folder" + _targetPath + " exist or not...");

  if (fs.existsSync(_targetPath)) {
    data['error'] = {
      code: 409,
      message: 'DB_TARGET_ALREADY_EXIST'
    };
    return data;
  }

  data['meta'] = {
    'source': _path,
    'target': _targetPath
  };

  await controller.dbFile.renameFile(data);

  if (data['resault']) {
    renameBackupFolder(_uid, _dbName, _newDbName);
    controller.dbFile.syncDB.del(_uid, _dbName);
    controller.dbFile.syncDB(_uid, _newDbName);
    return data;
  } else {
    data['error'] = {
      code: 500
    };
    return data;
  }
}

exports.delDB = async data => {
  logger.debug(data['reqId'], 'Check Database Folder ' + data['dbPath'] + ' exist or not...');

  if (!fs.existsSync(data['dbPath'])) {
    data['error'] = {
      code: 412,
      message: 'DB_NOT_FOUND'
    };
    return data;
  }

  await makeBreakPointInBackupFolder(data['uid'], data['dbName']);
  deleteRenameBackupFolder(data['uid'], data['dbName']);

  controller.dbFile.syncDB.del(data['uid'], data['dbName']);

  data['meta'] = {
    'delPath': data['dbPath']
  };

  await controller.dbFile.removeFolder(data);
}

exports.delBreakponitDb = async data => {
  logger.debug(data['reqId'], 'Check Breakponit Database ' + data['dbFile'] + ' exist or not...');

  if (!fs.existsSync(data['dbFile'])) {
    data['error'] = {
      code: 412,
      message: 'DB_NOT_FOUND'
    };
    return data;
  }

  data['meta'] = {
    'file': data['dbFile']
  };

  await controller.dbFile.unlinkFile(data);

  return data;
}


exports.checkPathExist = async data => {
  const _path = data['meta']['path'];

  data['resault'] = !!fs.existsSync(_path);
  return data;
}


exports.syncDB = controller.dbFile.syncDB;
