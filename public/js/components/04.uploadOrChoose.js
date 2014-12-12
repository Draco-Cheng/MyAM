$.uipage = $.uipage || {};
$.uipage.angular = $.uipage.angular || {};
$.uipage.angular.MVC_Template = $.uipage.angular.MVC_Template || [];
$.uipage.SCOPE = {};
(function(){

	var _views = {};
	var _temp = {
		name : "initialPanel.uploadOrChoose",
		state : {
			url : "/uploadOrChoose",
			resolve : {},
			views : _views,
			//abstract : true
		}
	};

	
	_views['initialPanel'] = {
		templateUrl : 	$.uipage.templateURL+'04.uploadOrChoose.html',
		controller	: 	function($scope,$http,i18n) {
							$.log("initial \""+_temp.name+"\" controller ...");
							$.uipage.angular[_temp.name] = $.uipage.angular[_temp.name] || {};
							$.uipage.angular[_temp.name].scope = $scope;
							$.uipage.angular[_temp.name].http = $http;
							$scope.data = $scope.data || {};
							$scope.i18n = i18n;
							$scope.str = $scope.str || {};
							
							$.uipage.ajax({
								url : "db/dbList",
								type : "get",
								callback : function(json){
									if(json.successful)
										$scope.databases = json.data;
								}
							});

							var _fileNameChanged = function(){
								console.log($("#uploadDBfile").val());
								$.uipage.formApi.uploadFiles({
									name : "fileUpload",
									files : $("#uploadDBfile")[0].files[0],
									progressCallback : function(percentage){
										console.log(percentage)
									},
									callback : function(){
										console.log("finished")
									}
								})
							};

							$scope.selectOption = function(database){
								if(database==="__upload__"){
									$scope.selectDatabase = "";
									$("#uploadDBfile")[0].onchange = _fileNameChanged;
									$("#uploadDBfile").click();
								}
							}

		}
	};


	$.uipage.angular.MVC_Template.push(_temp);

})();