var fs = require("fs");
var logger = require("./logger.js");
var Promise =  require("promise");
var formidable = require("formidable");
var dateFormat = require('dateformat');
var config = require("../config.js");

var _check = function(data, callback){
	fs.exists(data.checkFile,function(exists){
	  // handle result
	  data.fileExists = exists;
	  callback( null, data );
	});
};
exports.check = Promise.denodeify(_check);
//exports.check = _check;


var _createFile = function(data, callback){

	fs.writeFile(data.createFile, '', function (err) {
        if (err) logger.error(err);
        else	logger.info(data.reqId, 'create file '+data.createFile);
        if(callback) callback( err, data );
    });
}
exports.createFile = Promise.denodeify(_createFile);
//exports.createFile = _createFile;

var _unlinkFile = function(data, callback){
	fs.unlink(data.dbFile, function (err) {
        if (err) logger.error(data.reqId, err);
        else	logger.info(data.reqId, 'unlink file '+data.dbFile);
        if(callback) callback(err ,data);
    });
}
exports.unlinkFile = Promise.denodeify(_unlinkFile);
//exports.unlinkFile = _unlinkFile;

var _isDirectory =  function(data, callback){
    var _pool = [];
    var _list = data.fileList;
    var _path = data.path ? (data.path.substr(-1,1)=="/" ? data.path : data.path+"/") : "";
    logger.debug(data.reqId, "get stat:"+_path);

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
    logger.debug(data.reqId, "readdir : "+ data.path);
    fs.readdir(data.path,function(err, dir){
        // handle result
        data.fileList = dir;
        _isDirectory(data, callback);
    });
}
exports.readdir = Promise.denodeify(_readdir);


var _upload = function(data, callback){
    logger.log(data.reqId, "Upload files...");
    var _request = data.request;
    var _form = new formidable.IncomingForm();
    _form.uploadDir = config.uploadTempDir || require('os').tmpdir();

    data.DBList = [];
    var _numFlag = 0;
    _form.parse(_request, function(error, fields, files) {

        if(error){
            logger.log(data.reqId, "[Files]".bgRed+(" upload file error "+error).red);

            return callback();
        }

        for(var fileFormName in files){

            var _file = files[fileFormName];
            var _tempPath = _file.path;
            var _uploadPath = data.renameFolder + _file.name;

            _numFlag++;

            _check({ checkFile :  _uploadPath},function(err, json){
                if(json.fileExists)
                    switch(data.fileConflict){
                        case "backup":
                            fs.renameSync(_uploadPath,  data.renameFolder + "bk-"+ dateFormat(Date.now(),"yyyymd-HMM-")+_file.name);
                            break;
                    }
                

                var _finishRename = function(){
                    logger.log(data.reqId, "[Files]".bgWhite.black+" "+"Form Name:".bgMagenta+" "+fileFormName+"\t"+"File Name:".bgMagenta+" "+_file.name+"\t"+"tempPath:".bgMagenta+" "+_tempPath);
                    data.DBList.push({
                        path : _uploadPath,
                        name : _file.name
                    });

                    setTimeout(function(){
                        if(data.DBList.length >= _numFlag)
                            callback( null, data);                        
                    });
                }

                try{
                    fs.renameSync(_tempPath,  _uploadPath); 
                    _finishRename();
                }catch(e){
                    /**********************************************
                    Error: EXDEV, Cross-device link
                    **********************************************/
                        var is = fs.createReadStream(_tempPath);
                        var os = fs.createWriteStream(_uploadPath);
                        is.pipe(os);
                        is.on('end',function() {
                            fs.unlinkSync(_tempPath);
                            _finishRename();
                        });
                    /*********************************************/   
                }

            });         
        }        
    });
}
exports.upload = Promise.denodeify(_upload);

var _unlink = function(data, callback){
    var _path= data.deleteFile;
    logger.log(data.reqId, "[Files]".bgRed+" Delete file... \t"+"File Name:".bgRed+" "+_path);
    fs.unlink(_path, function(err){
        err && logger.log(data.reqId, "[Files]".bgRed+(" Delete file error"+err).red);
        callback && callback();
    });        
}
exports.unlink = Promise.denodeify(_unlink);