$.uipage = $.uipage || {};
$.uipage.angular = $.uipage.angular || {};
$.uipage.angular.MVC_Template = $.uipage.angular.MVC_Template || [];
$.uipage.angular.controller = $.uipage.angular.controller || {};



(function(){
	
	var contentApp = angular.module('contentApp', ['ui.router'])
    .run(
      [        '$rootScope', '$state', '$stateParams', '$route',
      function ($rootScope,   $state,   $stateParams ,$route) {
        $rootScope.$state = $state;
        $rootScope.$route = $route;
        $rootScope.$stateParams = $stateParams;

        $.uipage.angular.rootScope = $rootScope;
      }])

    // A RESTful factory for retreiving contacts from 'contacts.json'
  	contentApp.factory("i18n",function($http){
		return $.uipage.i18n;
  	});
    
	var _initialAngular = function(){
		$.log("Initial Angular ...")
		////////////////
		//// Module ////
		////////////////
		//$.uipage.angular.baseModule=angular.module('base',[]);
		//$.uipage.angular.baseModule.controller('commonCtrl',['$scope',function($scope) {}]);

		contentApp.config(
	    [          '$stateProvider', '$urlRouterProvider',
	      function ($stateProvider,   $urlRouterProvider) {
	      	$.log("Initial contentApp ...")
	        /////////////////////////////
	        // Redirects and Otherwise //
	        /////////////////////////////
	        /*
	        $urlRouterProvider
	          //.when('/c?id', '/contacts/:id')
	          //.when('/user/:id', '/contacts/:id')
	          .otherwise('/');*/
	      
	        //////////////////////////
	        // State Configurations //
	        //////////////////////////

	        var _MVC = $.uipage.angular.MVC_Template;
			_MVC.forEach(function(MVC){$stateProvider.state(MVC.name,MVC.state)});
    
		}]);


		//--- for delay initial angular ---
		angular.bootstrap(document, ['contentApp']);
	}
	
	$.uipage.initialAngular = function(){_initialAngular();};

	// if login token
	// login : callback : initialAngular 
	// otherwise : initialAngular
	$($.uipage.initialAngular);


	// Force refresh ui use $digest(),  $.uipage.angular.login.scope.$digest();
})();

if(!location.hash) location.hash = "/";








