var fs = require("fs");
var logger = require("./logger.js");
var Promise =  require("promise");
var formidable = require("formidable");

var _check = function(data, callback){
	fs.exists(data.dbFile,function(exists){
	  // handle result
	  data.dbFileExists = exists;
	  callback( null, data );
	});
};
exports.check = Promise.denodeify(_check);
//exports.check = _check;


var _createFile = function(data, callback){

	fs.writeFile(data.dbFile, '', function (err) {
        if (err) logger.error(err);
        else	logger.info('create file '+data.dbFile);
        if(callback) callback( err, data );
    });
}
exports.createFile = Promise.denodeify(_createFile);
//exports.createFile = _createFile;

var _unlinkFile = function(data, callback){
	fs.unlink(data.dbFile, function (err) {
        if (err) logger.error(err);
        else	logger.info('unlink file '+data.dbFile);
        if(callback) callback(err ,data);
    });
}
exports.unlinkFile = Promise.denodeify(_unlinkFile);
//exports.unlinkFile = _unlinkFile;

var _isDirectory =  function(data, callback){
    var _pool = [];
    var _list = data.fileList;
    var _path = data.path ? (data.path.substr(-1,1)=="/" ? data.path : data.path+"/") : "";
    logger.debug("get stat:"+_path);

    _list.forEach(function(dir){
        fs.stat( _path + dir, function(err, stats){
            _pool.push({ name : dir, isDir : stats.isDirectory()});
            if(_list.length == _pool.length){
                data.fileList = _pool;
                callback( null, data)
            }
        })
    })
}
exports.isDirectory = Promise.denodeify(_isDirectory);

var _readdir = function(data, callback){
    logger.debug("readdir : "+ data.path);
    fs.readdir(data.path,function(err, dir){
        // handle result
        data.fileList = dir;
        _isDirectory(data, callback);
    });
}
exports.readdir = Promise.denodeify(_readdir);


var _upload = function(data, callback){
    logger.log("Request handler 'upload' was called.");
    var _request = data.request;
    var _form = new formidable.IncomingForm();
    _form.parse(_request, function(error, fields, files) {
        console.log("files".bgRed,files);
        var _tempPath = files.upload.path;
        var _uploadPath = data.renameFolder + files.upload.name;
        /**********************************************
        Error: EXDEV, Cross-device link
        **********************************************/
        //  fs.renameSync(_tempPath,  _uploadPath);
        /*********************************************/
            var is = fs.createReadStream(_tempPath);
            var os = fs.createWriteStream(_uploadPath);
            is.pipe(os);
            is.on('end',function() {
                fs.unlinkSync(_tempPath);
            });
        /*********************************************/

        callback( null, data);
    });
}
exports.upload = Promise.denodeify(_upload);