$.uipage = $.uipage || {};
$.uipage.angular = $.uipage.angular || {};
$.uipage.angular.MVC_Template = $.uipage.angular.MVC_Template || [];
$.uipage.SCOPE = {};
(function(){

	var _views = {};
	var _temp = {
		name : "lobby.setting.showcurrency",
		state : {
			url : "/showcurrency",
			resolve : {},
			views : _views,
			//abstract : true
		}
	};


	_views['setting-view'] = {
		templateUrl : 	$.uipage.templateURL+'08.showCurrency.html',
		controller	: 	['$scope', '$http', 'i18n', function($scope, $http, i18n) {
							$.log("initial \""+_temp.name+"\" controller ...");
							
							var _controller = $.uipage.angular.controller[_temp.name] = {};
							_controller.scope = $scope;
							_controller.http = $http;
							$scope.data = $scope.data || {};
							$scope.i18n = i18n;
							$scope.str = $scope.str || {};
							$scope.addData = {};
							$scope.addData.to_cid = parseInt($.uipage.storage("MyAM_mainCurrency"));
							$scope.addData.date = new Date().format("Y-m-d");
							$scope.addData.quickSelect = true;

							$scope.currencies = null;
							$scope.currencyId = {};

							var _data = { db : $.uipage.storage("MyAM_userDB") };

							var _initialData = function(forceupdate){
								$.uipage.func.getCurrency(_data, function(response){
									$scope.currencies = response;

									$.uipage.func.getCurrencyMaps(_data, function(response){
										$scope.currencyMaps = response;
										$scope.addData.to_cid = parseInt($.uipage.storage("MyAM_mainCurrency"));
									});

									$.uipage.func.getCurrencyId(_data, function(response){
										$scope.currencyId = response;
									});

								},forceupdate);

							
							}
							_initialData();

							$scope.setCurrency = function(currency){
								var _data = {
									db 		: $.uipage.storage("MyAM_userDB"),
									cid 	: currency.cid,
									type	: currency.type,
									to_cid	: currency.to_cid,
									main 	: currency.main,
									memo	: currency.memo,
									rate 	: currency.rate,
									date 	: currency.date,
									quickSelect 	: currency.quickSelect
								}
								
								currency.invalid_type = !currency.type
								currency.invalid_rate = !(currency.rate*1);
								currency.invalid_date = (new Date(currency.date) == "Invalid Date");

								if(currency.invalid_type || currency.invalid_rate || currency.invalid_date)
									return;
								
								
								_data.type = currency.type.toUpperCase()
								
								$.uipage.func.setCurrency(_data,function(response){
									if(currency.isChange)
										currency.isChange = false;
									else
										_initialData(true);
								})
							}

							$scope.deleteItem = function(currency){
								var _data = {
									db 		: $.uipage.storage("MyAM_userDB"),
									del_cid 	: currency.cid
								}
								$.uipage.func.delCurrency(_data,function(response){
									if(response.code==200){
/*										currency.isDeleted = true;
										currency.doubleCheckDelete =false;
										currency.isChange=false;
										delete currency.cid;*/
										_initialData(true);
									}else{
										$.uipage.alert($scope.i18n.code[response.message.replace(/"/g,"")] || response.message)
									}

								})								
							}

							$scope.emptyAddDateRate = function(){
								$scope.addData.rate = null;
							}

							$scope.str.to_cid = function(currency){
								var _divStr = " / ";
								if(currency.memo)
									return currency.type + _divStr + currency.memo +_divStr + currency.date;
								else
									return currency.type + _divStr + currency.date;
							}

							$scope.str.rate_placeholder = function(){
								if(!$scope.addData.to_cid && $scope.addData.type){
									return "1 "+$scope.currencyId[$.uipage.storage("MyAM_mainCurrency")].type+" = ? "+$scope.addData.type ;
								}

								if($scope.addData.type && $scope.addData.to_cid){
									return "1 "+$scope.addData.type+" = ? "+ $scope.currencyId[$scope.addData.to_cid].type;
								}else{
									return i18n.showCurrency.rate_placeholder;
								}
							}

				        }]
	};


	$.uipage.angular.MVC_Template.push(_temp);

})();