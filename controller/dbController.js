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
var _valHandler = function(val){
	if(val === "true") return true;
	if(val === "false") return false;

	return val;
}

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
					data.resault.push([]);
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
					data.resault.push([]);
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
					data.resault.push([]);
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
						data.resault.push([]);
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
						cashType	// cost val(-1), both cost and income val(0), income val(1)
						master		// bool
						showInMap	// bool
						quickSelect	// bool

				typeMap	
						tid			//(timestamp) parent key
						sub_tid		//(timestamp) sub key
						sequence	//int

				record
						rid			//(timestamp) parent key
						cashType	// cost val(-1), income val(1)
						cid			//currencies 
						value
						memo		
						date		//"yyyy-mm-dd" sort by date (ORDER BY "date" DESC [ASC | DESC])

				recordTypeMap
						rid			//(timestamp) record id
						tid			//(timestamp)

				currencies
						cid 		//(timestamp) parent key
						to_cid 		//(timestamp) parent key (empty will be current main currencies)
						main		// bool 
						type		// TWD, USD, etc...
						memo
						rate
						date		//"yyyy-mm-dd" sort by date (ORDER BY "date" DESC [ASC | DESC])
						quickSelect		
						--------------------------
						+ the mian currencies
						+	rate = 1;
						+	
						+	(Standard) 		for view can tempraly change rate
						--------------------------
	***********************************************************/

	_runSQL(data,"CREATE TABLE IF NOT EXISTS type (tid BIGINT PRIMARY KEY NOT NULL, type_label TEXT, cashType INT, master bool, showInMap bool, quickSelect bool);")
		.then(function(data){ return _runSQL(data,"CREATE TABLE IF NOT EXISTS typeMap (tid BIGINT NOT NULL, sub_tid BIGINT NOT NULL, sequence INT)"); })
		.then(function(data){ return _runSQL(data,"CREATE TABLE IF NOT EXISTS record (rid BIGINT PRIMARY KEY NOT NULL,cashType INT, cid BIGINT, value FLOAT, memo TEXT, date TEXT)"); })
		.then(function(data){ return _runSQL(data,"CREATE TABLE IF NOT EXISTS recordTypeMap (rid BIGINT NOT NULL, tid BIGINT NOT NULL)"); })
		.then(function(data){ return _runSQL(data,"CREATE TABLE IF NOT EXISTS currencies (cid BIGINT PRIMARY KEY NOT NULL, to_cid BIGINT,main BOOL, type TEXT, memo TEXT, rate FLOAT, date TEXT, quickSelect bool)"); })
		.then(function(data){
			callback(null ,data);
		});

}
exports.initialDatabase = Promise.denodeify(_initialDatabase);

var _checkDBisCorrect = function(data, callback){

	var _sql = "SELECT * FROM type, typeMap, record, recordTypeMap, currencies LIMIT 1";
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

//********************************************
// Currencies ********************************

var _getCurrencies = function(data, callback){
	var _sql =  "SELECT * FROM currencies ";
	console.log()
	var _param = [];
	var _val = {};

	if(data.cid){
		_param.push("cid=$cid");
		_val.$cid = data.cid;
	}

	if(data.to_cid){
		_param.push("to_cid=$to_cid");
		_val.$to_cid = data.to_cid;
	}

	if(_param.length)
		_sql += " WHERE "+_param.join(" AND ");

	_sql += " ORDER BY date DESC";

	if(data.limit){
		_sql += " LIMIT $limit";
		_val.$limit = data.limit;
	}

	_allSQL(data, _sql, _val).then(function(data){callback(null ,data);})

};
exports.getCurrencies = Promise.denodeify(_getCurrencies);

var _setCurrencies = function(data, callback){
	var _param = [];
	var _val = [];

	["to_cid","main", "type", "memo", "rate", "date", "quickSelect"].forEach(function(each){
		if(data[each] !== undefined){
			_param.push(each);
			_val.push( _valHandler(data[each]) );
		}
	});
	
	if(data.cid){
		_val.push(data.cid);
		var _sql = "UPDATE currencies SET "+ _param.map(function(e ,n){return e+" = ? "}) + "WHERE cid = ?;";
	}else{
		_param.unshift("cid");
		_val.unshift(Date.now());
		var _sql = "INSERT INTO currencies ("+_param.join(",")+") VALUES("+_param.map(function(){return "?"}).join(",")+");";
	}

	_prepareSQL(data, _sql, [_val]).then(function(data){callback(null ,data);});
};
exports.setCurrencies = Promise.denodeify(_setCurrencies);

var _delCurrencies = function(data, callback){
	var _conditions = {
		$del_cid : data.del_cid
	};

	var _sql =   "DELETE FROM currencies WHERE  cid = $del_cid";
	_allSQL(data, _sql, _conditions).then(function(data){callback(null ,data);})

};
exports.delCurrencies = Promise.denodeify(_delCurrencies);


//********************************************
// Types *************************************

var _getTypes = function(data, callback){
	var _sql =  "SELECT * FROM type ";
	if(data.tid !== undefined)
		_sql += "WHERE tid=$tid ";

	_allSQL(data, _sql, {$tid : data.tid}).then(function(data){callback(null ,data);})
};
exports.getTypes = Promise.denodeify(_getTypes);

var _setTypes = function(data, callback){
	var _param = [];
	var _val = [];
	data.resault = [];
	
	["type_label", "cashType", "master", "showInMap", "quickSelect"].forEach(function(each){
		if(data[each] !== undefined){
			_param.push(each);
			_val.push( _valHandler(data[each]) );
		}
	});

	if(data.tid){
		_val.push(data.tid);
		var _sql = "UPDATE type SET "+ _param.map(function(e ,n){return e+" = ? "}) + "WHERE tid = ?;";
	}else{
		data.tid = Date.now();
		_param.unshift("tid");
		_val.unshift(data.tid);
		var _sql = "INSERT INTO type ("+_param.join(",")+") VALUES("+_param.map(function(){return "?"}).join(",")+");";
	}

	_prepareSQL(data, _sql, [_val]).then(function(data){
		data.resault.push([{ tid : data.tid }]);
		callback(null ,data);
	});

};
exports.setTypes = Promise.denodeify(_setTypes);

var _delTypes = function(data, callback){
	var _sql = "DELETE FROM type WHERE tid = $del_tid";
	_allSQL(data, _sql, { $del_tid : data.del_tid }).then(function(data){
		callback(null ,data);
	});
}
exports.delTypes =  Promise.denodeify(_delTypes);

var _getTypeMaps = function(data, callback){
	var _sql =  "SELECT * FROM typeMap ";
	
	if(data.tid !== undefined)
		if(data.sub_tid !== undefined)
			_sql += "WHERE tid=$tid AND sub_tid=$sub_tid ";
		else
			_sql += "WHERE tid=$tid OR sub_tid=$tid ";

	_sql += "ORDER BY sequence ASC";

	_allSQL(data, _sql, {$tid : data.tid, $sub_tid : data.sub_tid}).then(function(data){callback(null ,data);})
};
exports.getTypeMaps =  Promise.denodeify(_getTypeMaps);

var _setTypeMaps = function(data, callback){
	var _param = [];
	var _val = [];
	
	["tid", "sub_tid"].forEach(function(each){
		if(data[each] !== undefined){
			_param.push(each);
			_val.push( data[each] );
		}
	});

	var _sql = "INSERT INTO typeMap ("+_param.join(",")+") VALUES("+_param.map(function(){return "?"}).join(",")+");";

	_prepareSQL(data, _sql, [_val]).then(function(data){
		callback(null ,data);
	});

};
exports.setTypeMaps = Promise.denodeify(_setTypeMaps);

var _delTypeMaps = function(data, callback){
	var _conditions = {
		$del_tid : data.del_tid,
		$del_sub_tid : data.del_sub_tid
	};

	if(data.del_sub_tid)
		var _sql = "DELETE FROM typeMap WHERE tid = $del_tid AND sub_tid = $del_sub_tid";
	else
		var _sql = "DELETE FROM typeMap WHERE tid = $del_tid OR sub_tid = $del_tid";

	_allSQL(data, _sql, _conditions ).then(function(data){
		callback(null ,data);
	});
}
exports.delTypeMaps =  Promise.denodeify(_delTypeMaps);



//********************************************
// record ************************************
var _getRecord = function(data, callback){
	var _param = [];
	var _val = {};

	if(data.rid){
		_param.push("rid=$rid");
		_val.$rid = data.rid;
	}

	if(data.cashType){
		_param.push("cashType=$cashType");
		_val.$cashType = data.cashType;
	}

	if(data.cid){
		_param.push("cid=$cid");
		_val.$cid = data.cid;
	}

	if(data.value_greater){
		_param.push("value>=$value_greater");
		_val.$value_greater = data.value_greater;
	}

	if(data.value_less){
		_param.push("value<=$value_less");
		_val.$value_less = data.value_less;
	}

	if(data.memo){
		_param.push("memo LIKE $memo");
		_val.$memo = "%"+data.memo+"%";
	}
	
	if(data.start_date){
		_param.push("date>=$start_date");
		_val.$start_date = data.start_date;		
	}

	if(data.end_date){
		_param.push("date<=$end_date");
		_val.$end_date = data.end_date;		
	}

	if(data.rids_json){
		try{
			var _rids = JSON.parse(data.rids_json);
			
			_rids && _rids.forEach(function(rid){
				if(! /^\d{13}$/.test(rid) ) throw "invalid rid "+rid;
			});
			_param.push("rid IN ($rids)");
			_val.$rids = _rids.join(",");

		}catch(e){console.log(e)}
	}



	var _sql =  "SELECT record.*,  GROUP_CONCAT(rm.tid) AS tids FROM record LEFT OUTER JOIN recordTypeMap rm on rm.rid = record.rid ";
	if(_param.length)
		_sql += " WHERE "+_param.join(" AND ");
	_sql += " GROUP BY record.rid";

	if(data.tids_json){
		try{
			var _tidsArray = JSON.parse(data.tids_json);
			
			if(!_tidsArray || !_tidsArray.forEach)
				throw "invalid _tidsArray "+_tidsArray;

			//---check--- formate
			_tidsArray.forEach(function(tids){
				if(!tids || !tids.forEach) throw "invalid tids "+tids;
				tids.forEach(function(tid){
					if(tid !== "_EMPTY_" && ! /^\d{13}$/.test(tid) ) throw "invalid tid "+tid;
				});
			})

			var _conditions = [];

			_tidsArray.forEach(function(tids){
				var _map = tids.map(function(tid){
					if(tid === "_EMPTY_")
						return "tids IS NULL";
					else
						return "tids LIKE '%"+tid+"%'";
				});
				_conditions.push(" ( "+_map.join(" OR ")+" ) ");
			});


			
			//data.type_query_set  = (String) [∪ Union , ∩ intersection]
			var _sqlSet = " AND "; // ∩ intersection
			if(data.type_query_set == "union")
				_sqlSet = " OR "; // ∪ Union
			_sql = "SELECT * FROM ( "+_sql+" ) WHERE "+_conditions.join(_sqlSet)+" ";

		}catch(e){console.log(e)}
	}

	if(data.orderBy && /^[_a-zA-Z]{3,15}$/.test(data.orderBy[0]) ){
		_sql += " ORDER BY "+data.orderBy[0];
	}else{
		_sql += " ORDER BY date";
	}

	if(data.orderBy && data.orderBy[1] == "ASC")
		_sql += " ASC";
	else
		_sql += " DESC";
	if(data.limit){
		_sql += " LIMIT $limit";
		_val.$limit = data.limit;
	}
		
	_allSQL(data, _sql, _val).then(function(data){callback(null ,data);})

};
exports.getRecord = Promise.denodeify(_getRecord);

var _setRecord = function(data, callback){
	var _param = [];
	var _val = [];

	["cashType", "cid", "value", "memo", "date"].forEach(function(each){
		if(data[each] !== undefined){
			_param.push(each);
			_val.push( _valHandler(data[each]) );
		}
	});

	if(data.rid){
		_val.push(data.rid);
		var _sql = "UPDATE record SET "+ _param.map(function(e ,n){return e+" = ? "}) + "WHERE rid = ?;";
	}else{
		data.rid = Date.now();
		_param.unshift("rid");
		_val.unshift(data.rid);
		var _sql = "INSERT INTO record ("+_param.join(",")+") VALUES("+_param.map(function(){return "?"}).join(",")+");";
	}

	_prepareSQL(data, _sql, [_val]).then(function(data){
		data.resault = [];
		data.resault.push([{ rid : data.rid }]);
		callback(null ,data);
	}).catch(function(e){});
};
exports.setRecord = Promise.denodeify(_setRecord);

var _delRecord = function(data, callback){
	var _conditions = [];
	data.del_rid && _conditions.push("( rid="+data.del_rid+" )");	

	if(_conditions.length){
		var _sql = "DELETE FROM record WHERE "+ _conditions.join(" OR ");
		_allSQL(data, _sql).then(function(data){callback(null ,data);})
	}else{
		callback(null ,data);
	}
}
exports.delRecord =  Promise.denodeify(_delRecord);

var _getRecordTypeMap = function(data, callback){
	var _sql =  "SELECT * FROM recordTypeMap ";
	var _conditions = [];

	data.rids && data.rids.forEach(function(rid){
		(rid = parseInt(rid)) && _conditions.push("rid="+rid);
	});

	data.tids && data.tids.forEach(function(tid){
		(tid = parseInt(tid)) && _conditions.push("tid="+tid);
	});

	data.rid && (data.rid = parseInt(data.rid)) && _conditions.push("rid="+data.rid);
	data.tid && (data.tid = parseInt(data.tid)) && _conditions.push("tid="+data.tid);

	if(_conditions.length)
		_sql += "WHERE "+ _conditions.join(" OR ");

	if(data.limit){
		_sql += " LIMIT "+data.limit;
	}

	_allSQL(data, _sql).then(function(data){callback(null ,data);})
};
exports.getRecordTypeMap =  Promise.denodeify(_getRecordTypeMap);

var _addRecordTypeMap = function(data, callback){
	var _val = [];
	var _rid = parseInt( data.rid );

	data.tids_add &&  data.tids_add.length && data.tids_add.forEach(function(tid){
		var _tid = parseInt( tid );
		_tid && _val.push({
			$rid : _rid,
			$tid : _tid
		})
	});

	if(_val.length){
		var _sql = "INSERT INTO recordTypeMap ( rid , tid ) VALUES( $rid , $tid );";
		_prepareSQL(data, _sql, _val).then(function(data){
			callback(null ,data);
		}).catch(function(e){});		
	}else{
		callback(null ,data);
	}

}

var _delRecordTypeMap = function(data, callback){
	var _conditions = [];
	data.tids_del &&  data.tids_del.length && data.tids_del.forEach(function(i){
		_conditions.push("( rid="+data.rid+" AND tid="+i+" )");	
	});

	data.del_tid && _conditions.push("( tid="+data.del_tid+" )");
	data.del_rid && _conditions.push("( rid="+data.del_rid+" )");	

	if(_conditions.length){
		var _sql = "DELETE FROM recordTypeMap WHERE "+ _conditions.join(" OR ");
		_allSQL(data, _sql).then(function(data){callback(null ,data);})
	}else{
		callback(null ,data);
	}
}
exports.delRecordTypeMap =  Promise.denodeify(_delRecordTypeMap);

var _setRecordTypeMap = function(data, callback){
	_addRecordTypeMap( data, function(err, data){
		_delRecordTypeMap(data , function(err, data){
			callback(null ,data);
		})
	})
};
exports.setRecordTypeMap =  Promise.denodeify(_setRecordTypeMap);