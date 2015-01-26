$.uipage = $.uipage || {};
$.uipage.func = $.uipage.func || {};

(function(){
	_cache = {};
	var _func = $.uipage.func;

	_func.resetCache = function(type){
		if(type)
			delete _cache[type];
		else
			for(var ele in _cache)
				delete _cache[ele];			
	}

	_func.checkDateFormat = function(){
		
		for(var  i in arguments){
			var date = arguments[i]
			if(!(new Date(date) !== "Invalid Date" && 
				 date.length === 10 && 
				 date.search(/(\d{4})-(\d{2})-(\d{2})/g) === 0
			)){
				return false;
			}
				
		};

		return true;
		
	}
	
	//********************************************
	// Record ************************************
	//********************************************
	_func.delRecord = function(data, callback){
		$.uipage.ajax({
			"url" : "record/del",
			"type" : "post",
			"data" : data,
			"callback" : function(response){
				if($.uipage.errHandler(response)) return;
				callback(response);
			}
		});
	}

	_func.setRecord = function(data, callback){
		$.uipage.ajax({
			"url" : "record/set",
			"type" : "post",
			"data" : data,
			"callback" : function(response){
				if($.uipage.errHandler(response)) return;
				callback(response);
			}
		});
	}
	
	_func.setRecordTypes = function(data, callback){
		$.uipage.ajax({
			"url" : "record/setTypes",
			"type" : "post",
			"data" : data,
			"callback" : function(response){
				if($.uipage.errHandler(response)) return;
				callback(response);
			}
		});
	}

	_func.getRecordsTypes = function(data, callback, forceUpdate){
		var _data = {
			db : data.db,
			rids_json : JSON.stringify(data.rids),
			tids_json : JSON.stringify(data.tids)
		}

		$.uipage.ajax({
			"url" : "record/getTypes",
			"type" : "post",
			"data" : _data,
			"callback" : function(response){
				if($.uipage.errHandler(response)) return;
				callback(response.data);
			}
		});

	}

	_func.getRecords = function(data, callback, forceUpdate){
		if(data.orderBy && typeof data.orderBy == "object")
			data.orderBy =  JSON.stringify(data.orderBy)

		$.uipage.ajax({
			"url" : "record/get",
			"type" : "post",
			"data" : data,
			"callback" : function(response){
				if($.uipage.errHandler(response)) return;
				callback(response);
			}
		});
	}

	_func.getRecordsAndType = function(data, callback){
		var _getType_Flag = false;
		var _getRecords_Flag = false;
		var _data = { db : data.db };
		var _res = {};

		var _parse = function(){
			if(!_getType_Flag || !_getRecords_Flag ) return;

			_res.records.data.forEach(function(record){
				record.types = {};
				record.typesLength = 0;

				record.tids && record.tids.split(",").forEach(function(tid){
					record.types[tid] = _func.getTypeById(tid);
					record.typesLength += 1;
				});
			});
			
			callback(_res.records.data);
		}

		_func.getRecords(data, function(response){
			_getRecords_Flag = true;
			_res.records = response;
			_res.recordsId = {};

			response.data.forEach(function(item){
				_res.recordsId[item.rid] = item;
			});

			_parse();

		});

		_func.getType(_data, function(response){
			_getType_Flag = true;
			_parse();
		});
	}

	//********************************************
	// Currency **********************************
	//********************************************
	_func.getCurrency = function(data, callback, forceUpdate){
		if(!forceUpdate && _cache.currency) return callback(_cache.currency);

		$.uipage.ajax({
			"url" : "currency/get",
			"type" : "post",
			"data" : data,
			"callback" : function(response){
				delete _cache.currency;
				delete _cache.currencyType;
				delete _cache.currencyId;
				delete _cache.currencyMaps;
				delete _cache.currencyMapsById;

				response.data.sort(function(a,b){
					// new -> old
					if(a.date == b.date) return a.cid - b.cid;
					else return a.date - b.date;
				});

				response.data.forEach(function(record){
					if(!record.to_cid)
						$.uipage.storage("MyAM_mainCurrency", record.cid);
					
					record.main = record.main ? true : false;
					record.quickSelect = record.quickSelect ? true : false;
				});				

				_cache.currency = response.data;
				callback(_cache.currency);	
			}
		});
	}

	_func.delCurrency = function(data, callback){
		$.uipage.ajax({
			"url" : "currency/del",
			"type" : "post",
			"data" : data,
			"callback" : function(response){
				callback(response);	
			}
		});
	}

	_func.setCurrency = function(data, callback){
		$.uipage.ajax({
			"url" : "currency/set",
			"type" : "post",
			"data" : data,
			"callback" : function(response){
				if($.uipage.errHandler(response)) return;
				callback(response);
			}
		});
	}

	_func.getCurrencyType = function(data, callback, forceUpdate){
		if(!forceUpdate && _cache.currencyType) return callback(_cache.currencyType);

		var _parse = function(response){
			delete _cache.currencyType;
			if($.uipage.errHandler(response)) return;

			_cache.currencyType={};

			response.forEach(function(i){
				_cache.currencyType[i.type] = _cache.currencyType[i.type] || i;
			});

			callback(_cache.currencyType);	
		}

		_func.getCurrency(data, _parse, forceUpdate);

	}

	_func.getCurrencyId = function(data, callback, forceUpdate){
		if(!forceUpdate && _cache.currencyId) return callback(_cache.currencyId);

		var _parse = function(response){
			delete _cache.currencyId;delete _cache.currencyType;
			if($.uipage.errHandler(response)) return;

			_cache.currencyId={};
			
			response.forEach(function(i){
				_cache.currencyId[i.cid] = i;
			});

			callback(_cache.currencyId);	
		}

		_func.getCurrency(data, _parse, forceUpdate);
	}


	_func.getCurrencyMaps = function(data, callback, forceUpdate){
		if(!forceUpdate && _cache.currencyMaps) return callback(_cache.currencyMaps, _cache.currencyMapsById);

		var _parse = function(response){
			delete _cache.currencyMaps;
			delete _cache.currencyMapsById;
			if($.uipage.errHandler(response)) return;

			_cache.currencyMaps=[];
			var _temp = {};
			var _tempSeries = {};

			response.forEach(function(i){
				if(!_tempSeries[i.cid]){
					_tempSeries[i.cid] = { sup : [], sub : [] };
					_temp[i.cid] = _tempSeries[i.cid];
				}
				
				if(i.to_cid && !_tempSeries[i.to_cid]){
					_tempSeries[i.to_cid] = { sup : [], sub : [] };
					_temp[i.to_cid] = _tempSeries[i.to_cid];
				}

				_tempSeries[i.cid].data = i;

				if(i.to_cid){
					_tempSeries[i.cid].sup.push(_tempSeries[i.to_cid]);
					_tempSeries[i.to_cid].sub.push(_tempSeries[i.cid]);

					if(_temp[i.cid]) 
						delete _temp[i.cid];
				}
			});

			for(var i in _temp){
				_cache.currencyMaps.push(_temp[i])
			}
			_cache.currencyMapsById = _temp;

			callback(_cache.currencyMaps, _cache.currencyMapsById);	
		}

		_func.getCurrency(data, _parse, forceUpdate);
	}



	//********************************************
	// Type **************************************
	//********************************************
	_func.getType = function(data, callback, forceUpdate){
		if(!forceUpdate && _cache.type) return callback(_cache.type);

		$.uipage.ajax({
			"url" : "type/get",
			"type" : "post",
			"data" : data,
			"callback" : function(response){
				delete _cache.type;
				
				_func.resetCache("typeById");

				if($.uipage.errHandler(response)) return;

				if(!response.data) return callback(response.data);

				response.data.forEach(function(e){
					e.master = e.master ? true : false;
					e.quickSelect = e.quickSelect ? true : false;
					e.showInMap = e.showInMap ? true : false;
				});

				_cache.type = response.data;
				callback && callback(_cache.type);	
			}
		});
	}

	_func.getTypeById = function(tid, forceUpdate){
		if(!forceUpdate && _cache.typeById) return tid ? _cache.typeById[tid] : _cache.typeById;

		delete _cache.typeById;
		_cache.typeById = {};

		_cache.type.forEach(function(e){
			_cache.typeById[e.tid] = e;
		})

		return tid ? _cache.typeById[tid] : _cache.typeById;
	}


	_func.getTypeMaps = function(data, callback, forceUpdate){
		if(!forceUpdate && _cache.typeMaps) return callback(_cache.typeMaps);

		$.uipage.ajax({
			"url" : "type/getMaps",
			"type" : "post",
			"data" : data,
			"callback" : function(response){
				delete _cache.typeMaps;
				if($.uipage.errHandler(response)) return;

				_cache.typeMaps = {};

				response.data.forEach(function(e){
					_cache.typeMaps[e.tid] = _cache.typeMaps[e.tid] || { sup :[], sub : []};
					_cache.typeMaps[e.tid].sub.push(e.sub_tid)

					_cache.typeMaps[e.sub_tid] = _cache.typeMaps[e.sub_tid] || { sup :[], sub : []};
					_cache.typeMaps[e.sub_tid].sup.push(e.tid)
				});
				callback && callback(_cache.typeMaps);	
			}
		});		
	}

	var _recursiveBuildTypeMaps = function(tid, _series){
		_series = _series || {};

		if( _series[tid] ) return;
		
		_series[tid] = true;

		var _list = [];
		
		_cache.typeMaps[tid] && _cache.typeMaps[tid].sub.forEach(function(e){
				var _typeMaps = _recursiveBuildTypeMaps(e, _series);
				_list.push({
			  		data : _func.getTypeById(e),
			  		sub : _typeMaps
			  	});
		});
		
		return {list : _list, series: _series};
	}

	_func.buildTypeMaps = function(data, callback, forceUpdate){
		var _getTypeFlag = false;
		var _getTypeMapsFlag = false;

		var _parse = function(){
			if(!_getTypeFlag || !_getTypeMapsFlag) return;

			var tidMaps = [];
			var unclassified = [];
			var unclassifiedSeries = {};

			
			_cache.type.forEach(function(obj){
			  	if(obj.master){
			  		var _typeMaps = _recursiveBuildTypeMaps(obj.tid);
			  		tidMaps.push({
				  		data : _func.getTypeById(obj.tid),
				  		sub : _typeMaps
				  	});

			  		$.extend(unclassifiedSeries,_typeMaps.series);
			  	}
			});

			_cache.type.forEach(function(obj){
			  	if(!obj.master){
			  		if(!_cache.typeMaps[obj.tid] || !_cache.typeMaps[obj.tid].sup.length || !unclassifiedSeries[obj.tid] ){
			  			var _typeMaps = _recursiveBuildTypeMaps(obj.tid);
				  		unclassified.push({
					  		data : _func.getTypeById(obj.tid),
					  		sub : _typeMaps
					  	});

					  	$.extend(unclassifiedSeries,_typeMaps.series);
					 }
					 unclassifiedSeries[obj.tid] = true;
			  	}
			});
						
			callback(tidMaps, unclassified);
		}
		_func.getType(data 		,function(){ _getTypeFlag=true;		_parse(); }, forceUpdate);
		_func.getTypeMaps(data 	,function(){ _getTypeMapsFlag=true;	_parse(); }, forceUpdate);
	}

	_func.setType = function(data, callback){
		$.uipage.ajax({
			"url" : "type/set",
			"type" : "post",
			"data" : data,
			"callback" : function(response){
				if($.uipage.errHandler(response)) return;
				callback(response);
			}
		});
	}

	_func.delType = function(data, callback){
		$.uipage.ajax({
			"url" : "type/del",
			"type" : "post",
			"data" : data,
			"callback" : function(response){
				if($.uipage.errHandler(response)) return;
				callback(response);
			}
		});
	}

	_func.setTypeMaps = function(data, callback){
		$.uipage.ajax({
			"url" : "type/setMaps",
			"type" : "post",
			"data" : data,
			"callback" : function(response){
				if($.uipage.errHandler(response)) return;
				callback(response);
			}
		});
	}

	_func.delTypeMaps = function(data, callback){
		$.uipage.ajax({
			"url" : "type/delMaps",
			"type" : "post",
			"data" : data,
			"callback" : function(response){
				if($.uipage.errHandler(response)) return;
				callback(response);
			}
		});
	}

})();