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

							$scope.currencies = null;

							var _data = { db : $.uipage.storage("MyAM_userDB")};
							$.uipage.func.getCurrency(_data, function(response){
								if($.uipage.errHandler(response)) return;
								
								$scope.currencies = response;
							});

							$scope.str.main = function(main){
								return main ? i18n.showCurrency["main"] : i18n.showCurrency["sub"];
							};

							$scope.str.date = function(date){
								return new Date(date).format("Y-m-d");
							};

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