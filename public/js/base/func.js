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
				response.data.sort(function(a,b){
					// new -> old
					if(a.date == b.date) return a.cid - b.cid;
					else return a.date - b.date;
				});

				_cache.currency = response.data;
				callback(_cache.currency);	
			}
		});
	}

	_func.getCurrencyType = function(data, callback, forceUpdate){
		if(!forceUpdate && _cache.currencyType) return callback(_cache.currencyType);

		var _parse = function(response){
			delete _cache.currencyType;
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
			delete _cache.currencyId;
			_cache.currencyId={};
			
			response.forEach(function(i){
				_cache.currencyId[i.cid] = i;
			});

			callback(_cache.currencyId);	
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
				response.data.sort(function(a,b){
					// new -> old
					if(a.date == b.date) return a.cid - b.cid;
					else return a.date - b.date;
				});

				_cache.type = response.data;
				callback(_cache.type);	
			}
		});
	}
})();