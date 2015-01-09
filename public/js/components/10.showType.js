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

							var _getTypesData = function(forceUpdate){
								$.uipage.func.getType({
									db : $.uipage.storage("MyAM_userDB")
								}, function(response){
									console.log(response);
									$scope.types = response;
								},forceUpdate);	

								$.uipage.func.buildTypeMaps({
									db : $.uipage.storage("MyAM_userDB")
								}, function(maps, unclassified){
									console.log(maps, unclassified);
									$scope.typeMaps = maps;
									$scope.unclassified_typeMaps = unclassified;

									console.log(maps)
								},forceUpdate);							
							};
							_getTypesData();

							

							$scope.removeErrorClass = function(){
								$("#type_label").removeClass("error");
							};

							$scope.addType = function(){
								var _addData = $scope.addData;
								if(!_addData.type_label)
									return $(".addType #type_label").addClass("error");

								$.uipage.func.setType({
									"db"			: $.uipage.storage("MyAM_userDB"),
									"type_label" 	: _addData.type_label,
									"cashType" 		: _addData.cashType,
									"master" 		: _addData.master,
									"showInMap" 	: _addData.showInMap,
									"quickSelect" 	: _addData.quickSelect
								}, function(json){
									if(_addData.parent_tid){
										$.uipage.func.setTypeMaps({
											"db"		: $.uipage.storage("MyAM_userDB"),
											"tid"		: _addData.parent_tid,
											"sub_tid"	: json.data[0].tid
										}, function(json){
											_getTypesData(true);
										});										
									}else
										_getTypesData(true);
								})
							}
				        }]
	};


	$.uipage.angular.MVC_Template.push(_temp);

})();