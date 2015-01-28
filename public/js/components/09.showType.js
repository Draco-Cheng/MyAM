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
							$scope.addData.showInMap = true;
							$scope.addData.quickSelect = true;

							var _getTypesData = function(forceUpdate){
								$.uipage.func.getType({
									db : $.uipage.storage("MyAM_userDB")
								}, function(response){
									$scope.types = response;
								},forceUpdate);	

								$.uipage.func.buildTypeMaps({
									db : $.uipage.storage("MyAM_userDB")
								}, function(maps, unclassified){
									$scope.typeMaps = maps;
									$scope.unclassified_typeMaps = unclassified;
								},forceUpdate);							
							};
							_getTypesData();

							

							$scope.removeErrorClass = function(){
								$(".td-type_label").removeClass("error");
							};

							$scope.setType = function(data){
								data.invalid_type_label = !data.type_label;
								if(data.invalid_type_label) return;

								$.uipage.func.setType({
									"db"			: $.uipage.storage("MyAM_userDB"),
									"tid" 	: data.tid,
									"type_label" 	: data.type_label,
									"cashType" 		: data.cashType,
									"master" 		: data.master,
									"showInMap" 	: data.showInMap,
									"quickSelect" 	: data.quickSelect
								}, function(json){
									$scope.addData.type_label = "";

									if(data.parent_tid){
										$.uipage.func.setTypeMaps({
											"db"		: $.uipage.storage("MyAM_userDB"),
											"tid"		: data.parent_tid,
											"sub_tid"	: json.data[0].tid
										}, function(json){
											data.parent_tid = "";
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
								}, function(response){

									if(response.code==200){
										item.isDeleted = true;
										item.isChange = false;
										item.doubleCheckDelete = false;
										delete item.tid;
									}else{
										$.uipage.alert($scope.i18n.code[response.message.replace(/"/g,"")] || response.message)
									}
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

							$scope.showTypeMaps = function(type){
								var _types = {};

								$.uipage.dialog("typeMaps", {
									types : _types,
									click : function(data){
										if(_types[data.tid]){
											type.parent_tid = "";
											delete _types[data.tid];
										}else{
											for(var i in _types){
												delete _types[i];
											}

											_types[data.tid] = data;
											type.parent_tid = data.tid;
										}

										type.isChange = true;
									}
								}) 
							}
				        }]
	};


	$.uipage.angular.MVC_Template.push(_temp);

})();