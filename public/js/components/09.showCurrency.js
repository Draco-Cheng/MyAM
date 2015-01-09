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
		templateUrl : 	$.uipage.templateURL+'09.showCurrency.html',
		controller	: 	['$scope', '$http', 'i18n', function($scope, $http, i18n) {
							$.log("initial \""+_temp.name+"\" controller ...");
							
							var _controller = $.uipage.angular.controller[_temp.name] = {};
							_controller.scope = $scope;
							_controller.http = $http;
							$scope.data = $scope.data || {};
							$scope.i18n = i18n;
							$scope.str = $scope.str || {};
							$scope.addData = {};
							$scope.addData.to_cid = "__main__";
							$scope.addData.date = new Date().format("Y-m-d");

							$scope.currencies = null;
							$scope.currencyId = {};

							var _data = { db : $.uipage.storage("MyAM_userDB") };

							/*var _changeToCid = function(){
								$scope.addData.to_cid = $("#showCurrency .addCurrency #to_cid").val();
								$("#showCurrency .addCurrency .input-addrate").val("");
								
								$scope.str.rate_placeholder();								
								$.uipage.forceRerender();
							}*/
							var _initialData = function(forceupdate){
								$.uipage.func.getCurrency(_data, function(response){
									$scope.currencies = response;
								},forceupdate);

								$.uipage.func.getCurrencyMaps(_data, function(response){
									$scope.currencyMaps = response;
									$scope.addData.to_cid = parseInt($.uipage.storage("MyAM_mainCurrency"));
									/*$("#showCurrency .addCurrency #to_cid")
										.val($.uipage.storage("MyAM_mainCurrency"))
										[0].onchange = _changeToCid;

									setTimeout(_changeToCid)*/
								},forceupdate);

								$.uipage.func.getCurrencyId(_data, function(response){
									$scope.currencyId = response;					
								},forceupdate);								
							}
							_initialData();

							$scope.addCurrency = function(){
								console.log($scope.addData)
								var _addData = $scope.addData;
								$.uipage.func.setCurrency({
									db 		: $.uipage.storage("MyAM_userDB"),
									type	: _addData.type.toUpperCase(),
									to_cid	: _addData.to_cid,
									memo	: _addData.memo,
									rate 	: _addData.rate,
									date 	: _addData.date,
									showup 	: _addData.showup
								},function(response){
									_initialData(true);
								})
							}

							$scope.emptyAddDateRate = function(){
								$scope.addData.rate = null;
							}

							$scope.str.to_cid = function(currency){
								var _divStr = " / ";
								if(currency.memo)
									return currency.type + _divStr + $scope.str.memo(currency.memo) +_divStr + currency.date;
								else
									return currency.type + _divStr + currency.date;
							}

							$scope.str.rate_placeholder = function(){
								if($scope.addData.to_cid === null && $scope.addData.type){
									$("#showCurrency .td-addrate").addClass("master");
									return "1 "+$scope.currencyId[$.uipage.storage("MyAM_mainCurrency")].type+" = ? "+$scope.addData.type ;
								}

								$("#showCurrency .td-addrate").removeClass("master");
								if($scope.addData.type && $scope.addData.to_cid){
									return "1 "+$scope.addData.type+" = ? "+ $scope.currencyId[$scope.addData.to_cid].type;
								}else{
									return i18n.showCurrency.inputrate;
								}								
								
							}

							$scope.str.memo = function(memo){
								switch(memo){
									case "initial_currence":
										return i18n.showCurrency["initial_currence"];
										break;
									default :
										return memo;
								}
							};
				        }]
	};


	$.uipage.angular.MVC_Template.push(_temp);

})();