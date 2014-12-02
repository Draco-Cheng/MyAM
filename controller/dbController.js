var logger = require("./logger.js");
var Promise =  require("promise");
var colors = require('colors');
var sqlite3 = require('sqlite3').verbose();

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
	logger.dbLog(("["+data.db.filename + " ,"+data.db.mode+"] ").grey+str);
}

var _connectDB = function(data, callback){
	logger.debug("connect Database file : "+data.dbFile);
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
	callback(null ,data);
}
exports.closeDB = _closeDB =Promise.denodeify(_closeDB);

var _runSQL = function(data, sql, value){
	
	return new Promise(function(resolve, reject){
		var _pool = [];
		var _stamp = Date.now();
		data.resault = data.resault || [];
		_dbLogger(data, ("[SQL]["+_stamp+"][run] ").green+sql+"  [val] "+ JSON.stringify(value));

		try{
			data.db.run(sql, value,function(err, row){
				if(_pool.length){
					_dbLogger(data, (("[SQL]["+_stamp+"]").green).green+JSON.stringify(_pool));
					data.resault.push(_pool);
				}else{
					_dbLogger(data, ("[SQL]["+_stamp+"]").green+" successful...");
				}
					
				resolve(data)
			});

		}catch(e){
			_dbLogger(data, ("[SQL]["+_stamp+"]").red+e);
			reject(e)
		}

	});
};
exports.runSQL = _runSQL;

var _allSQL = function(data, sql, value){
	
	return new Promise(function(resolve, reject){
		var _stamp = Date.now();
		data.resault = data.resault || [];
		_dbLogger(data, ("[SQL]["+_stamp+"][all] ").green+sql+"  [val] ".green+ JSON.stringify(value));

		try{
			data.db.all(sql, value,function(err, row){
				if(row.length){
					_dbLogger(data, ("[SQL]["+_stamp+"]").green+JSON.stringify(row));
					data.resault.push(row);
				}else{
					_dbLogger(data, ("[SQL]["+_stamp+"]").green+" successful...");
				}
					
				resolve(data)
			});

		}catch(e){
			_dbLogger(data, ("[SQL]["+_stamp+"]").red+e);
			reject(e)
		}

	});
};
exports.allSQL = _allSQL;

var _getSQL = function(data, sql, value){
	
	return new Promise(function(resolve, reject){
		var _stamp = Date.now();
		data.resault = data.resault || [];
		_dbLogger(data, ("[SQL]["+_stamp+"][get] ").green+sql+"  [val] ".green+ JSON.stringify(value));

		try{
			data.db.get(sql, value,function(err, row){
				if(row){
					_dbLogger(data, ("[SQL]["+_stamp+"]").green+JSON.stringify([row]));
					data.resault.push([row]);
				}else{
					_dbLogger(data, ("[SQL]["+_stamp+"]").green+" successful...");
				}
					
				resolve(data)
			});

		}catch(e){
			_dbLogger(data, ("[SQL]["+_stamp+"]").red+e);
			reject(e)
		}

	});
};
exports.getSQL = _getSQL;

var _prepareSQL = function(data, sql, value){

	return new Promise(function(resolve, reject){
		var _stamp = Date.now();
		_dbLogger(data, ("[SQL]["+_stamp+"][prepare] ").green+sql+"  [val] ".green+ JSON.stringify(value));

		try{
			var stmt = data.db.prepare(sql, function(){
				_dbLogger(data, ("[SQL]["+_stamp+"]").green+" successful...");
				resolve(data);
			});

			value.forEach(function(val){
				stmt.run(val);
			});

			stmt.finalize();
			

		}catch(e){
			_dbLogger(data, ("[SQL]["+_stamp+"]").red+e);
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
		_dbLogger(data, ("[SQL]["+_stamp+"][each] ").green+sql+"  [val] ".green+ JSON.stringify(value));

		try{
			data.db.each(sql,function(err, row) {
			    	console.log(row.id + ": " + row.value1 + ":"+ row.value2);
			    	_pool.push(row);
		  		},
		  		function(){
					if(_pool.length){
						_dbLogger(data, ("[SQL]["+_stamp+"]").green+JSON.stringify(_pool));
						data.resault.push(_pool);
					}else{
						_dbLogger(data, ("[SQL]["+_stamp+"]").green+" successful...");
					}

					resolve(data);
				}
			);

		}catch(e){
			_dbLogger(data, ("[SQL]["+_stamp+"]").red+e);
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
						tid
						name

				typeMap	
						id
						tid
						relation	//master val(0),hidden val(-1), relation tid

				data
						id
						tid			//array
						memo
						value		
						cid			//currencies
						date

				currencies
						cid 		//parent key
						name
						rate
						date
						showup
						--------------------------
						+ the mian currencies
						+	cid = 0;
						+	rate = 1;
						+	
						+	(Non Standard) 	if wanna change main currencies rate will change all currencies rate
						+	(Standard) 		for view can tempraly change rate
						--------------------------
	***********************************************************/


	_runSQL(data,"CREATE TABLE IF NOT EXISTS type (tid INT PRIMARY KEY NOT NULL, name TEXT);")
		.then(function(data){ return _runSQL(data,"CREATE TABLE IF NOT EXISTS typeMap (id INT PRIMARY KEY NOT NULL, tid INT, relation TEXT)"); })
		//relation : master val(0),hidden val(-1), relation tid
		.then(function(data){ return _runSQL(data,"CREATE TABLE IF NOT EXISTS data (id INT PRIMARY KEY NOT NULL, tid INT, memo TEXT, value FLOAT, cid INT, date bigint)"); })
		.then(function(data){ return _runSQL(data,"CREATE TABLE IF NOT EXISTS currencies (cid INT PRIMARY KEY NOT NULL, to_cid INT, name TEXT, rate FLOAT, date bigint, showup bool)"); })
		.then(function(data){
			callback(null ,data);
		});

}
exports.initialDatabase = Promise.denodeify(_initialDatabase);


var _getCurrencies = function(data, callback){

	var _sql =  "SELECT * FROM currencies ";
	if(data.cid !== undefined)
		_sql += "WHERE cid=$cid";

	_getSQL(data, _sql, {$cid : data.cid}).then(function(data){callback(null ,data);})

};
exports.getCurrencies = Promise.denodeify(_getCurrencies);

var _setCurrencies = function(data, callback){

	var _sql = "INSERT OR REPLACE INTO currencies (cid , to_cid , name , rate , date , showup ) VALUES(?,?,?,?,?,?);";
	var _val = [[data.cid, data.to_cid, data.name, data.rate, data.date , data.showup]];


	_prepareSQL(data, _sql, _val).then(function(data){callback(null ,data);});

};
exports.setCurrencies = Promise.denodeify(_setCurrencies);


