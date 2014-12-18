$.uipage = $.uipage || {};
$.uipage.angular = $.uipage.angular || {};
$.uipage.angular.MVC_Template = $.uipage.angular.MVC_Template || [];
$.uipage.SCOPE = {};
(function(){

	var _views = {};
	var _temp = {
		name : "greetingRoom",
		state : {
			url : "/",
			resolve : {},
			views : _views,
			//abstract : true
		}
	};

	
	_views['content'] = {
		templateUrl : 	$.uipage.templateURL+'01.greetingRoom.html',
		controller	: 	function($scope,$http,i18n) {
							$.log("initial \""+_temp.name+"\" controller ...");
							var _controller = $.uipage.angular.controller[_temp.name] = {};
							_controller.scope = $scope;
							_controller.http = $http;
							$scope.data = $scope.data || {};
							$scope.i18n = i18n;
							
							$scope.str = $scope.str || {};
				        }
	};


	$.uipage.angular.MVC_Template.push(_temp);

})();