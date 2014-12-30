$.uipage = $.uipage || {};
$.uipage.angular = $.uipage.angular || {};
$.uipage.angular.MVC_Template = $.uipage.angular.MVC_Template || [];
$.uipage.SCOPE = {};
(function(){

	var _views = {};
	var _temp = {
		name : "lobby.setting.showtype",
		state : {
			url : "/showtype",
			resolve : {},
			views : _views,
			//abstract : true
		}
	};


	_views['setting-view'] = {
		templateUrl : 	$.uipage.templateURL+'10.showType.html',
		controller	: 	['$scope', '$http', 'i18n', function($scope, $http, i18n) {
							$.log("initial \""+_temp.name+"\" controller ...");
							
							var _controller = $.uipage.angular.controller[_temp.name] = {};
							_controller.scope = $scope;
							_controller.http = $http;
							$scope.data = $scope.data || {};
							$scope.i18n = i18n;
							$scope.str = $scope.str || {};
							$scope.addData = {};
							$scope.addData.cashType = 0;

							$.uipage.func.pa
							$.uipage.func.getTypeMaps({
								db : $.uipage.storage("MyAM_userDB")
							}, function(response){
								console.log(response);

								$scope.types = response;
							});

							$scope.removeErrorClass = function(){
								$("#type_label").removeClass("error");
							};

							$scope.addType = function(){
								var _addData = $scope.addData;
								if(!_addData.type_label)
									return $("#type_label").addClass("error");

								$.uipage.func.setType({
									"db"			: $.uipage.storage("MyAM_userDB"),
									"type_label" 	: _addData.type_label,
									"cashType" 		: _addData.cashType,
									"master" 		: _addData.master,
									"showInMap" 	: _addData.showInMap,
									"quickSelect" 	: _addData.quickSelect
								}, function(json){
									console.log(json);
								})
							}
				        }]
	};


	$.uipage.angular.MVC_Template.push(_temp);

})();