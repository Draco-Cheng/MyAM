var fs = require('fs');
var rimraf = require('rimraf');
var formidable = require('formidable');
var dateFormat = require('dateformat');
var mkdirp = require('mkdirp');

var config = require('../config.js');
var logger = require('./logger.js');


exports.checkFile = function(data) {
  return new Promise((resolve, reject) => {
    try {
      fs.exists(data.checkFile, function(exists) {
        // handle result
        data.fileExists = exists;
        resolve(data);
      });
    } catch (e) {
      logger.error(data.reqId, e.stack);
      reject(e);
    }
  });
};
//exports.check = _check;

exports.checkDB = function(data) {
  return new Promise((resolve, reject) => {
    try {
      data.checkFile = data.dbFile;
      logger.debug(data.reqId, 'Check Database ' + data.checkFile + ' exist or not...');

      exports.checkFile(data).then(function(data) {
        if (!data.fileExists) {
          var _msg = 'Database ' + data.checkFile + ' not exist...';
          logger.warn(data.reqId, _msg);
          data['resault'] = { isExist: false };
        } else {
          var _msg = 'Database ' + data.checkFile + ' exist...';
          logger.warn(data.reqId, _msg);
          data['resault'] = { isExist: true };
        }

        delete data.checkFile;
        resolve(data);
      });
    } catch (e) {
      logger.error(data.reqId, e.stack);
      reject(e);
    }
  });
}

exports.createFile = function(data, callback) {
  return new Promise((resolve, reject) => {
    try {
      fs.writeFile(data.createFile, '', function(err) {
        if (err)
          logger.error(err);
        else
          logger.info(data.reqId, 'create file ' + data.createFile);
        resolve(data);
      });
    } catch (e) {
      logger.error(data.reqId, e.stack);
      reject(e);
    }
  });
}


exports.unlinkFile = function(data) {
  return new Promise((resolve, reject) => {
    try {
      const _file = data['meta']['file'];

      fs.unlink(_file, function(err) {
        if (err)
          logger.error(data.reqId, err);
        else
          logger.info(data.reqId, 'unlink file ' + _file);
        resolve(data);
      });
    } catch (e) {
      logger.error(data.reqId, e.stack);
      reject(e);
    }
  });
}

var isDirectory = exports.isDirectory = function(data, dirList) {
  return new Promise((resolve, reject) => {
    try {
      var _pool = [];
      var _path = data['meta']['path'] ? (data['meta']['path'].substr(-1, 1) == '/' ? data['meta']['path'] : data['meta']['path'] + '/') : '';
      logger.debug(data.reqId, 'get stat:' + _path);

      dirList.forEach(dir => {
        fs.stat(_path + dir, function(err, stats) {
          _pool.push({ name: dir, isDir: stats.isDirectory(), stats: stats });
          if (dirList.length == _pool.length) {
            resolve(_pool)
          }
        })
      });
    } catch (e) {
      logger.error(data.reqId, e.stack);
      reject(e);
    }
  });
}

exports.readdir = function(data) {
  return new Promise((resolve, reject) => {
    try {
      logger.debug(data.reqId, 'readdir : ' + data['meta']['path']);
      let _dir = fs.readdir(data['meta']['path'], async(err, dir) => {
        resolve((dir && dir.length) ? await isDirectory(data, dir) : []);
      });
    } catch (e) {
      logger.error(data.reqId, e.stack);
      reject(e);
    }
  });
}

exports.createdir = function(data) {
  return new Promise((resolve, reject) => {
    try {
      logger.debug(data.reqId, 'readdir : ' + data['meta']['path']);
      let _dir = fs.mkdir(data['meta']['path'], (err, dir) => {
        resolve(data['resault'] = 200);
      });
    } catch (e) {
      logger.error(data.reqId, e.stack);
      reject(e);
    }
  });
}


exports.upload = function(data) {
  return new Promise((resolve, reject) => {
    try {
      logger.log(data.reqId, '[Files]'.bgWhite.black + '\tUpload files...');

      var _request = data.request;
      var _form = new formidable.IncomingForm();
      _form.uploadDir = config.uploadTempDir || require('os').tmpdir();

      var _timeFlag = Date.now();
      _form.on('progress', (bytesReceived, bytesExpected) => {
        if (Date.now() >= _timeFlag) {
          var _percentage = ((bytesReceived / bytesExpected) * 100).toFixed(2)
          logger.log(data.reqId, '[Files]'.bgWhite.black + ' progress: ' + _percentage + '% ( ' + bytesReceived + '\t/ ' + bytesExpected + ')');
          _timeFlag = Date.now() + 1000;
        }
      });

      _form.parse(_request, (error, fields, files) => {
        logger.log(data.reqId, '[Files]'.bgWhite.black + ' progress: done...');

        if (error) {
          logger.log(data.reqId, '[Files]'.bgRed + (' upload file error ' + error).red);
          data['error'] = {
            code: 406,
            message: 'UPLOAD_FAILD'
          }
          return resolve(data);
        }

        if (!fields['name']) {
          logger.log(data.reqId, '[Files]'.bgRed + (' No file name ').red);
          data['error'] = {
            code: 406,
            message: 'NO_FILE_NAME'
          }
          return resolve(data);
        }

        // file temp path is  in files['file']['path']
        const _file = files['file'];

        data['resault'] = {
          'name': fields['name'],
          'file': _file
        };

        resolve(data);
      });
    } catch (e) {
      logger.error(data.reqId, e.stack);
      reject(e);
    }
  });

}

exports.unlink = function(data) {
  return new Promise((resolve, reject) => {
    try {
      var _path = data['meta']['deleteFile'];
      var _retry = 0;
      logger.log(data.reqId, '[Files]'.bgRed + ' Delete file... \t' + 'File Name:'.bgRed + ' ' + _path);

      var _delete = () => {
        fs.unlink(_path, (err) => {
          if (err) {
            if (_retry < 3)
              return setTimeout(_delete, 100);
            logger.log(data.reqId, '[Files]'.bgRed + (' Delete file error ' + err).red);
          }
          resolve();
        });
      }
      _delete();
    } catch (e) {
      logger.error(data.reqId, e.stack);
      reject(e);
    }
  });
}

exports.createFolderSync = function(path) {
  try {
    mkdirp.sync(path);
  } catch (e) {
    logger.error('Can\'t create ' + path + '\tERROR : ' + e);
  }
}

exports.copyFile = function(source, target) {
  /**********************************************
  Error: EXDEV, Cross-device link
  **********************************************/
  return new Promise((resolve, reject) => {
    try {
      var is = fs.createReadStream(source);
      var os = fs.createWriteStream(target);
      is.pipe(os);
      is.on('end', function() {
        resolve();
      });
    } catch (e) {
      logger.error(e);
      reject(e);
    }
  });

  /*********************************************/
}

exports.renameFile = function(data) {
  try {
    logger.debug('Rename file: ' + data['meta']['source'] + ' -> ' + data['meta']['target']);
    fs.renameSync(data['meta']['source'], data['meta']['target']);
    data['resault'] = true;
    return data;
  } catch (e) {
    console.log(e.stack)
    data['resault'] = false;
    return data;
  }
}

exports.removeFolder = function(data) {
  return new Promise((resolve, reject) => {
    try {
      const _meta = data['meta'];
      const _path = _meta['delPath'];

      rimraf(_path, () => {
        resolve();
      });

    } catch (e) {
      logger.error(data.reqId, e.stack);
      reject(e);
    }
  });
}

//***************************** syncDB *****************************
var syncDbList = {};

var syncDB = function() {
  let _uid;
  let _dbName;

  if (typeof arguments[0] == 'object') {
    _uid = arguments[0]['uid'];
    _dbName = arguments[0]['dbName'];
  } else {
    _uid = arguments[0];
    _dbName = arguments[1];
  }

  if (!_uid || !_dbName) return;

  syncDbList[_uid] = syncDbList[_uid] || {};
  syncDbList[_uid][_dbName] = true;
};

syncDB.del = (uid, dbName) => {
  if (syncDbList[uid])
    delete syncDbList[uid][dbName];
};

syncDB.fire = () => {
  logger.info('SyncDB Fire!');

  for (let _uid in syncDbList) {
    for (let _dbName in syncDbList[_uid]) {
      try {
        logger.debug('SyncDB Database: ' + _uid + ' , ' + _dbName);
        let _dbPath = config.dbFolder + 'users/' + _uid + '/' + _dbName + '/database.db';
        let _bkDbFolderPath = config.backupFolder + 'users/' + _uid + '/' + _dbName;
        let _bkDbFilePath = _bkDbFolderPath + '/sync-database.db';

        if (fs.existsSync(_dbPath)) {
          this.createFolderSync(_bkDbFolderPath);
          fs.writeFileSync(_bkDbFilePath, fs.readFileSync(_dbPath));
        }
      } catch (e) {
        logger.error(e);
      }

      delete syncDbList[_uid][_dbName];
    }
    delete syncDbList[_uid];
  }
}

exports.syncDB = syncDB;

if (config.syncDbInterval > 1000) {
  setInterval(syncDB.fire, config.syncDbInterval);
}

process.on('uncaughtException', function(err) { process.exit(err); });
process.on('SIGINT', function(err) { process.exit(err); });
process.on('SIGHUP', function(err) { process.exit(err); });
process.on('exit', function(err) {
  err && logger.error(err);
  syncDB.fire();
});
