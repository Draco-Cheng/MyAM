var fs = require("fs");
var rimraf = require('rimraf');
var logger = require("./logger.js");
var formidable = require("formidable");
var dateFormat = require('dateformat');
var config = require("../config.js");

var _checkFile = function(data, callback) {
  fs.exists(data.checkFile, function(exists) {
    // handle result
    data.fileExists = exists;
    callback(data);
  });

  return new Promise(resolve => callback = resolve);
};
exports.checkFile = _checkFile;
//exports.check = _check;

var _checkDB = function(data) {
  return new Promise(function(resolve, reject) {
    data.checkFile = data.dbFile;
    logger.debug(data.reqId, "Check Database " + data.checkFile + " exist or not...");

    exports.checkFile(data).then(function(data) {
      if (!data.fileExists) {
        var _msg = "Database " + data.checkFile + " not exist...";
        logger.warn(data.reqId, _msg);
        data['resault'] = { isExist: false };
      } else {
        var _msg = "Database " + data.checkFile + " exist...";
        logger.warn(data.reqId, _msg);
        data['resault'] = { isExist: true };
      }

      delete data.checkFile;
      resolve(data);
    });
  });
}
exports.checkDB = _checkDB;

var _createFile = function(data, callback) {
  fs.writeFile(data.createFile, '', function(err) {
    if (err) logger.error(err);
    else logger.info(data.reqId, 'create file ' + data.createFile);
    if (callback) callback(data);
  });

  return new Promise(resolve => callback = resolve);
}
exports.createFile = _createFile;
//exports.createFile = _createFile;

exports.unlinkFile = function(data) {
  const _file = data['meta']['file'];
  let _resolve;

  fs.unlink(_file, function(err) {
    if (err) logger.error(data.reqId, err);
    else logger.info(data.reqId, 'unlink file ' + _file);
    _resolve(data);
  });

  return new Promise((resolve, reject) => _resolve = resolve);
}

exports.isDirectory = async function isDirectory(data, dirList) {
  var _resolve;
  var _pool = [];
  var _path = data['meta']['path'] ? (data['meta']['path'].substr(-1, 1) == '/' ? data['meta']['path'] : data['meta']['path'] + '/') : '';
  logger.debug(data.reqId, 'get stat:' + _path);

  dirList.forEach(function(dir) {
    fs.stat(_path + dir, function(err, stats) {
      _pool.push({ name: dir, isDir: stats.isDirectory(), stats: stats });
      if (dirList.length == _pool.length) {
        _resolve(_pool)
      }
    })
  });

  return new Promise(resolve => _resolve = resolve);
}

exports.readdir = data => {
  var _resolve;
  logger.debug(data.reqId, "readdir : " + data['meta']['path']);
  let _dir = fs.readdir(data['meta']['path'], async(err, dir) => {
    _resolve(dir ? await exports.isDirectory(data, dir) : []);
  });
  return new Promise(resolve => _resolve = resolve);
}

exports.createdir = data => {
  var _resolve;
  logger.debug(data.reqId, "readdir : " + data['meta']['path']);
  let _dir = fs.mkdir(data['meta']['path'], async(err, dir) => {
    _resolve(data['resault'] = 200);
  });
  return new Promise(resolve => _resolve = resolve);
}


var _upload = function(data, callback) {
  logger.log(data.reqId, "[Files]".bgWhite.black + "\tUpload files...");
  var _request = data.request;
  var _form = new formidable.IncomingForm();
  _form.uploadDir = config.uploadTempDir || require('os').tmpdir();

  data.DBList = [];
  var _numFlag = 0;

  var _timeFlag = Date.now();
  _form.on('progress', function(bytesReceived, bytesExpected) {
    if (Date.now() >= _timeFlag) {
      var _percentage = ((bytesReceived / bytesExpected) * 100).toFixed(2)
      logger.log(data.reqId, "[Files]".bgWhite.black + " progress: " + _percentage + "% ( " + bytesReceived + "\t/ " + bytesExpected + ")");
      _timeFlag = Date.now() + 1000;
    }
  });

  _form.parse(_request, function(error, fields, files) {
    logger.log(data.reqId, "[Files]".bgWhite.black + " progress: done...");

    if (error) {
      logger.log(data.reqId, "[Files]".bgRed + (" upload file error " + error).red);
      return callback();
    }

    for (var fileFormName in files) {
      var _file = files[fileFormName];
      var _tempPath = _file.path;
      var _uploadPath = data.renameFolder + _file.name;
      _numFlag++;

      logger.log(data.reqId, "[Files]".bgWhite.black + " " + "File Name:".bgMagenta + " " + _file.name + "\t" + "FileReneme:".bgMagenta + " " + _tempPath + " -> " + _uploadPath);
      _checkFile({ checkFile: _uploadPath }, function(err, json) {
        if (json.fileExists)
          switch (data.fileConflict) {
            case "backup":
              var _name = data.renameFolder + "bk-" + dateFormat(Date.now(), "yyyymmdd-HHMM-") + _file.name;
              fs.renameSync(_uploadPath, _name);
              logger.log(data.reqId, "[Files]".bgWhite.black + " " + "File Name:".bgMagenta + " " + _file.name + "\tFile already exists rename old one to " + _name);
              break;
            default:
              logger.log(data.reqId, "[Files]".bgWhite.black + " " + "File Name:".bgMagenta + " " + _file.name + "\tFile already exists replace...");
          }


        var _finishRename = function() {
          logger.log(data.reqId, "[Files]".bgWhite.black + " " + "File Name:".bgMagenta + " " + _file.name + "\trename is finished...");
          data.DBList.push({
            path: _uploadPath,
            name: _file.name
          });

          setTimeout(function() {
            if (data.DBList.length >= _numFlag)
              callback(data);
          });
        }

        try {
          fs.renameSync(_tempPath, _uploadPath);
          _finishRename();
        } catch (e) {
          /**********************************************
          Error: EXDEV, Cross-device link
          **********************************************/
          var is = fs.createReadStream(_tempPath);
          var os = fs.createWriteStream(_uploadPath);
          is.pipe(os);
          is.on('end', function() {
            fs.unlinkSync(_tempPath);
            _finishRename();
          });
          /*********************************************/
        }

      });
    }
  });

  return new Promise(resolve => callback = resolve);
}
exports.upload = _upload;

exports.unlink = function(data) {
  var _path = data['meta']['deleteFile'];
  var _resolve;
  var _retry = 0;
  logger.log(data.reqId, "[Files]".bgRed + " Delete file... \t" + "File Name:".bgRed + " " + _path);

  var _delete = function() {
    fs.unlink(_path, function(err) {
      if (err) {
        if (_retry < 3)
          return setTimeout(_delete, 100);
        logger.log(data.reqId, "[Files]".bgRed + (" Delete file error " + err).red);
      }
      _resolve();
    });
  }
  _delete();

  return new Promise(resolve => _resolve = resolve);
}

var _createFolder = function(folder, callback) {
  try {
    if (!fs.existsSync(folder))
      fs.mkdirSync(folder);
    return true;
  } catch (e) {
    return false;
  }
}
exports.createFolder = _createFolder;

var _copyFile = function(source, target) {
  /**********************************************
  Error: EXDEV, Cross-device link
  **********************************************/
  return new Promise(function(resolve, reject) {
    var is = fs.createReadStream(source);
    var os = fs.createWriteStream(target);
    is.pipe(os);
    is.on('end', function() {
      resolve();
    });
  })

  /*********************************************/
}
exports.copyFile = _copyFile;

var _renameFile = function(source, target) {
  try {
    fs.renameSync(source, target);
    return true;
  } catch (e) {
    console.log(e)
    return false;
  }
}
exports.renameFile = _renameFile;



exports.removeFolder = async data => {
  const _meta = data['meta'];
  const _path = _meta['delPath'];
  let _resolve;

  rimraf(_path, () => {
    _resolve();
  });

  return new Promise(resolve => _resolve = resolve);
}
