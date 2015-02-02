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
							$scope.default_cid = parseInt($.uipage.storage("MyAM_tempCurrency")) || parseInt($.uipage.storage("MyAM_mainCurrency"));
							
							$scope.str.to_cid = function(currency){
								var _divStr = " / ";
								if(currency.memo)
									return currency.type + _divStr + currency.memo +_divStr + currency.date;
								else
									return currency.type + _divStr + currency.date;
							}

							$scope.currencyQuickSelectList = function( cid ){
								if(!$scope.currencies) return;

								return $scope.currencies.filter(function(data){
									if(data.cid == cid) return true;
									return	data.quickSelect;
								});
							}

							$scope.changeDefault_cid = function(){
								$.uipage.storage("MyAM_tempCurrency", $scope.default_cid)
							}

							var _defaultData = { db : $.uipage.storage("MyAM_userDB")};

							$.uipage.func.getCurrency(_defaultData, function(response){
								var _main = null;
								var _default_cid_isExist = false;

								response.forEach(function(currency){
									if(currency.main && !currency.to_cid)
										_main = currency.cid;

									if(currency.cid == $scope.default_cid)
										_default_cid_isExist = true;

								});

								if(!_default_cid_isExist)
									$.uipage.storage("MyAM_tempCurrency", $scope.default_cid = _main)

								$.uipage.storage("MyAM_mainCurrency", _main)


								$scope.currencies = response;


							});


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

							if(_db){
								$.uipage.ajax({
									url : "db/check",
									type : "post",
									data : { "db" : _db},
									callback : function(response){
										if($.uipage.errHandler(response)) return;
										// check and backup
										var _timestamp = parseInt($.uipage.storage("MyAM_autoBackUp_"+_db)) || 0;
										if( Date.now() - _timestamp >= 1000*60*60*24*7 )
											$.uipage.ajax({
												url : "db/backup",
												type : "post",
												data : { "db" : _db},
												callback : function(response){
													if(response.code == 200)
														$.uipage.storage("MyAM_autoBackUp_"+_db, Date.now());
												}
											});
									}
								})
							}else{
								setTimeout(function(){
									$.uipage.alert(i18n.lobby["NOT_SET_DB"], function(){
										$.uipage.redirect("initial/manageDB");
									})									
								})
							}
				        }]
	};

	_views['lobby-view@lobby'] = {
		templateUrl : 	$.uipage.templateURL+'05.lobby.index.html',
		controller	: 	['$scope', '$http', 'i18n', function($scope, $http, i18n) {
							$.log("initial \""+_temp.name+"\" -> \"lobby-view\" controller ...");
							var _controller = $.uipage.angular.controller["lobby.view"] = {};
							_controller.scope = $scope;
							_controller.http = $http;
							$scope.data = $scope.data || {};
							$scope.i18n = i18n;
							$scope.str = $scope.str || {};
				        }]
	};

	_views['lobby-dialog@lobby'] = {
		templateUrl : 	$.uipage.templateURL+'05.lobby.dialog.html',
		controller	: 	['$scope', '$http', 'i18n', function($scope, $http, i18n) {
							$.log("initial \""+_temp.name+"\" -> \"lobby-dialog\" controller ...");
							var _controller = $.uipage.angular.controller["lobby.dialog"] = {};
							_controller.scope = $scope;
							_controller.http = $http;

							$scope.i18n = i18n;
							$scope.str = $scope.str || {};


							$scope.close = function(){
								$scope.subScope = null;
								$scope.showDialog = false;
								$scope.dynamicTemplate = null;
								$scope.classname = "";
								$scope.data = {};
							}

							$scope.close();
							
							$.uipage.closeDialog = function(){ $scope.close(); }


							$.uipage.dialog = function(name, data){
								switch(name){
									case "typeMaps":
										$.uipage.func.buildTypeMaps({
											db : $.uipage.storage("MyAM_userDB")
										}, function(maps, unclassified){
											var _mapsFlag = false;
											var _unclassifiedFlag = false;
											
											for(var i = 0; i< maps.length && !_mapsFlag ; i++){
												if(maps[i].data.showInMap)  _mapsFlag= true;
											}
											
											for(var i = 0; i< unclassified.length && !_unclassifiedFlag ; i++){
												if(unclassified[i].data.showInMap) _unclassifiedFlag = true;
											}

											if(!_mapsFlag && !_unclassifiedFlag) return $.uipage.alert(i18n["typeMaps"]["noTypeMaps"]);

											$scope.data.mapsFlag = _mapsFlag;
											$scope.data.unclassifiedFlag = _unclassifiedFlag;
											
											$scope.dynamicTemplate = $.uipage.templateURL+'05.lobby.dialog.typeMaps.html';
											$scope.classname = "typeMaps";
											$scope.showDialog = true;

											$scope.data.typeMaps = maps;
											$scope.data.unclassified_typeMaps = unclassified;

											$scope.data.check = function(tid){
												return !!data.types[tid];
											}

											$scope.data.close = function(){
												$scope.close();
												data.close && data.close();	
											};
											
											$scope.data.click = data.click;
											$scope.data.types = data.types;
											
										});	
										break;

									default:
										return ;
								}

								
							}
				        }]
	};

	$.uipage.angular.MVC_Template.push(_temp);

})();