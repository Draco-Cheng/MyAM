$.uipage = $.uipage || {};
$.uipage.angular = $.uipage.angular || {};
$.uipage.angular.MVC_Template = $.uipage.angular.MVC_Template || [];
$.uipage.SCOPE = {};
(function(){

	var _views = {};
	var _temp = {
		name : "lobby.editrecord",
		state : {
			url : "/editrecord/:param1",
			resolve : {},
			views : _views,
			//abstract : true
		}
	};


	_views['lobby-view'] = {
		templateUrl : 	$.uipage.templateURL+'06.editrecord.html',
		controller	: 	['$scope', '$http','$stateParams', 'i18n', function($scope, $http, $stateParams ,i18n) {
							$.log("initial \""+_temp.name+"\" controller ...");
							console.log($stateParams.param1)
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