var logger = require("./logger.js");
var Promise =  require("promise");
var colors = require('colors');
var sqlite3 = require('sqlite3').verbose();
var dbFile = require('./dbFile.js');

/*
	if(!exists) {
		db.run("CREATE TABLE Stuff (thing TEXT)");
	}
  
	var stmt = db.prepare("INSERT INTO Stuff VALUES (?)");
	  
	//Insert random data
	  var rnd;
	  for (var i = 0; i < 10; i++) {
	    rnd = Math.floor(Math.random() * 10000000);
	    stmt.run("Thing #" + rnd);
	  }
	  
	stmt.finalize();
*/
var _dbLogger = function(data, str){
	logger.dbLog(data.reqId, ("["+data.db.filename + " ,"+data.db.mode+"] ").grey+str);
}

var _connectDB = function(data, callback){
	logger.debug(data.reqId, "connect Database file : "+data.dbFile);
	data.db = new sqlite3.Database(data.dbFile);
	data.db.serialize(function() {
		_dbLogger(data, "open database...");
		callback(null ,data);
	});
}
exports.connectDB = _connectDB = Promise.denodeify(_connectDB);

var _closeDB = function(data, callback){
	_dbLogger(data, "close Database....");
	data.db.close();
	setTimeout(function(){
		callback(null ,data);	
	})
}
exports.closeDB = _closeDB =Promise.denodeify(_closeDB);

var _runSQL = function(data, sql, value){
	
	return new Promise(function(resolve, reject){
		var _pool = [];
		var _stamp = Date.now();
		data.resault = data.resault || [];
		_dbLogger(data, "[SQL]".bgMagenta+("["+_stamp+"][run] ").green+sql+" "+"[val]".bgMagenta+" "+ JSON.stringify(value));

		try{
			data.db.run(sql, value,function(err, row){
				if(err){
					_dbLogger(data, "[SQL]".bgRed+("["+_stamp+"] ").red+err);
					return reject(err)
				};
				if(_pool.length){
					_dbLogger(data, "[SQL]".bgMagenta+("["+_stamp+"]").green+JSON.stringify(_pool));
					data.resault.push(_pool);
				}else{
					_dbLogger(data, "[SQL]".bgMagenta+("["+_stamp+"]").green+" successful...");
				}
					
				resolve(data)
			});

		}catch(e){
			_dbLogger(data, "[SQL]".bgRed+("["+_stamp+"]").red+e);
			reject(e)
		}

	});
};
exports.runSQL = _runSQL;

var _allSQL = function(data, sql, value){
	
	return new Promise(function(resolve, reject){
		var _stamp = Date.now();
		data.resault = data.resault || [];
		_dbLogger(data, "[SQL]".bgMagenta+("["+_stamp+"][all] ").green+sql+" "+"[val]".bgMagenta+" "+ JSON.stringify(value));

		try{
			data.db.all(sql, value,function(err, row){
				if(err){
					_dbLogger(data, "[SQL]".bgRed+("["+_stamp+"] ").red+err);
					return reject(err)
				};
				if(row.length){
					_dbLogger(data, "[SQL]".bgMagenta+("["+_stamp+"]").green+JSON.stringify(row));
					data.resault.push(row);
				}else{
					_dbLogger(data, "[SQL]".bgMagenta+("["+_stamp+"]").green+" successful...");
				}
					
				resolve(data)
			});

		}catch(e){
			_dbLogger(data, "[SQL]".bgRed+("["+_stamp+"]").red+e);
			reject(e)
		}

	});
};
exports.allSQL = _allSQL;

var _getSQL = function(data, sql, value){
	
	return new Promise(function(resolve, reject){
		var _stamp = Date.now();
		data.resault = data.resault || [];
		_dbLogger(data, "[SQL]".bgMagenta+("["+_stamp+"][get] ").green+sql+" "+"[val]".bgMagenta+" "+ JSON.stringify(value));

		try{
			data.db.get(sql, value,function(err, row){
				if(err){
					_dbLogger(data, "[SQL]".bgRed+("["+_stamp+"] ").red+err);
					return reject(err)
				};
				if(row){
					_dbLogger(data, "[SQL]".bgMagenta+("["+_stamp+"]").green+JSON.stringify([row]));
					data.resault.push([row]);
				}else{
					_dbLogger(data, "[SQL]".bgMagenta+("["+_stamp+"]").green+" successful...");
				}
					
				resolve(data)
			});

		}catch(e){
			_dbLogger(data, "[SQL]".bgRed+("["+_stamp+"]").red+e);
			reject(e)
		}

	});
};
exports.getSQL = _getSQL;

var _prepareSQL = function(data, sql, value){

	return new Promise(function(resolve, reject){
		var _stamp = Date.now();
		_dbLogger(data, "[SQL]".bgMagenta+("["+_stamp+"][prepare] ").green+sql+" "+"[val]".bgMagenta+" "+ JSON.stringify(value));

		try{
			var stmt = data.db.prepare(sql, function(err){
				if(err){
					_dbLogger(data, "[SQL]".bgRed+("["+_stamp+"] ").red+err);
					return reject(err)
				};

				_dbLogger(data, "[SQL]".bgMagenta+("["+_stamp+"]").green+" successful...");
				resolve(data);
			});

			value.forEach(function(val){
				stmt.run(val);
			});

			stmt.finalize();
			

		}catch(e){
			_dbLogger(data, "[SQL]".bgRed+("["+_stamp+"]").red+e);
			reject(e)
		}

	});
};
exports.prepareSQL = _prepareSQL ;

var _eachSQL = function(data, sql, value){

	return new Promise(function(resolve, reject){
		var _pool = [];
		var _stamp = Date.now();
		data.resault = data.resault || [];
		_dbLogger(data, "[SQL]".bgMagenta+("["+_stamp+"][each] ").green+sql+" "+"[val]".bgMagenta+" "+ JSON.stringify(value));

		try{
			data.db.each(sql,function(err, row) {
					if(err){
						_dbLogger(data, "[SQL]".bgRed+("["+_stamp+"] ").red+err);
						return reject(err)
					};
			    	console.log(row.id + ": " + row.value1 + ":"+ row.value2);
			    	_pool.push(row);
		  		},
		  		function(){
					if(_pool.length){
						_dbLogger(data, "[SQL]".bgMagenta+("["+_stamp+"]").green+JSON.stringify(_pool));
						data.resault.push(_pool);
					}else{
						_dbLogger(data, "[SQL]".bgMagenta+("["+_stamp+"]").green+" successful...");
					}

					resolve(data);
				}
			);

		}catch(e){
			_dbLogger(data, "[SQL]".bgRed+("["+_stamp+"]").red+e);
			reject(e)
		}

	});
};
exports.eachSQL = _eachSQL ;

var _initialDatabase = function(data, callback){

	_dbLogger(data, "initial Database table");
	/***********************************************************
	Construction :
		user.db(SQLite)
				type	
						tid			//(timestamp) parent key
						type_label
						quickSelect	// true or false
						cashType	// cost val(-1), both cost and earn val(0), earn val(1)


				typeMap	
						tid			//(timestamp) parent key
						sub_tid		//(timestamp) parent key
						relation	//master val(0), hidden val(-1), relation tid

				data
						id			//(timestamp) parent key
						tid			//array
						cid			//currencies 
						value
						memo		
						date		//sort by date (ORDER BY "date" [ASC | DESC])

				currencies
						cid 		//(timestamp) parent key
						to_cid 		//(timestamp) parent key (default will be main currencies)
						main		// 0 or 1
						type		// TWD, USD
						memo
						rate
						date		//sort by date (ORDER BY "date" [ASC | DESC])
						showup		
						--------------------------
						+ the mian currencies
						+	rate = 1;
						+	
						+	(Standard) 		for view can tempraly change rate
						--------------------------
	***********************************************************/


	_runSQL(data,"CREATE TABLE IF NOT EXISTS type (tid BIGINT PRIMARY KEY NOT NULL, type_label TEXT, quickSelect bool, relation INT);")
		.then(function(data){ return _runSQL(data,"CREATE TABLE IF NOT EXISTS typeMap (tid BIGINT PRIMARY KEY NOT NULL, sub_tid BIGINT, relation BIGINT)"); })
		//relation : master val(0),hidden val(-1), relation tid
		.then(function(data){ return _runSQL(data,"CREATE TABLE IF NOT EXISTS data (id BIGINT PRIMARY KEY NOT NULL, tid BIGINT, cid BIGINT, value FLOAT, memo TEXT, date bigint)"); })
		.then(function(data){ return _runSQL(data,"CREATE TABLE IF NOT EXISTS currencies (cid BIGINT PRIMARY KEY NOT NULL, to_cid BIGINT, main bool, type TEXT, memo TEXT, rate FLOAT, date bigint, showup bool)"); })
		.then(function(data){
			callback(null ,data);
		});

}
exports.initialDatabase = Promise.denodeify(_initialDatabase);


var _getCurrencies = function(data, callback){

	var _sql =  "SELECT * FROM currencies ";
	if(data.cid !== undefined)
		_sql += "WHERE cid=$cid ";
	_sql = "ORDER BY date DESC";

	_getSQL(data, _sql, {$cid : data.cid}).then(function(data){callback(null ,data);})

};
exports.getCurrencies = Promise.denodeify(_getCurrencies);

var _setCurrencies = function(data, callback){

	var _sql = "INSERT OR REPLACE INTO currencies (cid , to_cid , main , type  , memo , rate , date , showup ) VALUES(?,?,?,?,?,?,?,?);";
	var _val = [[data.cid, data.to_cid, data.main, data.type, data.memo, data.rate, data.date , data.showup]];

	_prepareSQL(data, _sql, _val).then(function(data){callback(null ,data);});

};
exports.setCurrencies = Promise.denodeify(_setCurrencies);


var _checkDBisCorrect = function(data, callback){

	var _sql = "SELECT * FROM type, typeMap, data, currencies LIMIT 1";
	var _popDBList = data.DBList.pop();
	data.dbFile = _popDBList.path;

	data.dbInfo = data.dbInfo || [];
	var _dbInfo = {};
	data.dbInfo.push(_dbInfo);
	_dbInfo.name = _popDBList;

	var _checkFinish = function(){
		if(data.DBList.length)
			_checkDBisCorrect(data, callback);
		else
			callback(null ,data);		
	};

	logger.debug(data.reqId, "Check Database "+data.dbFile+" is correct or not...");

	_connectDB(data)
		.then(function(data){return _getSQL(data, _sql,[]); })
		.nodeify(function(err){
			if(err){
				_dbInfo.isCorrect = false;
				_dbInfo.message = err;
			}else{
				_dbInfo.isCorrect = true;
				_dbInfo.message = "OK";
			}

			_closeDB(data).then(function(){
				if(!_dbInfo.isCorrect){
					data.deleteFile = _popDBList.path;
					dbFile.unlink(data)
				}
					
				_checkFinish();				
			});
		})
};
exports.checkDBisCorrect = Promise.denodeify(_checkDBisCorrect);

