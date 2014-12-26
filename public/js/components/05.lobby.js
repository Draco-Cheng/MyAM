$.uipage = $.uipage || {};
$.uipage.angular = $.uipage.angular || {};
$.uipage.angular.MVC_Template = $.uipage.angular.MVC_Template || [];
$.uipage.SCOPE = {};
(function(){

	var _views = {};
	var _temp = {
		name : "lobby",
		state : {
			url : "/lobby",
			resolve : {},
			views : _views,
			//abstract : true
		}
	};
	_views['top'] = {
		templateUrl : 	$.uipage.templateURL+'05.lobby.menu.html',
		controller	: 	['$scope', '$http', 'i18n', function($scope, $http, i18n) {
							$.log("initial \""+_temp.name+"\" controller ...");
							var _controller = $.uipage.angular.controller[_temp.name] = {};
							_controller.scope = $scope;
							_controller.http = $http;
							$scope.data = $scope.data || {};
							$scope.i18n = i18n;
							
							$scope.str = $scope.str || {};

							$scope.str.userName = $.uipage.storage("MyAM_userDB");
				        }]
	};

	
	_views['content'] = {
		templateUrl : 	$.uipage.templateURL+'05.lobby.html',
		controller	: 	['$scope', '$http', 'i18n', function($scope, $http, i18n) {
							$.log("initial \""+_temp.name+"\" controller ...");
							var _controller = $.uipage.angular.controller[_temp.name] = {};
							_controller.scope = $scope;
							_controller.http = $http;
							$scope.data = $scope.data || {};
							$scope.i18n = i18n;
							
							$scope.str = $scope.str || {};

							var _db = $.uipage.storage("MyAM_userDB");

							if(_db)
								$.uipage.ajax({
									url : "db/check",
									type : "post",
									data : { "db" : _db},
									callback : function(response){
										if($.uipage.errHandler(response)) return;
									}
								})
							else
								setTimeout(function(){
									$.uipage.alert(i18n.lobby["NOT_SET_DB"], function(){
										$.uipage.redirect("initial/manageDB");
									})									
								})
				        }]
	};

	_views['lobby-view@lobby'] = {
		templateUrl : 	$.uipage.templateURL+'05.lobby.index.html',
		controller	: 	['$scope', '$http', 'i18n', function($scope, $http, i18n) {
							$.log("initial \""+_temp.name+"\" -> \"lobby-view\" controller ...");
							var _controller = $.uipage.angular.controller[_temp.name] = {};
							_controller.scope = $scope;
							_controller.http = $http;
							$scope.data = $scope.data || {};
							$scope.i18n = i18n;
							$scope.str = $scope.str || {};
				        }]
	};


	$.uipage.angular.MVC_Template.push(_temp);

})();