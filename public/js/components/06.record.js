$.uipage = $.uipage || {};
$.uipage.angular = $.uipage.angular || {};
$.uipage.angular.MVC_Template = $.uipage.angular.MVC_Template || [];
$.uipage.SCOPE = {};
(function(){

	var _views = {};
	var _temp = {
		name : "lobby.record",
		state : {
			url : "/record",
			resolve : {},
			views : _views,
			//abstract : true
		}
	};


	_views['lobby-view'] = {
		templateUrl : 	$.uipage.templateURL+'06.record.html',
		controller	: 	['$scope', '$http', 'i18n', function($scope, $http, i18n) {
							$.log("initial \""+_temp.name+"\" controller ...");
							var _controller = $.uipage.angular.controller[_temp.name] = {};
							var _defaultData = { db : $.uipage.storage("MyAM_userDB")};
							
							$scope.default_cid = parseInt($.uipage.storage("MyAM_tempCurrency")) || parseInt($.uipage.storage("MyAM_mainCurrency"));

							_controller.scope = $scope;
							_controller.http = $http;
							$scope.data = $scope.data || {};
							$scope.i18n = i18n;
							$scope.str = $scope.str || {};

							//****************************
							//addData*********************
							$scope.addData = {};
							$scope.addData.date = new Date().format("Y-m-d");
							$scope.addData.types = {};
							$scope.addData.typesLength = 0;
							$scope.addData.cashType = -1;
							$scope.addData.cid = $scope.default_cid;
							//****************************


							//****************************
							//addData*********************
							$scope.filter = {};
							$scope.filter.db = _defaultData.db;
							
							$scope.filter.cashType = null;
							$scope.filter.start_date = null;
							$scope.filter.end_date = null;

							$scope.filter.memo = null;
							$scope.filter.value_greater = "";
							$scope.filter.value_less = "";

							$scope.filter.types = {};
							$scope.filter.typesLength = 0;

							$scope.filter.orderCol = "rid";
							$scope.filter.orderBy = "DESC";
							$scope.filter.limit = "10";

							$scope.filter.cid = null;
							$scope.filter.type_query_set = "intersection";

							//****************************	

							//****************************
							//addData*********************
							var _defaultSummary = {
									length : 0,
									cost : 0,
									ex_cost : 0,
									exp_cost : 0,
									income : 0,
									ex_income : 0,
									exp_income : 0,
									sum : 0
								};

							var _summarize = function(records){
								var _currencyId = null;
								var _flatTypeMaps = null;
								var _parse = function(){

									if(!_currencyId || !_flatTypeMaps || !records) return;
									var _total = {};
									records.forEach(function(record){
										if(!record.rid) return;
										
										var _currencyType = _currencyId[record.cid].type;
										var _typeList = {};
										var _totalSUM = _total[_currencyType] = _total[_currencyType] || $.extend({ label : _currencyType }, _defaultSummary);
										var _exData = $scope.getRecordExchangeRate(record);

										if(record.cashType == -1){
											_totalSUM.cost += record.value*1;
											_totalSUM.ex_cost += record.value*_exData.rate;
											_totalSUM.exp_cost += record.value*_exData.preciseRate;
										}else{
											_totalSUM.income += record.value*1;
											_totalSUM.ex_income += record.value*_exData.rate;
											_totalSUM.exp_income += record.value*_exData.preciseRate;
										}
										_totalSUM.ex_label = _totalSUM.ex_label || _exData.to_label;
										_totalSUM.length+=1;


										record.tids && record.tids.split(",").forEach(function(tid){
											_flatTypeMaps[tid].sup.forEach(function(sup_tid){
												_typeList[sup_tid] = _flatTypeMaps[sup_tid];
												_typeList[sup_tid].summary = _typeList[sup_tid].summary || {};
												var _SUM = _typeList[sup_tid].summary[_currencyType] = _typeList[sup_tid].summary[_currencyType] || $.extend({ label : _currencyType }, _defaultSummary);

												if(record.cashType == -1){
													_SUM.cost += record.value*1;
													_SUM.ex_cost += record.value*_exData.rate;
													_SUM.exp_cost += record.value*_exData.preciseRate;
												}else{
													_SUM.income += record.value*1;
													_SUM.ex_income += record.value*_exData.rate;
													_SUM.exp_income += record.value*_exData.preciseRate;
												}

												_SUM.ex_label = _SUM.ex_label || _exData.to_label;
												_SUM.length+=1;

											});
										});										
									});

									

									for(var _summaryId in _flatTypeMaps){
										var _summaries = _flatTypeMaps[_summaryId].summary;
										for(var _currencyType in _summaries ){
											var _summary = _summaries[_currencyType];
											_summary.sum = _summary.income - _summary.cost;
											_summary.ex_sum = _summary.ex_income - _summary.ex_cost;
											_summary.exp_sum = _summary.exp_income - _summary.exp_cost;
										}											
									}

									var _totalSUM = $.extend({}, _defaultSummary);
									var _totalLength = 0;
									for(var _currencyType in _total ){
										var _summary = _total[_currencyType];
										_summary.sum = _summary.income - _summary.cost;
										_summary.ex_sum = _summary.ex_income - _summary.ex_cost;
										_summary.exp_sum = _summary.exp_income - _summary.exp_cost;

										_totalSUM.ex_income += _summary.ex_income;
										_totalSUM.exp_income += _summary.exp_income;
										_totalSUM.ex_cost += _summary.ex_cost;
										_totalSUM.exp_cost += _summary.exp_cost;
										_totalSUM.label = _totalSUM.label || _summary.ex_label;
										_totalSUM.length += _summary.length;
										_totalLength++;
									}

									_totalSUM.ex_sum = _totalSUM.ex_income - _totalSUM.ex_cost;
									_totalSUM.exp_sum = _totalSUM.exp_income - _totalSUM.exp_cost;
									
									$scope.showTotalSUM = _totalLength > 1;

									$scope.summaryFlatMaps = _flatTypeMaps;
									$scope.totalSummaries = _total;
									$scope.totalSummary = { "sum" : _totalSUM };
								};

								$.uipage.func.createFlatTypeMaps(_defaultData, function(response){
									_flatTypeMaps = response;
									_parse();
								});
								$.uipage.func.getCurrencyId(_defaultData, function(response){
									_currencyId = response;
									_parse();
								});
							}
							//****************************							

							$scope.str.to_cid = function(currency){
								var _divStr = " / ";
								if(currency.memo)
									return currency.type + _divStr + currency.memo +_divStr + currency.date;
								else
									return currency.type + _divStr + currency.date;
							}

							$scope.str.filterSelectType = function(){
								return $scope.filter.typesLength? i18n.record.type : i18n.record.alltype;
							}
							
							var _getRecords = function(forceUpdate){
								delete $scope.records;
								var _filter = $scope.filter;
								var _data = {};
								_data.db = _defaultData.db;
								_data.cashType = _filter.cashType || null;
								_data.cid = _filter.cid || null;
								_data.orderBy = [_filter.orderCol, _filter.orderBy];
								_data.start_date = _filter.start_date || null;
								_data.end_date = _filter.end_date || null;
								_data.type_query_set = _filter.type_query_set;
								_data.absoluteQuery = _filter.absoluteQuery;


								if(_data.start_date)
									_data.invalidDate = !$.uipage.func.checkDateFormat(_data.start_date);
								if(!_data.invalidDate && _data.end_date)
									_data.invalidDate = !$.uipage.func.checkDateFormat(_data.end_date);
								
								if(_data.invalidDate)
									return;

								_data.memo = _filter.memo;
								_data.value_greater = _filter.value_greater;
								_data.value_less = _filter.value_less;
								
								var _tids = [];
								for(var i in $scope.filter.types){
									_tids.push(i)
								}
								if(_tids.length)
								_data.tids = _tids;
								
								_data.limit = _filter.limit || null;

								$.uipage.func.getRecordsAndType(_data, function(records){
									_summarize(records);
									$scope.renderLimit = 50;
									$scope.records = records;

								},forceUpdate);
							}
							$scope.getRecords = _getRecords;
							var _initial = function(forceUpdate){
								$.uipage.func.getType(_defaultData, function(response){
									$scope.types = response;
										$.uipage.func.buildTypeMaps(_defaultData, function(maps, unclassified){
											$scope.typeMaps = maps.concat(unclassified);
										})
								},forceUpdate);

								$.uipage.func.getCurrency(_defaultData, function(response){
									$scope.currencies = response;

									$.uipage.func.getCurrencyId(_defaultData, function(currencyId){
										$scope.currencyId = currencyId;
										_getRecords(forceUpdate);
									});									
								},forceUpdate);
							}
							_initial();

							$scope.typeQuickSelectList = function( cashType ){
								if(!$scope.types) return;
								cashType = cashType == 1 ? 1 : -1;

								return $scope.types.filter(function(data){
									if(data.cashType!==0  && cashType !== data.cashType)
										return	false;
									return	data.quickSelect;
								});
							}

							$scope.typeFilterSelectList = function( cashType ){
								if(!$scope.types) return;
								var _seletion = $scope.typeQuickSelectList(cashType);
								_seletion.unshift({ tid : '_EMPTY_', 'type_label' : 'EMPTY'});
								return _seletion;

							}

							$scope.currencyQuickSelectList = function( cid ){
								if(!$scope.currencies) return;

								return $scope.currencies.filter(function(data){
									if(data.cid == cid) return true;
									return	data.quickSelect;
								});
							}

							$scope.typeSelectionChange = function(data){
								$scope.addTypes(data.typeSelection, data);									
								data.typeSelection = "";
							}

							$scope.addTypes = function(type, data){
								if(!data.types[type.tid]){
									data.types[type.tid]  = type;
									data.typesLength++;
								}								
							}						

							$scope.removeTypes = function(type, data){
								if(data.types[type.tid]){
									delete data.types[type.tid];
									data.typesLength--;
								}								
							}

							$scope.cleanTypes = function(data){
								for(var i in data.types)
									delete data.types[i];
								data.typesLength = 0;
							}

							$scope.addRecord = function(record){
								var _data = {
									db : _defaultData.db,
									cashType : record.cashType,
									cid : record.cid,									
									value : record.value,
									memo : record.memo,
									date : record.date
								};

								record.invalidValue = !_data.value;
								if(record.invalidValue) return;

								record.invalidDate = !$.uipage.func.checkDateFormat(_data.date);
								if(record.invalidDate) return;

								$.uipage.func.setRecord(_data,function(response){
									var _rid = response.data[0].rid;
									$scope.setRecordTypes({
										rid : _rid,
										types : record.types
									},function(){
										if(record.isDeleted){
											record.isDeleted = false;
											record.isChange = false;
											record.doubleCheckDelete = false;
											record.rid = _rid;
										}else{
											_initial();
											record.value="";
											record.memo="";
											record.types={};
											record.typesLength = 0;
										}
										
									})
								})
							}

							$scope.setRecordTypes = function(data, callback){
								var _data = {
									db : _defaultData.db,
									rid: data.rid
								}
								var _tids = [];

								for(var i in data.types){
									_tids.push(i)
								}
								_data.tids_json = JSON.stringify(_tids);


								$.uipage.func.setRecordTypes(_data,function(response){
									callback && callback(response);
									_summarize($scope.records);
								})
							}

							$scope.updateItem =function(record){
								if(record.isDeleted) return;

								var _data = {
									db : _defaultData.db,
									rid : record.rid,
									cashType : record.cashType,
									cid : record.cid,
									value : record.value,
									memo : record.memo,
									date : record.date
								};

								record.invalidValue = !_data.value;

								if(record.invalidValue) return;

								record.invalidDate = !$.uipage.func.checkDateFormat(_data.date);
								if(record.invalidDate) return;
								
								$.uipage.func.setRecord(_data,function(response){
									$scope.setRecordTypes({
										rid : record.rid,
										types : record.types
									},function(){
										record.isChange = false;
									})
								})
							}

							$scope.deleteItem =function(record){
								var _data = {
									db : _defaultData.db,
									rid : record.rid
								};

								$.uipage.func.delRecord(_data,function(response){
									record.isDeleted = true;
									record.isChange = false;
									record.doubleCheckDelete = false;
									delete record.rid;
									_summarize($scope.records);
								})
							}

							$scope.addRenderLimit =function(){
								if($scope.records.length >= $scope.renderLimit)
									$scope.renderLimit+=50;
							}


							$scope.showTypeMaps = function(record){
								$.uipage.dialog("typeMaps", {
									types : record.types,
									click : function(type){						
										(record.types[type.tid] ? $scope.removeTypes : $scope.addTypes)(type, record);
										record.isChange = true;
									}
								}) 
							}

							$scope.getRecordExchangeRate = function(record){
								if(!$scope.currencyId) return;
								var _rate = $.uipage.func.currencyConverter(record.cid, $scope.default_cid,$scope.currencyId);
								return _rate;
							}

							$scope.console = function(record){
								console.log(record)
							}


							$scope.round = function(num, pos){
								typeof pos == "undefined" && ( pos = 2 );
								var size = Math.pow(10, pos);
  								return Math.round(num * size) / size;
							}
				        }]
	};


	$.uipage.angular.MVC_Template.push(_temp);

})();