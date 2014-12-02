$.uipage = $.uipage || {};
$.uipage.angular = $.uipage.angular || {};
$.uipage.angular.MVC_Template = $.uipage.angular.MVC_Template || [];
$.uipage.SCOPE = {};
(function(){

	var _views = {};
	var _temp = {
		name : "initialPanel.createDatabase",
		state : {
			url : "/createDatabase",
			resolve : {},
			views : _views,
			//abstract : true
		}
	};

	
	_views['initialPanel'] = {
		templateUrl : 	$.uipage.templateURL+'03.createDatabase.html',
		controller	: 	function($scope,$http,i18n) {
							$.log("initial \""+_temp.name+"\" controller ...");
							$.uipage.angular[_temp.name] = $.uipage.angular[_temp.name] || {};
							$.uipage.angular[_temp.name].scope = $scope;
							$.uipage.angular[_temp.name].http = $http;
							$scope.data = $scope.data || {};
							$scope.i18n = i18n;
							
							$scope.str = $scope.str || {};
							$scope.submit = function(){
								console.log("!!!!!!!!!!!!!1",$scope.name)
							}

				        }
	};

	

	$.uipage.angular.MVC_Template.push(_temp);

})();