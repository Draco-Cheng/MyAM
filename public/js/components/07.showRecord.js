$.uipage = $.uipage || {};
$.uipage.angular = $.uipage.angular || {};
$.uipage.angular.MVC_Template = $.uipage.angular.MVC_Template || [];
$.uipage.SCOPE = {};
(function(){

	var _views = {};
	var _temp = {
		name : "lobby.showrecord",
		state : {
			url : "/showrecord/:param1",
			resolve : {},
			views : _views,
			//abstract : true
		}
	};


	_views['lobby-view'] = {
		templateUrl : 	$.uipage.templateURL+'07.showRecord.html',
		controller	: 	['$scope', '$http','$stateParams', 'i18n', function($scope, $http, $stateParams ,i18n) {
							$.log("initial \""+_temp.name+"\" controller ...");
							console.log("param1", $stateParams.param1)
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