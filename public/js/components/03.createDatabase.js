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
							var _controller = $.uipage.angular.controller[_temp.name] = {};
							_controller.scope = $scope;
							_controller.http = $http;
							$scope.data = $scope.data || {};
							$scope.i18n = i18n;
							
							$scope.str = $scope.str || {};

							$scope.submit = function(){
								if(!$.uipage.blocking()) return;

								var _dbId = $scope.name+i18n["createDatabase"]["NameSuffix"]
								$.uipage.ajax({
									url : "db/create",
									data : {
										dbId : _dbId,
										mainCurrenciesType : $scope.currencyType
									},
									callback : function(json){
										$.uipage.unblocking();
										
										if(json.successful){

										}else{
											
											var _status = json.status;
											var _message = i18n["createDatabase"][_status] || i18n["code"][_status] || json.message;

											switch(_status){
												case 409:
													$.uipage.confirm(_message.format(_dbId), function(){
														console.log("Next!!");
													})
													break;
												default:
													$.uipage.alert(_message);
											}
										}

										
									}
								})
								
							}

				        }
	};

	

	$.uipage.angular.MVC_Template.push(_temp);

})();