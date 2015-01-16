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
							var _addData = $scope.addData = {};
							_addData.date = new Date().format("Y-m-d");
							_addData.types = {};
							_addData.typesLength = 0;
							_addData.currency = parseInt($.uipage.storage("MyAM_tempCurrency")) || parseInt($.uipage.storage("MyAM_mainCurrency"));

							$scope.str.to_cid = function(currency){
								var _divStr = " / ";
								if(currency.memo)
									return currency.type + _divStr + currency.memo +_divStr + currency.date;
								else
									return currency.type + _divStr + currency.date;
							}

							var _initial = function(forceUpdate){
								$.uipage.func.getRecords({
									db : $.uipage.storage("MyAM_userDB"),
									limit : 10
								}, function(response){
									$scope.records = response.data;
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
									console.log("response",response)
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

							$scope.addRecord = function(){
								var _data = {
									db : $.uipage.storage("MyAM_userDB"),
									cid : $scope.addData.currency,
									value : $scope.addData.value*($scope.addData.cashType ? 1 : -1),
									memo : $scope.addData.memo,
									date : $scope.addData.date
								};

								if(!_data.value) return $(".td-value").addClass("error");
								else $(".td-value").removeClass("error");
								
								$.uipage.func.setRecord(_data,function(response){
									$scope.setRecordTypes({
										rid : response.data[0].rid,
										types : $scope.addData.types
									})
								})
							}

							$scope.setRecordTypes = function(data){
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
									console.log(response)
								})
							}
				        }]
	};


	$.uipage.angular.MVC_Template.push(_temp);

})();