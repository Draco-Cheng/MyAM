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
		controller	: 	['$scope', '$http', 'i18n', function($scope, $http, i18n) {
							$.log("initial \""+_temp.name+"\" controller ...");
							var _controller = $.uipage.angular.controller[_temp.name] = {};
							_controller.scope = $scope;
							_controller.http = $http;

							$scope.data = $scope.data || {};
							$scope.i18n = i18n;
							$scope.str = $scope.str || {};

							var _getdbList = function(callback){
								$.uipage.ajax({
									url : "db/dbList",
									type : "get",
									callback : function(json){
										if(json.successful){
											$scope.databases = json.data;
											callback && callback();
										}
											
									}
								});								
							}
							_getdbList();


							var _fileNameChanged = function(){
								var _uploadDBfile = $("#uploadOrChoose #uploadDBfile");
								var _progressBlock = $("<div>").addClass("progress-block");
								var _progressMsg = $("<div>").addClass("progress-msg");
								var _progressBar = $("<div>").addClass("progress-bar");
								var _file = _uploadDBfile[0].files[0];
								_uploadDBfile.val("");

								_progressBlock.append(_progressMsg).append(_progressBar).appendTo("#progress-panel");

								$.uipage.formApi.uploadFiles({
									name : "fileUpload",
									files : _file,
									progressCallback : function(percentage){
										var _percentage  = (percentage*100).toFixed(2) + "%";

										if(_percentage==="100.00%")
											_progressMsg.html(i18n.uploadOrChoose["porting"]+" - "+_file.name)
										else
											_progressMsg.html(_percentage+" - "+_file.name);

										_progressBar.width(_percentage);										
									},
									callback : function(json){
										var _response = json[0];
										$scope.selectDatabase = "";

										if(_response.isCorrect){
											_getdbList(function(){
												_progressBar.addClass("done");
												_progressMsg.html(i18n.uploadOrChoose["uploadFinish"]+" - "+_file.name);
												$("#uploadOrChoose select").val(_file.name);
												$.uipage.storage("MyAM_userDB", _file.name);
											});
										}else{
											var _error = i18n.code[_response.message.code] || "";
											_progressMsg.html( _error+"-"+_file.name)
											_progressBar.addClass("error");											
										}
										$.uipage.forceRerender();										
									}
								})
							};

							$scope.selectOption = function(database){
								if(database==="__upload__"){
									$("#uploadDBfile")[0].onchange = _fileNameChanged;
									$("#uploadDBfile").click();
									$("#uploadOrChoose select").val("");
									$.uipage.storage("MyAM_userDB", "");
								}else{
									$.uipage.storage("MyAM_userDB", database);
								}
							}

							$scope.done = function(){
								if($.uipage.storage("MyAM_userDB"))
									$.uipage.redirect("lobby");
							}
		}]
	};


	$.uipage.angular.MVC_Template.push(_temp);

})();