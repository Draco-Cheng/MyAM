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
		templateUrl : 	$.uipage.templateURL+'09.showType.html',
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
									$scope.types = response;
								},forceUpdate);	

								$.uipage.func.buildTypeMaps({
									db : $.uipage.storage("MyAM_userDB")
								}, function(maps, unclassified){
									console.log(maps,unclassified)
									$scope.typeMaps = maps;
									$scope.unclassified_typeMaps = unclassified;
								},forceUpdate);							
							};
							_getTypesData();

							

							$scope.removeErrorClass = function(){
								$(".td-type_label").removeClass("error");
							};

							$scope.setType = function(data){
								if(!data.type_label)
									return $(".addType .td-type_label").addClass("error");

								$.uipage.func.setType({
									"db"			: $.uipage.storage("MyAM_userDB"),
									"tid" 	: data.tid,
									"type_label" 	: data.type_label,
									"cashType" 		: data.cashType,
									"master" 		: data.master,
									"showInMap" 	: data.showInMap,
									"quickSelect" 	: data.quickSelect
								}, function(json){
									if(data.parent_tid){
										$.uipage.func.setTypeMaps({
											"db"		: $.uipage.storage("MyAM_userDB"),
											"tid"		: data.parent_tid,
											"sub_tid"	: json.data[0].tid
										}, function(json){
											_getTypesData(true);
										});										
									}else
										_getTypesData(true);
								})
							}

							$scope.deleteType = function(item){
								$.uipage.func.delType({
									"db"		: $.uipage.storage("MyAM_userDB"),
									"del_tid"		: item.tid
								}, function(json){
									item.isDeleted = true;
									item.isChange = false;
									item.doubleCheckDelete = false;
									delete item.tid;
								});									
							}

							$scope.delTypeMaps = function(sup_tid, type){
								$.uipage.func.delTypeMaps({
									"db"		: $.uipage.storage("MyAM_userDB"),
									"del_tid"		: sup_tid,
									"del_sub_tid"		: type.tid
								}, function(json){
									_getTypesData(true);
								});	
							}
				        }]
	};


	$.uipage.angular.MVC_Template.push(_temp);

})();