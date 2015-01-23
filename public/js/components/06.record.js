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
							$scope.addData.cid = parseInt($.uipage.storage("MyAM_tempCurrency")) || parseInt($.uipage.storage("MyAM_mainCurrency"));
							//****************************

							//****************************
							//addData*********************
							$scope.filter = {};
							$scope.filter.db = $.uipage.storage("MyAM_userDB");
							$scope.filter.maxdate = null;
							$scope.filter.mindate = null;
							$scope.filter.limit = 10;
							$scope.filter.orderBy = ["rid","DESC"];
							$scope.filter.cashType = null;
							$scope.filter.cid = null;
							//****************************							

							$scope.str.to_cid = function(currency){
								var _divStr = " / ";
								if(currency.memo)
									return currency.type + _divStr + currency.memo +_divStr + currency.date;
								else
									return currency.type + _divStr + currency.date;
							}

							var _initial = function(forceUpdate){
								$.uipage.func.getRecordsAndType($scope.filter, function(response){
									$scope.records = response;
								},forceUpdate);

								$.uipage.func.getType({
									db : $.uipage.storage("MyAM_userDB")
								}, function(response){
									$scope.types = response;
								},forceUpdate);

								$.uipage.func.getCurrency({
									db : $.uipage.storage("MyAM_userDB")
								}, function(response){
									$scope.currencies = response;
								},forceUpdate);
							}
							_initial();

							$scope.typeQuickSelectList = function( cashType ){
								if(!$scope.types) return;
								cashType = cashType ? 1 : -1;

								return $scope.types.filter(function(data){
									if(data.cashType!==0  && cashType !== data.cashType)
										return	false;
									return	data.quickSelect;
								});
							}

							$scope.currencyQuickSelectList = function( cashType ){
								if(!$scope.currencies) return;

								return $scope.currencies.filter(function(data){
									return	data.quickSelect;
								});
							}

							$scope.typeSelectionChange = function(data){

								if(!data.types[data.typeSelection.tid]){
									data.types[data.typeSelection.tid] = data.typeSelection;
									data.typesLength++;
								}
									
								data.typeSelection = "";
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
									db : $.uipage.storage("MyAM_userDB"),
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
											record.types={};
											record.typesLength = 0;
										}
										
									})
								})
							}

							$scope.setRecordTypes = function(data, callback){
								var _data = {
									db : $.uipage.storage("MyAM_userDB"),
									rid: data.rid
								}
								var _tids = [];

								for(var i in data.types){
									_tids.push(i)
								}
								_data.tids_json = JSON.stringify(_tids);


								$.uipage.func.setRecordTypes(_data,function(response){
									callback && callback(response);
								})
							}

							$scope.updateItem =function(record){
								if(record.isDeleted) return;

								var _data = {
									db : $.uipage.storage("MyAM_userDB"),
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
									db : $.uipage.storage("MyAM_userDB"),
									rid : record.rid
								};

								$.uipage.func.delRecord(_data,function(response){
									record.isDeleted = true;
									record.isChange = false;
									record.doubleCheckDelete = false;
									delete record.rid;
								})
							}

				        }]
	};


	$.uipage.angular.MVC_Template.push(_temp);

})();